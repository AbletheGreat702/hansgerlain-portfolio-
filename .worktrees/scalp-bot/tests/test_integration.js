// tests/test_integration.js
// Run with: APCA_API_KEY_ID=xxx APCA_API_SECRET_KEY=xxx node --test tests/test_integration.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { AlpacaBroker } from '../src/broker.js';

describe('Alpaca Integration', () => {
  let broker;

  before(() => {
    broker = new AlpacaBroker({
      keyId: process.env.APCA_API_KEY_ID,
      secret: process.env.APCA_API_SECRET_KEY,
      paper: true
    });
  });

  it('should connect to Alpaca and get account', async () => {
    const account = await broker.getAccount();
    assert.ok(account.equity);
    assert.ok(parseFloat(account.equity) > 0);
    console.log(`Account equity: $${account.equity}`);
  });

  it('should fetch bars for AAPL', async () => {
    const bars = await broker.getBars('AAPL', '1Min', 10);
    assert.ok(bars);
    // Response format depends on SDK version
    const barArray = Array.isArray(bars) ? bars : bars['AAPL'];
    assert.ok(barArray.length > 0);
    console.log(`Got ${barArray.length} bars for AAPL`);
  });
});
