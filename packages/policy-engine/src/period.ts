/**
 * Authorization windows.
 *
 * `authorizeAction` takes a disclosed `[periodStart, periodEnd)` window and
 * proves, against the ledger clock, that:
 *
 *   periodStart < blockTime <= periodEnd   and   periodEnd - periodStart <= 86400
 *
 * The window does double duty:
 *   - it is the bucket key for the private daily-spend accumulator, so it must
 *     be *stable* across a day (a sliding window would reset the accumulator on
 *     every call and defeat the daily limit);
 *   - it is the public "timestamp" written to the action record.
 *
 * Midnight block time is `secondsSinceEpoch` (see ledger `BlockContext`), so
 * every value here is seconds since the UNIX epoch — never milliseconds.
 */

export const PERIOD_SECONDS = 86_400n;

export type AuthorizationWindow = {
  periodStart: bigint;
  periodEnd: bigint;
};

/** UTC-day-aligned window containing `nowSeconds`. */
export function authorizationWindow(nowSeconds: bigint): AuthorizationWindow {
  if (nowSeconds < 0n) {
    throw new Error("invalid clock");
  }
  const periodStart = (nowSeconds / PERIOD_SECONDS) * PERIOD_SECONDS;
  return { periodStart, periodEnd: periodStart + PERIOD_SECONDS };
}

export function nowSeconds(clock: () => number = Date.now): bigint {
  return BigInt(Math.floor(clock() / 1000));
}

export function currentAuthorizationWindow(clock: () => number = Date.now): AuthorizationWindow {
  return authorizationWindow(nowSeconds(clock));
}

/**
 * The circuit requires `periodStart < blockTime`, so a window is unusable in
 * the first second of a UTC day and if the node's block time still lags into
 * the previous day. Callers should surface a retry rather than a failure.
 */
export function windowIsSafeToSubmit(
  window: AuthorizationWindow,
  nowSecondsValue: bigint,
  marginSeconds = 5n,
): boolean {
  return (
    nowSecondsValue > window.periodStart + marginSeconds &&
    nowSecondsValue + marginSeconds <= window.periodEnd
  );
}

/** Spend carried into `window`; a bucket from an earlier window resets to 0. */
export function carriedSpend(
  committedPeriodStart: bigint,
  committedSpend: bigint,
  window: AuthorizationWindow,
): bigint {
  if (committedPeriodStart > window.periodStart) {
    throw new Error("stale period");
  }
  return committedPeriodStart === window.periodStart ? committedSpend : 0n;
}

/**
 * A new UTC-day bucket is allowed only after the committed start plus 86400s.
 * Wave 1 Compact still resets on any later `periodStart`; official clients
 * refuse that opening so the daily cap cannot be skipped from this UI.
 */
export function spendBucketMayOpen(
  committedPeriodStart: bigint,
  window: AuthorizationWindow,
  nowSecondsValue: bigint,
): boolean {
  if (committedPeriodStart === 0n || committedPeriodStart === window.periodStart) {
    return true;
  }
  if (committedPeriodStart > window.periodStart) {
    return false;
  }
  return nowSecondsValue > committedPeriodStart + PERIOD_SECONDS;
}
