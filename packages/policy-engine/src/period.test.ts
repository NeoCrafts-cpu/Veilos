import { describe, expect, it } from "vitest";
import {
  authorizationWindow,
  carriedSpend,
  currentAuthorizationWindow,
  nowSeconds,
  spendBucketMayOpen,
  windowIsSafeToSubmit,
  PERIOD_SECONDS,
} from "./period.js";

describe("U11 authorization window", () => {
  it("aligns to UTC day boundaries", () => {
    const window = authorizationWindow(1_700_000_000n);
    expect(window.periodStart % PERIOD_SECONDS).toBe(0n);
    expect(window.periodEnd - window.periodStart).toBe(PERIOD_SECONDS);
    expect(window.periodStart).toBeLessThan(1_700_000_000n);
    expect(window.periodEnd).toBeGreaterThan(1_700_000_000n);
  });

  it("is stable for every instant inside the same day", () => {
    const start = authorizationWindow(1_700_000_000n).periodStart;
    expect(authorizationWindow(start + 1n).periodStart).toBe(start);
    expect(authorizationWindow(start + PERIOD_SECONDS - 1n).periodStart).toBe(start);
    // Stability is what lets the private daily-spend bucket accumulate.
    expect(authorizationWindow(start + PERIOD_SECONDS).periodStart).toBe(
      start + PERIOD_SECONDS,
    );
  });

  it("never exceeds the one-day bound the circuit enforces", () => {
    for (const t of [0n, 1n, 86_399n, 86_400n, 1_700_000_000n, 4_000_000_000n]) {
      const window = authorizationWindow(t);
      expect(window.periodEnd - window.periodStart).toBeLessThanOrEqual(86_400n);
      expect(window.periodEnd).toBeGreaterThan(window.periodStart);
    }
  });

  it("rejects a negative clock", () => {
    expect(() => authorizationWindow(-1n)).toThrow(/invalid clock/);
  });

  it("reads seconds, not milliseconds, from the clock", () => {
    expect(nowSeconds(() => 1_700_000_000_000)).toBe(1_700_000_000n);
    const window = currentAuthorizationWindow(() => 1_700_000_000_000);
    expect(window).toEqual(authorizationWindow(1_700_000_000n));
  });

  it("flags boundary instants as unsafe to submit", () => {
    const window = authorizationWindow(1_700_000_000n);
    // The circuit requires periodStart < blockTime, so the first seconds of a
    // window are unusable.
    expect(windowIsSafeToSubmit(window, window.periodStart)).toBe(false);
    expect(windowIsSafeToSubmit(window, window.periodStart + 1n)).toBe(false);
    expect(windowIsSafeToSubmit(window, window.periodStart + 3600n)).toBe(true);
    expect(windowIsSafeToSubmit(window, window.periodEnd)).toBe(false);
  });

  it("resets carried spend across windows and rejects future buckets", () => {
    const window = authorizationWindow(1_700_000_000n);
    const previous = window.periodStart - PERIOD_SECONDS;
    expect(carriedSpend(window.periodStart, 4800n, window)).toBe(4800n);
    expect(carriedSpend(previous, 25_000n, window)).toBe(0n);
    expect(() => carriedSpend(window.periodStart + PERIOD_SECONDS, 0n, window)).toThrow(
      /stale period/,
    );
  });

  it("refuses a new spend bucket until the committed day has elapsed", () => {
    const window = authorizationWindow(1_700_000_000n);
    const previous = window.periodStart - PERIOD_SECONDS;
    expect(spendBucketMayOpen(0n, window, window.periodStart + 3600n)).toBe(true);
    expect(spendBucketMayOpen(window.periodStart, window, window.periodStart + 3600n)).toBe(true);
    expect(spendBucketMayOpen(previous, window, previous + PERIOD_SECONDS)).toBe(false);
    expect(spendBucketMayOpen(previous, window, previous + PERIOD_SECONDS + 1n)).toBe(true);
    expect(spendBucketMayOpen(window.periodStart + PERIOD_SECONDS, window, window.periodStart + 3600n)).toBe(false);
  });
});
