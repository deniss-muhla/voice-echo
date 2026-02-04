type Bucket = {
  tokens: number;
  updatedAtMs: number;
};

export type RateLimitConfig = {
  capacity: number;
  refillPerSecond: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();

export function takeToken(key: string, nowMs: number, config: RateLimitConfig): boolean {
  const existing = buckets.get(key);
  if (!existing) {
    buckets.set(key, { tokens: config.capacity - 1, updatedAtMs: nowMs });
    return true;
  }

  const elapsedSeconds = Math.max(0, (nowMs - existing.updatedAtMs) / 1000);
  const refill = elapsedSeconds * config.refillPerSecond;
  const nextTokens = Math.min(config.capacity, existing.tokens + refill);

  if (nextTokens < 1) {
    existing.tokens = nextTokens;
    existing.updatedAtMs = nowMs;
    return false;
  }

  existing.tokens = nextTokens - 1;
  existing.updatedAtMs = nowMs;
  return true;
}

export function clearRateLimitStateForTests(): void {
  buckets.clear();
}
