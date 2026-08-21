interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter {
  private readonly store = new Map<string, RateLimitBucket>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically remove expired rate limit buckets to prevent memory leak
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of this.store.entries()) {
        if (now > bucket.resetAt) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Checks if an action is within rate limits.
   *
   * @param key Unique key e.g. `${ip}:${action}`
   * @param maxRequests Max requests allowed within window
   * @param windowMs Window duration in milliseconds
   */
  public check(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    existing.count += 1;
    return { allowed: true, remaining: maxRequests - existing.count };
  }

  public reset(key: string): void {
    this.store.delete(key);
  }

  public destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const rateLimiter = new InMemoryRateLimiter();
