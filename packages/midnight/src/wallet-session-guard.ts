import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { NetworkConfig } from "./network.js";

export type WalletSessionReader = Pick<
  ConnectedAPI,
  "getConnectionStatus" | "getConfiguration" | "getShieldedAddresses"
>;

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
