/**
 * MidnightJS provider wiring from midnightntwrk/example-hello-world `src/providers.ts`.
 */

import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import type { NetworkConfig } from "@velios/midnight";
import type { MidnightWalletProvider } from "./wallet.js";
import { resolvePrivateStorePassword } from "./private-store-password.js";

export function buildCliProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: NetworkConfig,
  options?: { privateStateStoreName?: string },
): MidnightProviders {
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = wallet.getCoinPublicKey();
  const password = resolvePrivateStorePassword(process.env, String(accountId));
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: options?.privateStateStoreName ?? "velios-authorization",
      privateStoragePasswordProvider: () => password,
      accountId,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}
