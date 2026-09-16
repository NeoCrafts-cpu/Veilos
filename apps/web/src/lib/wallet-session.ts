/**
 * Public reconnect hint only. Never store private state, seeds, or wallet credentials.
 * Never log the passphrase.
 */

const KEY = "velios.wallet.reconnect.v1";

export type WalletReconnectHint = {
  networkId: string;
  seenAt: string;
};

export function readWalletReconnectHint(): WalletReconnectHint | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WalletReconnectHint;
    if (!parsed.networkId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWalletReconnectHint(networkId: string): void {
  if (typeof window === "undefined") return;
  const hint: WalletReconnectHint = { networkId, seenAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(hint));
}

export function clearWalletReconnectHint(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
