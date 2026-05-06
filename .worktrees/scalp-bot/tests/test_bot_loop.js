import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { ScalpBot } from '../src/index.js';

it('should poll each symbol in round-robin', async () => {
  const bot = new ScalpBot({
    symbols: ['AAPL', 'TSLA'],
    pollIntervalMs: 100
  });

  // Mock broker methods
  bot.broker.getBars = mock.fn(async () => ({
    'AAPL': [{ close: 150.00 }, { close: 151.00 }]
  }));
  bot.broker.getAccount = mock.fn(async () => ({ equity: '10000.00' }));
  bot.broker.getPositions = mock.fn(async () => []);

  let pollCount = 0;
  bot.processSymbol = mock.fn(async () => { pollCount++; });

  // Run 3 iterations
  await bot.runIteration();
  await bot.runIteration();
  await bot.runIteration();

  assert.equal(pollCount, 6); // 3 iterations × 2 symbols
});
