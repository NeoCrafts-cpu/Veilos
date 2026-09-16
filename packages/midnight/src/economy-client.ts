/**
 * Wave 2 economy-preview client. Official MidnightJS deployContract / submitCallTx.
 * AUTHORIZED / settled is never inferred from frontend state.
 */

import {
  createEconomyPreviewPrivateState,
  economyPreviewWitnesses,
  economyWitnesses,
  loadCompiledEconomy,
  loadCompiledEconomyPreview,
  type EconomyPreviewPrivateState,
  type VeliosEconomyPrivateState,
} from "@velios/contracts";
import { asHex32, MIDNIGHT_SUCCESS_STATUS, type Hex32 } from "@velios/shared-types";
import { compileNamedContract, deployNamedOrganization, submitNamedCircuit } from "./compiled-call.js";
import {
  ledgerStateValue,
  projectEconomyLedger,
  type CompactEconomyLedger,
  type EconomyLedgerView,
} from "./economy-ledger.js";
import { writeCircuitPrivateState, type PrivateStateStore } from "./private-state-store.js";

export const ECONOMY_PRIVATE_STATE_ID = "VeliosEconomyPrivateState";
export { createEconomyPreviewPrivateState };

export type EconomyCallOptions = {
  compiledAssetsPath: string;
  preview?: boolean;
};

async function compiledEconomy(options: EconomyCallOptions) {
  if (options.preview) {
    return compileNamedContract({
      name: "VeliosEconomyPreview",
      loaded: await loadCompiledEconomyPreview(),
      witnesses: economyPreviewWitnesses,
      compiledAssetsPath: options.compiledAssetsPath,
      missing: "environment missing: economy-preview compact artifacts not compiled",
    });
  }
  return compileNamedContract({
    name: "VeliosEconomy",
    loaded: await loadCompiledEconomy(),
    witnesses: economyWitnesses,
    compiledAssetsPath: options.compiledAssetsPath,
    missing: "environment missing: economy compact artifacts not compiled",
  });
}

export async function requireCompiledEconomy(compiledAssetsPath: string): Promise<{
  compiledContract: unknown;
}> {
  return compiledEconomy({ compiledAssetsPath, preview: false });
}

export async function requireCompiledEconomyPreview(compiledAssetsPath: string): Promise<{
  compiledContract: unknown;
}> {
  return compiledEconomy({ compiledAssetsPath, preview: true });
}

export async function deployEconomyOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: VeliosEconomyPrivateState | EconomyPreviewPrivateState,
  options: EconomyCallOptions,
): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const { compiledContract } = await compiledEconomy(options);
  return deployNamedOrganization({
    providers,
    organizationName,
    compiledContract,
    privateStateId: ECONOMY_PRIVATE_STATE_ID,
    initialPrivateState,
  });
}

export async function callEconomyCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options: EconomyCallOptions,
): Promise<{ status: string; txId: string; submitted: boolean }> {
  const { compiledContract } = await compiledEconomy(options);
  return submitNamedCircuit({
    providers,
    contractAddress,
    compiledContract,
    privateStateId: ECONOMY_PRIVATE_STATE_ID,
    circuitId,
    args,
  });
}

export async function writeEconomyPrivateState(
  providers: { privateStateProvider?: PrivateStateStore },
  contractAddress: string,
  privateState: EconomyPreviewPrivateState | VeliosEconomyPrivateState,
): Promise<void> {
  await writeCircuitPrivateState(providers, contractAddress, ECONOMY_PRIVATE_STATE_ID, privateState);
}

export async function readEconomyLedger(
  providers: { publicDataProvider?: { queryContractState: (address: string) => Promise<unknown> } },
  contractAddress: string,
): Promise<EconomyLedgerView> {
  const loaded = await loadCompiledEconomyPreview();
  if (!loaded) {
    throw new Error("environment missing: economy-preview compact artifacts not compiled");
  }
  if (!providers.publicDataProvider) {
    throw new Error("environment missing: public data provider");
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
  const ledgerFn = loaded.ledger as (state: unknown) => CompactEconomyLedger;
  return projectEconomyLedger(ledgerFn(ledgerStateValue(contractState)), contractAddress);
}

export async function confirmEconomyField(input: {
  status: string;
  txId: string;
  contractAddress: string;
  readLedger: () => Promise<EconomyLedgerView>;
  present: (view: EconomyLedgerView) => boolean;
  timeoutMs?: number;
  pollMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<{ kind: "confirmed" | "stale" | "failed"; txId: string; view?: EconomyLedgerView }> {
  if (input.status !== MIDNIGHT_SUCCESS_STATUS) {
    return { kind: "failed", txId: input.txId };
  }
  const timeoutMs = input.timeoutMs ?? 30_000;
  const pollMs = input.pollMs ?? 1_000;
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const deadline = now() + timeoutMs;
  let last: EconomyLedgerView | undefined;
  while (now() <= deadline) {
    last = await input.readLedger();
    if (input.contractAddress && last.contractAddress !== input.contractAddress) {
      return { kind: "failed", txId: input.txId, view: last };
    }
    if (input.present(last)) {
      return { kind: "confirmed", txId: input.txId, view: last };
    }
    if (now() + pollMs > deadline) break;
    await sleep(pollMs);
  }
  return { kind: "stale", txId: input.txId, ...(last ? { view: last } : {}) };
}

export async function confirmEconomySettlement(input: {
  status: string;
  txId: string;
  actionId: string;
  contractAddress: string;
  readLedger: () => Promise<EconomyLedgerView>;
  timeoutMs?: number;
  pollMs?: number;
}): Promise<{ kind: "settled" | "stale" | "failed"; txId: string }> {
  const confirmed = await confirmEconomyField({
    status: input.status,
    txId: input.txId,
    contractAddress: input.contractAddress,
    readLedger: input.readLedger,
    ...(input.timeoutMs !== undefined ? { timeoutMs: input.timeoutMs } : {}),
    ...(input.pollMs !== undefined ? { pollMs: input.pollMs } : {}),
    present: (view) => view.settlements.some((row) => row.actionId === asHex32(input.actionId)),
  });
  if (confirmed.kind === "confirmed") return { kind: "settled", txId: input.txId };
  if (confirmed.kind === "failed") return { kind: "failed", txId: input.txId };
  return { kind: "stale", txId: input.txId };
}
