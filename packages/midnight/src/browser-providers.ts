/**
 * Browser MidnightProviders from MidnightJS 4.1.1.
 * Do not invent wallet, proof, or indexer methods.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
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
  resolveProofHealthUrl,
  resolveProofServerUrl,
  resolveZkArtifactsBaseUrl,
  walletSupportsProvingProvider,
} from "./browser-provider-urls.js";
import { encryptedBrowserPrivateStateProvider } from "./encrypted-browser-private-state.js";
import { inMemoryPrivateStateProvider } from "./memory-private-state.js";
import type { NetworkConfig } from "./network.js";

export {
  isHostedWalletProver,
  isTrustedProofServerUrl,
  resolveIndexerHttpUrl,
  resolveProofHealthUrl,
  resolveProofServerUrl,
  resolveZkArtifactsBaseUrl,
  walletSupportsProvingProvider,
} from "./browser-provider-urls.js";

export type BrowserProviderOptions = {
  zkArtifactsBaseUrl?: string;
  accountId?: string;
  privateStorePassword?: string;
};

export async function buildBrowserProviders(
  connectedAPI: ConnectedAPI,
  config: NetworkConfig,
  options: BrowserProviderOptions = {},
): Promise<MidnightProviders> {
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
  const proofServer = resolveProofServerUrl(walletConfig.proverServerUri, config);
  const indexer = walletConfig.indexerUri || config.indexer;
  const indexerWS = walletConfig.indexerWsUri || config.indexerWS;
  const accountId = options.accountId ?? shieldedAddresses.shieldedCoinPublicKey;
  const privateStateProvider = options.privateStorePassword
    ? encryptedBrowserPrivateStateProvider({
        accountId,
        passwordProvider: () => options.privateStorePassword!,
      })
    : inMemoryPrivateStateProvider();
  if (walletSupportsProvingProvider(connectedAPI)) {
    // Wallet proving is preferred when the connector exposes it. The installed
    // MidnightJS 4.1.1 path still uses the local HTTP proof server.
  }
  return {
    privateStateProvider,
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServer, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(indexer, indexerWS),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
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
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0]!;
      },
    },
  };
}
