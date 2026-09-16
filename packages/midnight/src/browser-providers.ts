/**
 * Browser MidnightProviders from MidnightJS 4.1.1.
 * Do not invent wallet, proof, or indexer methods.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import {
  Binding,
  type FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import type { MidnightProviders, UnboundTransaction } from "@midnight-ntwrk/midnight-js-types";
import {
  resolveBrowserProofProvider,
  type BrowserProvingSource,
} from "./browser-proving.js";
import { resolveZkArtifactsBaseUrl } from "./browser-provider-urls.js";
import { encryptedBrowserPrivateStateProvider } from "./encrypted-browser-private-state.js";
import { inMemoryPrivateStateProvider } from "./memory-private-state.js";
import type { NetworkConfig } from "./network.js";
import { assertWalletSessionCurrent } from "./wallet-session-guard.js";

export {
  isHostedWalletProver,
  isTrustedProofServerUrl,
  resolveIndexerHttpUrl,
  resolveProofHealthUrl,
  resolveProofServerUrl,
  resolveZkArtifactsBaseUrl,
  walletSupportsProvingProvider,
} from "./browser-provider-urls.js";
export {
  browserProvingReady,
  LOCAL_PROOF_MISSING,
  localProofServerLive,
  resolveBrowserProofProvider,
  tryWalletProofProvider,
} from "./browser-proving.js";
export type { BrowserProvingSource, ResolvedBrowserProof } from "./browser-proving.js";

export type BrowserProviderOptions = {
  zkArtifactsBaseUrl?: string;
  accountId?: string;
  privateStorePassword?: string;
};

export type BuiltBrowserProviders = {
  providers: MidnightProviders;
  provingSource: BrowserProvingSource;
};

export async function buildBrowserProviders(
  connectedAPI: ConnectedAPI,
  config: NetworkConfig,
  options: BrowserProviderOptions = {},
): Promise<BuiltBrowserProviders> {
  setNetworkId(config.networkId);
  const walletConfig = await connectedAPI.getConfiguration();
  if (walletConfig.networkId && walletConfig.networkId !== config.networkId) {
    throw new Error("wallet disconnected");
  }
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  const zkConfigProvider = new FetchZkConfigProvider(
    resolveZkArtifactsBaseUrl(options.zkArtifactsBaseUrl),
    fetch.bind(globalThis),
  );
  const proving = await resolveBrowserProofProvider(
    connectedAPI,
    zkConfigProvider,
    walletConfig.proverServerUri,
    config,
  );
  const indexer = walletConfig.indexerUri || config.indexer;
  const indexerWS = walletConfig.indexerWsUri || config.indexerWS;
  const accountId = options.accountId ?? shieldedAddresses.shieldedCoinPublicKey;
  const privateStateProvider = options.privateStorePassword
    ? encryptedBrowserPrivateStateProvider({
        accountId,
        passwordProvider: () => options.privateStorePassword!,
      })
    : inMemoryPrivateStateProvider();
  return {
    provingSource: proving.source,
    providers: {
      privateStateProvider,
      zkConfigProvider,
      proofProvider: proving.proofProvider,
      publicDataProvider: indexerPublicDataProvider(indexer, indexerWS),
      walletProvider: {
        getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
        getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
        balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
          await assertWalletSessionCurrent(
            connectedAPI,
            config,
            shieldedAddresses.shieldedCoinPublicKey,
          );
          const received = await connectedAPI.balanceUnsealedTransaction(toHex(tx.serialize()));
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            "signature",
            "proof",
            "binding",
            fromHex(received.tx),
          );
        },
      },
      midnightProvider: {
        submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
          await assertWalletSessionCurrent(
            connectedAPI,
            config,
            shieldedAddresses.shieldedCoinPublicKey,
          );
          await connectedAPI.submitTransaction(toHex(tx.serialize()));
          return tx.identifiers()[0]!;
        },
      },
    },
  };
}
