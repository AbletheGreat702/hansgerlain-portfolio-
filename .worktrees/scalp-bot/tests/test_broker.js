// tests/test_broker.js
import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { AlpacaBroker } from '../src/broker.js';

let broker;

beforeEach(() => {
  broker = new AlpacaBroker({
    keyId: 'test-key',
    secret: 'test-secret',
    paper: true
  });
});

it('should get account info', async () => {
  // Mock internal client
  broker.client.getAccount = mock.fn(async () => ({
    equity: '10000.00',
    buyingPower: '20000.00'
  }));
  
  const account = await broker.getAccount();
  assert.equal(account.equity, '10000.00');
});

it('should submit a buy order', async () => {
  broker.client.submitOrder = mock.fn(async (params) => ({
    id: 'order-123',
    symbol: params.symbol,
    side: params.side,
    qty: params.qty
  }));
  
  const order = await broker.submitOrder('AAPL', 100, 'buy');
  assert.equal(order.symbol, 'AAPL');
  assert.equal(order.side, 'buy');
  assert.equal(order.qty, 100);
});

it('should get current positions', async () => {
  broker.client.getPositions = mock.fn(async () => [
    { symbol: 'AAPL', qty: '100', avgEntryPrice: '150.00' }
  ]);
    
  const positions = await broker.getPositions();
  assert.equal(positions.length, 1);
  assert.equal(positions[0].symbol, 'AAPL');
});
