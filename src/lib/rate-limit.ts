/**
 * In-memory fixed-window rate limiter.
 *
 * ## Scope and limits
 *
 * State lives in the process, so the limit is **per instance**. On a serverless
 * or multi-instance deployment the effective allowance is the configured limit
 * multiplied by the number of live instances, and a cold start resets it.
 *
 * That is a deliberate trade for Phase 1: it stops casual abuse and accidental
 * submit loops with no infrastructure. It is **not** a defence against a
 * distributed attacker, and it must be replaced by a shared store (Redis,
 * Upstash, or a database counter) before it is relied on for anything stronger.
 *
 * Pure and dependency-free so it can be tested directly.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** Epoch milliseconds when the current window resets. */
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    this.sweep(now);

    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.limit - 1, resetAt };
    }

    if (bucket.count >= this.limit) {
      return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: this.limit - bucket.count,
      resetAt: bucket.resetAt,
    };
  }

  /** Drops expired buckets so the map cannot grow without bound. */
  private sweep(now: number): void {
    if (this.buckets.size < 1000) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  /** Test seam. */
  reset(): void {
    this.buckets.clear();
  }
}
