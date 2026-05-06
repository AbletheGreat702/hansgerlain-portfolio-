// tests/test_strategy.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkEntrySignal, checkExitSignal } from '../src/strategy.js';

const config = {
  takeProfit: 0.75,
  stopLoss: 0.37,
  timeStopMs: 1800000
};

it('should signal entry when EMA 9 > EMA 21 and both rising', () => {
  const result = checkEntrySignal({
    price: 155.00,
    ema9: 154.50,
    ema21: 153.00,
    ema9Rising: true,
    ema21Rising: true,
    hasPosition: false
  });
  assert.strictEqual(result, true);
});

it('should NOT signal entry when EMA 9 < EMA 21', () => {
  const result = checkEntrySignal({
    price: 155.00,
    ema9: 152.00,
    ema21: 153.00,
    ema9Rising: true,
    ema21Rising: true,
    hasPosition: false
  });
  assert.strictEqual(result, false);
});

it('should signal exit on take profit', () => {
  const result = checkExitSignal({
    entryPrice: 150.00,
    currentPrice: 150.80,
    stopLoss: 149.63,
    entryTime: Date.now() - 600000,
    config
  });
  assert.strictEqual(result.exit, true);
  assert.strictEqual(result.reason, 'TAKE_PROFIT');
});

it('should signal exit on stop loss', () => {
  const result = checkExitSignal({
    entryPrice: 150.00,
    currentPrice: 149.60,
    stopLoss: 149.63,
    entryTime: Date.now() - 600000,
    config
  });
  assert.strictEqual(result.exit, true);
  assert.strictEqual(result.reason, 'STOP_LOSS');
});

it('should signal exit on EMA cross (price < EMA 9)', () => {
  const result = checkExitSignal({
    entryPrice: 150.00,
    currentPrice: 149.00,
    ema9: 149.50,
    stopLoss: 149.63,
    entryTime: Date.now() - 600000,
    config
  });
  assert.strictEqual(result.exit, true);
  assert.strictEqual(result.reason, 'EMA_CROSS');
});

it('should signal exit on time stop', () => {
  const result = checkExitSignal({
    entryPrice: 150.00,
    currentPrice: 150.20,
    stopLoss: 149.63,
    entryTime: Date.now() - 2000000,
    config
  });
  assert.strictEqual(result.exit, true);
  assert.strictEqual(result.reason, 'TIME_STOP');
});
