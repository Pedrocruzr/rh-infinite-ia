type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __authRateLimitStore?: Map<string, Bucket>;
};

function getStore() {
  if (!globalStore.__authRateLimitStore) {
    globalStore.__authRateLimitStore = new Map<string, Bucket>();
  }

  return globalStore.__authRateLimitStore;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const store = getStore();
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfter: 0,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfter: 0,
  };
}
