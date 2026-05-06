export function checkEntrySignal({ price, ema9, ema21, ema9Rising, ema21Rising, hasPosition }) {
  if (hasPosition) return false;
  if (ema9 <= ema21) return false;
  if (!ema9Rising || !ema21Rising) return false;
  return true;
}

export function checkExitSignal({ entryPrice, currentPrice, stopLoss, entryTime, ema9, config }) {
  const elapsed = Date.now() - entryTime;

  if (currentPrice >= entryPrice + config.takeProfit) {
    return { exit: true, reason: 'TAKE_PROFIT' };
  }

  if (ema9 !== undefined && currentPrice < ema9) {
    return { exit: true, reason: 'EMA_CROSS' };
  }

  if (currentPrice <= stopLoss) {
    return { exit: true, reason: 'STOP_LOSS' };
  }

  if (elapsed > config.timeStopMs) {
    return { exit: true, reason: 'TIME_STOP' };
  }

  return { exit: false, reason: null };
}
