/**
 * Counts browser prove/submit work so the wallet session poll does not
 * treat a busy Proof Station or connector popup as a disconnect.
 */

const COOLDOWN_MS = 15_000;

let depth = 0;
let cooldownUntil = 0;

export function beginWalletWork(): void {
  depth += 1;
}

export function endWalletWork(): void {
  depth = Math.max(0, depth - 1);
  if (depth === 0) {
    cooldownUntil = Date.now() + COOLDOWN_MS;
  }
}

export function isWalletWorkInFlight(): boolean {
  return depth > 0;
}

export function shouldSkipWalletSessionCheck(now = Date.now()): boolean {
  return depth > 0 || now < cooldownUntil;
}

export function resetWalletWorkLockForTests(): void {
  depth = 0;
  cooldownUntil = 0;
}
