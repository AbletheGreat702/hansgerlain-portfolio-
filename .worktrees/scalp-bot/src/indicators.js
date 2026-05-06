export function calculateEMA(prices, period) {
  if (prices.length < period) {
    throw new Error(`Not enough prices for EMA ${period}. Need ${period}, got ${prices.length}`);
  }

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

export function calculateEMASlope(prices, period, lookbackBars = 2) {
  if (prices.length < period + lookbackBars) {
    return false; // Not enough data
  }

  const currentEMA = calculateEMA(prices, period);
  const pastPrices = prices.slice(0, prices.length - lookbackBars);
  const pastEMA = calculateEMA(pastPrices, period);

  return currentEMA > pastEMA;
}
