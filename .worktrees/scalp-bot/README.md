# Scalp Bot

Automated stock scalping bot for Alpaca paper trading.

## Setup

1. Clone repo and `npm install`
2. Copy `.env.example` to `.env` and fill in Alpaca API keys
3. Get API keys from [Alpaca Paper Trading](https://alpaca.markets)

## Run

**Development:**
```
npm run dev
```

**Production (pm2):**
```
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs scalp-bot
```

## Strategy

EMA 9/21 crossover with:
- Take Profit: $0.75/share
- Stop Loss: $0.37/share
- Time Stop: 30 minutes
- Risk: 1% of equity per trade

## Deploy to Oracle VPS

1. SSH to VPS
2. Install Node.js 20 LTS
3. SCP project files to VPS
4. `npm install && pm2 start ecosystem.config.js`
5. `pm2 save && pm2 startup` (auto-start on reboot)
