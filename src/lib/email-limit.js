export function makeHourLimiter(max = 10, windowMs = 60 * 60 * 1000) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const next = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (next.length >= max) {
      hits.set(key, next);
      return true;
    }
    next.push(now);
    hits.set(key, next);
    return false;
  };
}

export function lookupDelayMs() {
  return 180 + Math.floor(Math.random() * 420);
}
