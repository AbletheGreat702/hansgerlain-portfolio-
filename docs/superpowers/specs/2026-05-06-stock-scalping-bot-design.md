# Stock Scalping Bot — Design Spec

Date: 2026-05-06

## Overview

Automated stock scalping bot for paper trading on Alpaca, deployed on Oracle Cloud VPS. Uses EMA 9/21 crossover strategy with risk-managed position sizing.

## Architecture

Alpaca-only (no TradingView Desktop). Single Node.js process on Oracle VPS.

```
┌─────────────────┐     market data     ┌──────────────┐     orders      ┌─────────────┐
│  Alpaca /       │ ──────────────>    │  Scalp Bot   │ ─────────────> │   Alpaca    │
│  Polygon.io     │   (REST/WebSocket) │  (Node.js)   │   (SDK)       │ Paper Acct  │
└─────────────────┘                     └──────────────┘                └─────────────┘
                                           │
                                           │ EMA 9/21 calculated
                                           │ internally from bars
                                           │
                                    ┌──────▼──────┐
                                    │ State / Log │
                                    └─────────────┘
```

## Strategy: EMA 9/21 Crossover

**Entry Conditions (ALL must be true):**
1. Price crosses above EMA 9 and EMA 9 > EMA 21 (uptrend)
2. EMA 9 and EMA 21 are both sloping upward (rising)
3. Not already in a position for that symbol

**Exit Conditions (ANY triggers exit):**
1. Take Profit: +$0.50–$1.00 per share from entry
2. Stop Loss: -$0.25–$0.50 per share (2:1 reward:risk)
3. EMA Cross: Price closes below EMA 9 (trend reversal)
4. Time Stop: Position held longer than 30 minutes

## Symbols

Large cap tech: AAPL, TSLA, NVDA, AMD, META
Polled round-robin each bot cycle.

## Position Sizing & Risk

**Formula:**
```
risk_per_trade = account_equity × 1%
position_size = risk_per_trade / (entry_price - stop_loss_price)
```

**Safety Limits:**
- Max 5 open positions at once
- Max 10% of account in any single position
- Circuit breaker: $500 total drawdown halts bot
- Kill switch: `pm2 stop scalp-bot` or delete `bot_state.json`

## Main Bot Loop

```
while (market is open):
  1. for each symbol in [AAPL, TSLA, NVDA, AMD, META]:
  2.   bars = alpaca.getBars(symbol, "1Min", limit=50)
  3.   ema9 = calculateEMA(bars, 9)
  4.   ema21 = calculateEMA(bars, 21)
  5.   price = bars[bars.length - 1].close
  6.   if (entry signal) and (no position for symbol):
  7.     size = calculatePositionSize(price, stop_loss)
  8.     alpaca.submitOrder(symbol, size, "buy")
  9.     save position to bot_state.json
  10.  if (position exists for symbol):
  11.    check TP / SL / EMA cross / time stop
  12.    if (exit signal):
  13.      alpaca.submitOrder(symbol, position.qty, "sell")
  14.      remove position from bot_state.json
  15. sleep(5000)
```

## File Structure

```
scalp-bot/
├── src/
│   ├── index.js        # Main bot loop
│   ├── indicators.js   # EMA calculation
│   ├── strategy.js     # Entry/exit logic
│   ├── broker.js       # Alpaca API wrapper
│   └── state.js        # bot_state.json read/write
├── .env                # API keys (gitignored)
├── bot_state.json      # Persisted positions
├── package.json
└── ecosystem.config.js # pm2 config
```

## Deployment (Oracle Cloud VPS)

- OS: Ubuntu 22.04 LTS (Oracle Cloud free tier)
- Runtime: Node.js 20 LTS
- Process manager: pm2 (auto-restart, logging)
- Schedule: pm2 startup + cron to launch at 9:25 AM ET weekdays
- Security: Alpaca API keys in `.env` (gitignored)
- Logs: `pm2 logs scalp-bot`

## Data Source

Alpaca Market Data v2 (Polygon.io backed). Free tier has 15-minute delay — acceptable for scalping with 5-min+ holds. If needed, upgrade to Alpaca Grow plan for real-time data.

## State Persistence

`bot_state.json` tracks:
- Open positions (symbol, qty, entry price, stop loss, entry time)
- Account equity snapshot
- Total P&L for the day

On restart, bot reads `bot_state.json` and syncs with Alpaca API to confirm actual positions.
