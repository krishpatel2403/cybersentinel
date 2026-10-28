import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/lib/security/rate-limit";

describe("RateLimiter", () => {
  it("allows requests up to the limit and then blocks", () => {
    const now = 1_000;
    const limiter = new RateLimiter(2, 60_000, () => now);

    expect(limiter.check("user")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("user")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.check("user")).toMatchObject({ allowed: false, remaining: 0 });
  });

  it("tracks keys independently", () => {
    const limiter = new RateLimiter(1, 60_000, () => 0);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    let now = 0;
    const limiter = new RateLimiter(1, 1_000, () => now);
    expect(limiter.check("key").allowed).toBe(true);
    expect(limiter.check("key").allowed).toBe(false);

    now = 1_000;
    const next = limiter.check("key");
    expect(next.allowed).toBe(true);
    expect(next.remaining).toBe(0);
  });

  it("reports a retry-after value in seconds", () => {
    let now = 0;
    const limiter = new RateLimiter(1, 10_000, () => now);
    limiter.check("key");
    now = 2_500;
    const result = limiter.check("key");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(8);
  });
});
