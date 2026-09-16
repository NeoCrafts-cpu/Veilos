/**
 * Wave 2 Preview companion clients: governance, procurement, auditor.
 * Unique circuit ids; unique private-state ids; indexer read-back required.
 */

import {
  auditorPreviewWitnesses,
  createAuditorPreviewPrivateState,
  createGovernancePreviewPrivateState,
  createProcurementPreviewPrivateState,
  governancePreviewWitnesses,
  loadCompiledAuditorPreview,
  loadCompiledGovernancePreview,
  loadCompiledProcurementPreview,
  procurementPreviewWitnesses,
  type AuditorPreviewPrivateState,
  type GovernancePreviewPrivateState,
  type ProcurementPreviewPrivateState,
} from "@velios/contracts";
import { asHex32, MIDNIGHT_SUCCESS_STATUS, type Hex32 } from "@velios/shared-types";
import { compileNamedContract, deployNamedOrganization, submitNamedCircuit } from "./compiled-call.js";
import {
  ledgerStateValue,
  projectAuditorLedger,
  projectGovernanceLedger,
  projectProcurementLedger,
  type AuditorLedgerView,
  type CompactAuditorLedger,
  type CompactGovernanceLedger,
  type CompactProcurementLedger,
  type GovernanceLedgerView,
  type ProcurementLedgerView,
} from "./economy-ledger.js";
import { writeCircuitPrivateState, type PrivateStateStore } from "./private-state-store.js";

export const GOVERNANCE_PRIVATE_STATE_ID = "VeliosGovernancePrivateState";
export const PROCUREMENT_PRIVATE_STATE_ID = "VeliosProcurementPrivateState";
export const AUDITOR_PRIVATE_STATE_ID = "VeliosAuditorPrivateState";

export {
  createAuditorPreviewPrivateState,
  createGovernancePreviewPrivateState,
  createProcurementPreviewPrivateState,
};

type QueryProviders = {
  publicDataProvider?: { queryContractState: (address: string) => Promise<unknown> };
  privateStateProvider?: PrivateStateStore;
};

async function queryLedger<T>(
  providers: QueryProviders,
  contractAddress: string,
  loaded: { ledger: unknown } | null,
  missing: string,
  project: (ledger: never, address: string) => T,
): Promise<T> {
  if (!loaded) throw new Error(missing);
  if (!providers.publicDataProvider) throw new Error("environment missing: public data provider");
  const contractState = await Promise.race([
    providers.publicDataProvider.queryContractState(contractAddress),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("indexer read timed out")), 20_000);
    }),
  ]);
  if (!contractState) throw new Error("contract not found on indexer");
  const ledgerFn = loaded.ledger as (state: unknown) => never;
  return project(ledgerFn(ledgerStateValue(contractState)), contractAddress);
}

export async function requireCompiledGovernancePreview(compiledAssetsPath: string) {
  return compileNamedContract({
    name: "VeliosGovernancePreview",
    loaded: await loadCompiledGovernancePreview(),
    witnesses: governancePreviewWitnesses,
    compiledAssetsPath,
    missing: "environment missing: governance-preview compact artifacts not compiled",
  });
}

export async function requireCompiledProcurementPreview(compiledAssetsPath: string) {
  return compileNamedContract({
    name: "VeliosProcurementPreview",
    loaded: await loadCompiledProcurementPreview(),
    witnesses: procurementPreviewWitnesses,
    compiledAssetsPath,
    missing: "environment missing: procurement-preview compact artifacts not compiled",
  });
}

export async function requireCompiledAuditorPreview(compiledAssetsPath: string) {
  return compileNamedContract({
    name: "VeliosAuditorPreview",
    loaded: await loadCompiledAuditorPreview(),
    witnesses: auditorPreviewWitnesses,
    compiledAssetsPath,
    missing: "environment missing: auditor-preview compact artifacts not compiled",
  });
}

export async function deployGovernanceOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: GovernancePreviewPrivateState,
  options: { compiledAssetsPath: string },
): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const { compiledContract } = await requireCompiledGovernancePreview(options.compiledAssetsPath);
  return deployNamedOrganization({
    providers,
    organizationName,
    compiledContract,
    privateStateId: GOVERNANCE_PRIVATE_STATE_ID,
    initialPrivateState,
  });
}

export async function deployProcurementOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: ProcurementPreviewPrivateState,
  options: { compiledAssetsPath: string },
): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const { compiledContract } = await requireCompiledProcurementPreview(options.compiledAssetsPath);
  return deployNamedOrganization({
    providers,
    organizationName,
    compiledContract,
    privateStateId: PROCUREMENT_PRIVATE_STATE_ID,
    initialPrivateState,
  });
}

