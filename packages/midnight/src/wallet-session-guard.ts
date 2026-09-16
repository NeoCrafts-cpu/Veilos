import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { NetworkConfig } from "./network.js";

export type WalletSessionReader = Pick<
  ConnectedAPI,
  "getConnectionStatus" | "getConfiguration" | "getShieldedAddresses"
>;

/** After a prove/submit finishes, require a longer error window than one 10s timeout. */
export const WALLET_SESSION_CONSECUTIVE_ERRORS_TO_INVALIDATE = 4;

export function shouldInvalidateWalletSessionAfterErrors(input: {
  consecutiveErrors: number;
  transactionInFlight: boolean;
}): boolean {
  if (input.transactionInFlight) return false;
  return input.consecutiveErrors >= WALLET_SESSION_CONSECUTIVE_ERRORS_TO_INVALIDATE;
}

/**
 * Revalidates the connector immediately before a wallet-dependent transaction
 * step. Proof generation can be long-running, so connection-time checks alone
 * are not sufficient.
 */
export async function assertWalletSessionCurrent(
  api: WalletSessionReader,
  config: NetworkConfig,
  expectedCoinPublicKey: string,
): Promise<void> {
  const [status, walletConfig, addresses] = await Promise.all([
    api.getConnectionStatus(),
    api.getConfiguration(),
    api.getShieldedAddresses(),
  ]);
  if (
    status.status !== "connected" ||
    status.networkId !== config.networkId ||
    walletConfig.networkId !== config.networkId ||
    addresses.shieldedCoinPublicKey !== expectedCoinPublicKey
  ) {
    throw new Error("wallet disconnected");
  }
}
