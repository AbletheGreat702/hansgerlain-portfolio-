import dotenv from 'dotenv';
import { AlpacaBroker } from './broker.js';
import { calculateEMA, calculateEMASlope } from './indicators.js';
import { checkEntrySignal, checkExitSignal } from './strategy.js';
import { StateManager } from './state.js';

dotenv.config();

const SYMBOLS = (process.env.SYMBOLS || 'AAPL,TSLA,NVDA,AMD,META').split(',');
const RISK_PERCENT = parseFloat(process.env.RISK_PERCENT || '0.01');
const MAX_POSITIONS = parseInt(process.env.MAX_POSITIONS || '5');
const TAKE_PROFIT = parseFloat(process.env.TAKE_PROFIT || '0.75');
const STOP_LOSS = parseFloat(process.env.STOP_LOSS || '0.37');
const TIME_STOP_MS = parseInt(process.env.TIME_STOP_MS || '1800000');
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000');
const CIRCUIT_BREAKER = parseFloat(process.env.CIRCUIT_BREAKER || '500');

export class ScalpBot {
  constructor({ symbols, pollIntervalMs }) {
    this.symbols = symbols;
    this.pollIntervalMs = pollIntervalMs;
    this.broker = new AlpacaBroker({
      keyId: process.env.APCA_API_KEY_ID,
      secret: process.env.APCA_API_SECRET_KEY,
      paper: true
    });
    this.state = new StateManager();
    this.config = {
      takeProfit: TAKE_PROFIT,
      stopLoss: STOP_LOSS,
      timeStopMs: TIME_STOP_MS
    };
    this.running = false;
  }

  async getBarsForSymbol(symbol, limit = 50) {
    const response = await this.broker.getBars(symbol, '1Min', limit);
    return response[symbol] || response;
  }

  extractPrices(bars) {
    return bars.map(b => b.close);
  }

  calculatePositionSize(entryPrice, stopLossPrice, accountEquity) {
    const riskAmount = accountEquity * RISK_PERCENT;
    const priceRisk = entryPrice - stopLossPrice;
    return Math.floor(riskAmount / priceRisk);
  }

  async processSymbol(symbol) {
    try {
      if (this.state.checkCircuitBreaker(CIRCUIT_BREAKER)) {
        console.log('CIRCUIT BREAKER TRIGGERED — halting bot');
        this.running = false;
        return;
      }

      const bars = await this.getBarsForSymbol(symbol, 50);
      const prices = this.extractPrices(bars);
      const currentPrice = prices[prices.length - 1];

      const ema9 = calculateEMA(prices, 9);
      const ema21 = calculateEMA(prices, 21);
      const ema9Rising = calculateEMASlope(prices, 9);
      const ema21Rising = calculateEMASlope(prices, 21);

      const hasPosition = this.state.hasPosition(symbol);

      if (!hasPosition) {
        const shouldEnter = checkEntrySignal({
          price: currentPrice,
          ema9, ema21,
          ema9Rising, ema21Rising,
          hasPosition: false
        });

        if (shouldEnter) {
          const account = await this.broker.getAccount();
          const equity = parseFloat(account.equity);
          const posCount = Object.keys(this.state.getState().positions).length;

          if (posCount >= MAX_POSITIONS) {
            console.log(`Max positions (${MAX_POSITIONS}) reached, skipping ${symbol}`);
            return;
          }

          const size = this.calculatePositionSize(currentPrice, currentPrice - STOP_LOSS, equity);
          const order = await this.broker.submitOrder(symbol, size, 'buy');

          this.state.addPosition(symbol, {
            qty: size,
            entryPrice: currentPrice,
            stopLoss: currentPrice - STOP_LOSS,
            entryTime: Date.now()
          });

          console.log(`BUY ${symbol}: ${size} shares at $${currentPrice}`);
        }
      } else {
        const position = this.state.getPosition(symbol);
        const exitSignal = checkExitSignal({
          entryPrice: position.entryPrice,
          currentPrice,
          stopLoss: position.stopLoss,
          entryTime: position.entryTime,
          ema9,
          config: this.config
        });

        if (exitSignal.exit) {
          const order = await this.broker.submitOrder(symbol, position.qty, 'sell');
          this.state.removePosition(symbol, currentPrice);
          console.log(`SELL ${symbol}: ${position.qty} shares at $${currentPrice} — ${exitSignal.reason}`);
        }
      }
    } catch (err) {
      console.error(`Error processing ${symbol}:`, err.message);
    }
  }

  async runIteration() {
    for (const symbol of this.symbols) {
      await this.processSymbol(symbol);
    }
  }

  async start() {
    this.running = true;
    console.log(`Bot started. Polling ${this.symbols.join(', ')} every ${this.pollIntervalMs}ms`);

    while (this.running) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const day = now.getDay();

      const marketOpen = day >= 1 && day <= 5 && (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

      if (marketOpen) {
        await this.runIteration();
      } else {
        console.log('Market closed, waiting...');
      }

      await new Promise(resolve => setTimeout(resolve, this.pollIntervalMs));
    }
  }

  stop() {
    this.running = false;
    console.log('Bot stopped.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new ScalpBot({ symbols: SYMBOLS, pollIntervalMs: POLL_INTERVAL_MS });
  bot.start().catch(console.error);

  process.on('SIGINT', () => bot.stop());
  process.on('SIGTERM', () => bot.stop());
}
