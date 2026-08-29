import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  it("allows up to the limit then refuses", () => {
    const limiter = new RateLimiter(3, 60_000);
    const now = 1_000_000;

    expect(limiter.check("ip-1", now).allowed).toBe(true);
    expect(limiter.check("ip-1", now).allowed).toBe(true);
    expect(limiter.check("ip-1", now).allowed).toBe(true);
    expect(limiter.check("ip-1", now).allowed).toBe(false);
  });

  it("reports the remaining allowance", () => {
    const limiter = new RateLimiter(2, 60_000);
    const now = 1_000_000;

    expect(limiter.check("ip-1", now).remaining).toBe(1);
    expect(limiter.check("ip-1", now).remaining).toBe(0);
  });

  it("tracks callers independently", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;

    expect(limiter.check("ip-1", now).allowed).toBe(true);
    expect(limiter.check("ip-2", now).allowed).toBe(true);
    expect(limiter.check("ip-1", now).allowed).toBe(false);
  });

  it("resets once the window elapses", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;

    expect(limiter.check("ip-1", now).allowed).toBe(true);
    expect(limiter.check("ip-1", now).allowed).toBe(false);
    expect(limiter.check("ip-1", now + 60_001).allowed).toBe(true);
  });

  it("reports when the window resets", () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;
    expect(limiter.check("ip-1", now).resetAt).toBe(now + 60_000);
  });
});
