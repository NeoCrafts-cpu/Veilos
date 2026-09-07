/**
 * Browser wallet adapter using the official DApp Connector API v4.
 * Source: https://docs.midnight.network/guides/react-wallet-connect
 *
 * Wallets inject InitialAPI under window.midnight keyed by UUID.
 * Do not hard-code window.midnight.mnLace.
 */

import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { NetworkConfig } from "./network.js";

declare global {
  interface Window {
    /** Wallets inject InitialAPI implementations keyed by UUID. */
    midnight?: Record<string, InitialAPI>;
  }
}

export type BrowserWalletSnapshot = {
  name: string;
  networkId: string;
  unshieldedAddress?: string | undefined;
  status: "connected" | "disconnected";
};

export function listWallets(): InitialAPI[] {
  const injected = globalThis.window?.midnight;
  return injected ? Object.values(injected) : [];
}

export function selectWallet(preferredName?: string): InitialAPI {
  const wallets = listWallets();
  if (wallets.length === 0) {
    throw new Error("No Midnight wallet found. Install a Midnight wallet extension.");
  }
  if (preferredName) {
    const match = wallets.find((wallet) => wallet.name === preferredName);
    if (match) return match;
  }
  return wallets[0]!;
}

export async function connectBrowserWallet(
  config: NetworkConfig,
  preferredName?: string,
): Promise<{ api: unknown; snapshot: BrowserWalletSnapshot }> {
  const wallet = selectWallet(preferredName);
  const connectedApi = await wallet.connect(config.networkId);
  const connectionStatus = await connectedApi.getConnectionStatus();
  if (connectionStatus.status !== "connected") {
    throw new Error("wallet disconnected");
  }
  if (typeof connectedApi.hintUsage === "function") {
    await connectedApi.hintUsage([
      "getShieldedAddresses",
      "getUnshieldedAddress",
      "getDustBalance",
      "getConfiguration",
      "balanceUnsealedTransaction",
      "submitTransaction",
    ]);
  }
  let unshieldedAddress: string | undefined;
  try {
    const addresses = await connectedApi.getUnshieldedAddress();
    unshieldedAddress = addresses.unshieldedAddress;
  } catch {
    unshieldedAddress = undefined;
  }
  return {
    api: connectedApi,
    snapshot: {
      name: wallet.name,
      networkId: config.networkId,
      unshieldedAddress,
      status: "connected",
    },
  };
}
