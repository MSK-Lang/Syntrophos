import { describe, expect, it } from 'vitest';
import { InMemoryRateLimiter } from '../src/lib/rate-limiter.js';

describe('In-Memory Rate Limiter', () => {
  it('allows requests within the configured quota and decrements remaining', () => {
    const limiter = new InMemoryRateLimiter();
    const key = 'test-ip:action';

    const check1 = limiter.check(key, 3, 1000);
    expect(check1.allowed).toBe(true);
    expect(check1.remaining).toBe(2);

    const check2 = limiter.check(key, 3, 1000);
    expect(check2.allowed).toBe(true);
    expect(check2.remaining).toBe(1);

    const check3 = limiter.check(key, 3, 1000);
    expect(check3.allowed).toBe(true);
    expect(check3.remaining).toBe(0);

    // 4th request exceeds limit
    const check4 = limiter.check(key, 3, 1000);
    expect(check4.allowed).toBe(false);
    expect(check4.remaining).toBe(0);
    expect(typeof check4.retryAfterSeconds).toBe('number');
    expect(check4.retryAfterSeconds).toBeGreaterThan(0);

    limiter.destroy();
  });

  it('resets counters after calling reset()', () => {
    const limiter = new InMemoryRateLimiter();
    const key = 'reset-key';

    limiter.check(key, 1, 10000);
    expect(limiter.check(key, 1, 10000).allowed).toBe(false);

    limiter.reset(key);
    expect(limiter.check(key, 1, 10000).allowed).toBe(true);

    limiter.destroy();
  });
});