export async function deployAuditorOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: AuditorPreviewPrivateState,
  options: { compiledAssetsPath: string },
): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const { compiledContract } = await requireCompiledAuditorPreview(options.compiledAssetsPath);
  return deployNamedOrganization({
    providers,
    organizationName,
    compiledContract,
    privateStateId: AUDITOR_PRIVATE_STATE_ID,
    initialPrivateState,
  });
}

export async function callGovernanceCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options: { compiledAssetsPath: string },
) {
  const { compiledContract } = await requireCompiledGovernancePreview(options.compiledAssetsPath);
  return submitNamedCircuit({
    providers,
    contractAddress,
    compiledContract,
    privateStateId: GOVERNANCE_PRIVATE_STATE_ID,
    circuitId,
    args,
  });
}

export async function callProcurementCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options: { compiledAssetsPath: string },
) {
  const { compiledContract } = await requireCompiledProcurementPreview(options.compiledAssetsPath);
  return submitNamedCircuit({
    providers,
    contractAddress,
    compiledContract,
    privateStateId: PROCUREMENT_PRIVATE_STATE_ID,
    circuitId,
    args,
  });
}

export async function callAuditorCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options: { compiledAssetsPath: string },
) {
  const { compiledContract } = await requireCompiledAuditorPreview(options.compiledAssetsPath);
  return submitNamedCircuit({
    providers,
    contractAddress,
    compiledContract,
    privateStateId: AUDITOR_PRIVATE_STATE_ID,
    circuitId,
    args,
  });
}

export async function writeGovernancePrivateState(
  providers: QueryProviders,
  contractAddress: string,
  privateState: GovernancePreviewPrivateState,
) {
  await writeCircuitPrivateState(providers, contractAddress, GOVERNANCE_PRIVATE_STATE_ID, privateState);
}

export async function writeProcurementPrivateState(
  providers: QueryProviders,
  contractAddress: string,
  privateState: ProcurementPreviewPrivateState,
) {
  await writeCircuitPrivateState(providers, contractAddress, PROCUREMENT_PRIVATE_STATE_ID, privateState);
}

export async function writeAuditorPrivateState(
  providers: QueryProviders,
  contractAddress: string,
  privateState: AuditorPreviewPrivateState,
) {
  await writeCircuitPrivateState(providers, contractAddress, AUDITOR_PRIVATE_STATE_ID, privateState);
}

export async function readGovernanceLedger(
  providers: QueryProviders,
  contractAddress: string,
): Promise<GovernanceLedgerView> {
  return queryLedger(
    providers,
    contractAddress,
    await loadCompiledGovernancePreview(),
    "environment missing: governance-preview compact artifacts not compiled",
    projectGovernanceLedger as (ledger: CompactGovernanceLedger, address: string) => GovernanceLedgerView,
  );
}

export async function readProcurementLedger(
  providers: QueryProviders,
  contractAddress: string,
): Promise<ProcurementLedgerView> {
  return queryLedger(
    providers,
    contractAddress,
    await loadCompiledProcurementPreview(),
    "environment missing: procurement-preview compact artifacts not compiled",
    projectProcurementLedger as (ledger: CompactProcurementLedger, address: string) => ProcurementLedgerView,
  );
}

export async function readAuditorLedger(
  providers: QueryProviders,
  contractAddress: string,
): Promise<AuditorLedgerView> {
  return queryLedger(
    providers,
    contractAddress,
    await loadCompiledAuditorPreview(),
    "environment missing: auditor-preview compact artifacts not compiled",
    projectAuditorLedger as (ledger: CompactAuditorLedger, address: string) => AuditorLedgerView,
  );
}

export async function confirmCompanionField<T extends { contractAddress: string }>(input: {
  status: string;
  txId: string;
  contractAddress: string;
  readLedger: () => Promise<T>;
  present: (view: T) => boolean;
  timeoutMs?: number;
  pollMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<{ kind: "confirmed" | "stale" | "failed"; txId: string; view?: T }> {
  if (input.status !== MIDNIGHT_SUCCESS_STATUS) {
    return { kind: "failed", txId: input.txId };
  }
  const timeoutMs = input.timeoutMs ?? 30_000;
  const pollMs = input.pollMs ?? 1_000;
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const deadline = now() + timeoutMs;
  let last: T | undefined;
  while (now() <= deadline) {
    last = await input.readLedger();
    if (last.contractAddress !== input.contractAddress) {
      return { kind: "failed", txId: input.txId, view: last };
    }
    if (input.present(last)) return { kind: "confirmed", txId: input.txId, view: last };
    if (now() + pollMs > deadline) break;
    await sleep(pollMs);
  }
  return { kind: "stale", txId: input.txId, ...(last ? { view: last } : {}) };
}

export function governanceProposalPresent(proposalId: string) {
  const id = asHex32(proposalId);
  return (view: GovernanceLedgerView) => view.proposals.some((row) => row.proposalId === id);
}
