/**
 * Node provider wiring copied from official example-hello-world `src/providers.ts`.
 * Preview/Preprod CLI wallets use `@velios/cli` (`WalletFacade` + DUST).
 * Call this only after Midnight packages are installed and a local/devnet is up.
 */

import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import type { NetworkConfig } from "./network.js";

export type NodeWalletLike = {
  getCoinPublicKey(): unknown;
};

export function buildNodeProviders(
  wallet: NodeWalletLike,
  zkConfigPath: string,
  config: NetworkConfig,
  privateStateStoreName = "velios-authorization",
): MidnightProviders {
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName,
      privateStoragePasswordProvider: () => {
        const password = process.env["VELIOS_PRIVATE_STORE_PASSWORD"];
        if (!password) {
          throw new Error("VELIOS_PRIVATE_STORE_PASSWORD is required for the official level store");
        }
        return password;
      },
      accountId: wallet.getCoinPublicKey(),
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: wallet,
    midnightProvider: wallet,
  } as unknown as MidnightProviders;
}
