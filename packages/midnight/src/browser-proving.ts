/**
 * Browser proving: official DApp Connector `getProvingProvider` first,
 * then a trusted local HTTP proof-server. Never a hosted 1AM HTTP URI.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import type { ProvingProvider } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import {
  createProofProvider,
  type ProofProvider,
  type ZKConfigProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { resolveProofHealthUrl, resolveProofServerUrl, walletSupportsProvingProvider } from "./browser-provider-urls.js";
import { proofServerReachable, type NetworkConfig } from "./network.js";

export type BrowserProvingSource = "wallet" | "local-http";

export type ResolvedBrowserProof = {
  proofProvider: ProofProvider;
  source: BrowserProvingSource;
};

export const LOCAL_PROOF_MISSING =
  "Proving is unavailable. This hosted UI does not run a proof server. Use the wallet Proof Station, or start midnightntwrk/proof-server:8.1.0 on this computer (port 6300).";

export async function tryWalletProofProvider(
  connectedAPI: ConnectedAPI,
  zkConfigProvider: ZKConfigProvider<string>,
): Promise<ProofProvider | undefined> {
  if (!walletSupportsProvingProvider(connectedAPI)) return undefined;
  try {
    const provingProvider = await connectedAPI.getProvingProvider(zkConfigProvider.asKeyMaterialProvider());
    return createProofProvider(provingProvider as unknown as ProvingProvider);
  } catch {
    return undefined;
  }
}

export async function resolveBrowserProofProvider(
  connectedAPI: ConnectedAPI,
  zkConfigProvider: ZKConfigProvider<string>,
  walletProverServerUri: string | undefined,
  config: NetworkConfig,
): Promise<ResolvedBrowserProof> {
  const walletProof = await tryWalletProofProvider(connectedAPI, zkConfigProvider);
  if (walletProof) {
    return { proofProvider: walletProof, source: "wallet" };
  }
  const proofServer = resolveProofServerUrl(walletProverServerUri, config);
  return {
    proofProvider: httpClientProofProvider(proofServer, zkConfigProvider),
    source: "local-http",
  };
}

export async function localProofServerLive(
  walletProverServerUri: string | undefined,
  config: NetworkConfig,
  timeoutMs = 2500,
): Promise<boolean> {
  try {
    return await proofServerReachable(resolveProofHealthUrl(walletProverServerUri, config), timeoutMs);
  } catch {
    return false;
  }
}

export async function browserProvingReady(
  source: BrowserProvingSource | null,
  walletProverServerUri: string | undefined,
  config: NetworkConfig,
): Promise<boolean> {
  if (source === "wallet") return true;
  return localProofServerLive(walletProverServerUri, config);
}
