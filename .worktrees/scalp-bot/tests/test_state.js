import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StateManager } from '../src/state.js';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'bot_state.json');

beforeEach(() => {
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }
});

it('should create empty state if file does not exist', () => {
  const sm = new StateManager(STATE_FILE);
  const state = sm.getState();
  assert.deepStrictEqual(state, { positions: {}, totalPnL: 0, drawdown: 0 });
});

it('should add a position', () => {
  const sm = new StateManager(STATE_FILE);
  sm.addPosition('AAPL', {
    qty: 100,
    entryPrice: 150.00,
    stopLoss: 149.63,
    entryTime: Date.now()
  });
  
  const state = sm.getState();
  assert.ok(state.positions['AAPL']);
  assert.equal(state.positions['AAPL'].qty, 100);
});

it('should remove a position and update P&L', () => {
  const sm = new StateManager(STATE_FILE);
  sm.addPosition('AAPL', {
    qty: 100,
    entryPrice: 150.00,
    stopLoss: 149.63,
    entryTime: Date.now()
  });
  
  sm.removePosition('AAPL', 150.75); // exit at $150.75
  
  const state = sm.getState();
  assert.ok(!state.positions['AAPL']);
  assert.ok(state.totalPnL > 0); // should be profit
});

it('should persist state to disk', () => {
  const sm = new StateManager(STATE_FILE);
  sm.addPosition('TSLA', {
    qty: 50,
    entryPrice: 200.00,
    stopLoss: 199.63,
    entryTime: Date.now()
  });
  
  // Create new instance and load
  const sm2 = new StateManager(STATE_FILE);
  const state = sm2.getState();
  assert.ok(state.positions['TSLA']);
});
