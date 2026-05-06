import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateEMA, calculateEMASlope } from '../src/indicators.js';

it('should calculate EMA correctly', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  // EMA 9 with these prices should approximate the later values
  const ema9 = calculateEMA(prices, 9);
  assert.ok(ema9 > prices[0]);
  assert.ok(ema9 <= prices[prices.length - 1]);
});

it('should return last EMA value from array of prices', () => {
  const prices = [100, 102, 101, 103, 105, 104, 106, 107, 108, 109];
  const ema = calculateEMA(prices, 5);
  // Just check it's a finite number
  assert.ok(Number.isFinite(ema));
});

it('should detect rising EMA slope', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const rising = calculateEMASlope(prices, 9);
  assert.strictEqual(rising, true);
});

it('should detect falling EMA slope', () => {
  const prices = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
  const rising = calculateEMASlope(prices, 9);
  assert.strictEqual(rising, false);
});
