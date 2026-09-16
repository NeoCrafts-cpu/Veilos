import { shortAddress } from "../lib/format.js";
import { useSession } from "../state/session.js";

/**
 * Wallet connection chip. Pattern: one visible state (disconnected / connecting / connected).
 * Midnight DApp Connector only — never a recovery phrase, never an EVM embedded wallet.
 */
export function WalletStatus() {
  const { wallet, connectWallet, disconnectWallet, busyAction, walletReconnectNeeded } = useSession();
  if (wallet) {
    return (
      <button
        type="button"
        className="btn ghost wallet-chip"
        onClick={disconnectWallet}
        title="Disconnect wallet"
        aria-label="Disconnect wallet"
      >
        <span className="wallet-dot" data-on="true" />
        {wallet.unshieldedAddress ? shortAddress(wallet.unshieldedAddress) : "Connected"}
      </button>
    );
  }
  const connecting = busyAction === "connect";
  return (
    <button type="button" className="btn" onClick={() => void connectWallet()} aria-busy={connecting}>
      {connecting ? "Connecting…" : walletReconnectNeeded ? "Reconnect wallet" : "Connect wallet"}
    </button>
  );
}
