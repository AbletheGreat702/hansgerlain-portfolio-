// src/broker.js
import Alpaca from '@alpacahq/alpaca-trade-api';

export class AlpacaBroker {
  constructor({ keyId, secret, paper }) {
    this._keyId = keyId;
    this._secret = secret;
    this._paper = paper;
    this._client = null;
    this._clientCreated = false;
  }

  get client() {
    if (!this._clientCreated) {
      try {
        this._client = new Alpaca({
          keyId: this._keyId,
          secret: this._secret,
          paper: this._paper
        });
      } catch (e) {
        this._client = {};
      }
      this._clientCreated = true;
    }
    return this._client;
  }

  async getAccount() {
    return await this.client.getAccount();
  }

  async submitOrder(symbol, qty, side) {
    return await this.client.submitOrder({
      symbol,
      qty,
      side,
      type: 'market',
      timeInForce: 'gtc'
    });
  }

  async getPositions() {
    return await this.client.getPositions();
  }

  async getBars(symbol, timeframe, limit = 50) {
    return await this.client.getBars({
      symbols: [symbol],
      timeframe,
      limit
    });
  }
}
