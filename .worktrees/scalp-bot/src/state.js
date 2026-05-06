import fs from 'fs';
import path from 'path';

export class StateManager {
  constructor(stateFile = 'bot_state.json') {
    this.stateFile = stateFile;
    this.state = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        this.state = JSON.parse(data);
        return this.state;
      }
    } catch (e) {
      console.error('Error loading state:', e.message);
    }
    this.state = { positions: {}, totalPnL: 0, drawdown: 0 };
    return this.state;
  }

  save() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  getState() {
    return this.state;
  }

  addPosition(symbol, { qty, entryPrice, stopLoss, entryTime }) {
    this.state.positions[symbol] = { qty, entryPrice, stopLoss, entryTime };
    this.save();
  }

  removePosition(symbol, exitPrice) {
    const pos = this.state.positions[symbol];
    if (pos) {
      const pnl = (exitPrice - pos.entryPrice) * pos.qty;
      this.state.totalPnL += pnl;
      if (pnl < 0) {
        this.state.drawdown += Math.abs(pnl);
      }
      delete this.state.positions[symbol];
      this.save();
    }
    return pos;
  }

  hasPosition(symbol) {
    return !!this.state.positions[symbol];
  }

  getPosition(symbol) {
    return this.state.positions[symbol];
  }

  checkCircuitBreaker(limit) {
    return this.state.drawdown >= limit;
  }
}
