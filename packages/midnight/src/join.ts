/**
 * Join a deployed Wave 1 contract and read public ledger state.
 * Official MidnightJS: findDeployedContract + queryContractState + Compact ledger().
 */

import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { loadCompiledAuthorization } from "@velios/contracts";
import type { VeliosPrivateState } from "@velios/shared-types";
import { PRIVATE_STATE_ID } from "./ids.js";
import { requireCompiledContract } from "./client.js";
import { contractStateValue, projectLedger, type PublicLedgerView } from "./ledger-view.js";
import type { NetworkConfig } from "./network.js";
export { writeJoinedPrivateState } from "./private-state-store.js";

export type LedgerProviders = {
  publicDataProvider: {
    queryContractState: (address: string) => Promise<unknown>;
  };
  privateStateProvider?: {
    setContractAddress?: (address: string) => void;
    set?: (id: string, state: unknown) => Promise<void>;
  };
};

export function publicIndexerProvider(config: NetworkConfig) {
  return indexerPublicDataProvider(config.indexer, config.indexerWS);
}

export async function readPublicLedger(
  providers: LedgerProviders,
  contractAddress: string,
): Promise<PublicLedgerView> {
  const loaded = await loadCompiledAuthorization();
  if (!loaded) {
    throw new Error("environment missing: compact artifacts not compiled");
  }
  const contractState = await Promise.race([
    providers.publicDataProvider.queryContractState(contractAddress),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("indexer read timed out")), 20_000);
    }),
  ]);
  if (!contractState) {
    throw new Error("contract not found on indexer");
  }
  const ledgerFn = loaded.ledger as (state: unknown) => Parameters<typeof projectLedger>[0];
  return projectLedger(ledgerFn(contractStateValue(contractState)), contractAddress);
}

export async function joinDeployedOrganization(
  providers: unknown,
  contractAddress: string,
  privateState?: VeliosPrivateState,
  options?: { compiledAssetsPath?: string },
): Promise<PublicLedgerView> {
  const { compiledContract } = await requireCompiledContract(options?.compiledAssetsPath);
  const { findDeployedContract } = await import("@midnight-ntwrk/midnight-js-contracts");
  if (privateState) {
    await findDeployedContract(providers as never, {
      compiledContract,
      contractAddress,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: privateState,
    } as never);
  } else {
    await findDeployedContract(providers as never, {
      compiledContract,
      contractAddress,
    } as never);
  }
  return readPublicLedger(providers as LedgerProviders, contractAddress);
}

