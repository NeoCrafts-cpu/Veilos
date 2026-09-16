/**
 * Shared MidnightJS call/deploy helpers for Wave 2 Preview contracts.
 * Never reports success from frontend state. SucceedEntirely is required,
 * then the caller must read the exact expected public ledger field.
 */

import { hex32ToBytes, MIDNIGHT_SUCCESS_STATUS, type Hex32 } from "@velios/shared-types";
import { organizationIdFromName } from "./ids.js";

export type CompiledContractBundle = { compiledContract: unknown };

function readTxStatus(finalized: unknown): string {
  if (!finalized || typeof finalized !== "object") return "";
  const record = finalized as Record<string, unknown>;
  const publicData = record.public;
  if (publicData && typeof publicData === "object") {
    const status = (publicData as Record<string, unknown>).status;
    if (typeof status === "string") return status;
  }
  if (typeof record.status === "string") return record.status;
  return "";
}

function readTxId(finalized: unknown): string {
  if (!finalized || typeof finalized !== "object") return "";
  const record = finalized as Record<string, unknown>;
  const publicData = record.public;
  if (publicData && typeof publicData === "object") {
    const txId = (publicData as Record<string, unknown>).txId ?? (publicData as Record<string, unknown>).txHash;
    if (typeof txId === "string") return txId;
  }
  if (typeof record.txId === "string") return record.txId;
  return "";
}

function readContractAddress(deployed: unknown): string {
  const record = deployed as {
    deployTxData?: { public?: { contractAddress?: string } };
    contractAddress?: string;
  };
  return record.deployTxData?.public?.contractAddress ?? record.contractAddress ?? "";
}

export async function compileNamedContract(input: {
  name: string;
  loaded: { Contract: unknown } | null;
  witnesses: unknown;
  compiledAssetsPath: string;
  missing: string;
}): Promise<CompiledContractBundle> {
  if (!input.loaded) {
    throw new Error(input.missing);
  }
  const { CompiledContract } = await import("@midnight-ntwrk/midnight-js-protocol/compact-js");
  const withWitnesses =
    (CompiledContract as { withWitnesses?: (w: unknown) => unknown }).withWitnesses ??
    (CompiledContract as { withVacantWitnesses?: unknown }).withVacantWitnesses;
  const compiledContract = (
    CompiledContract as { make: (name: string, ctor: unknown) => { pipe: (...args: unknown[]) => unknown } }
  )
    .make(input.name, input.loaded.Contract)
    .pipe(
      typeof withWitnesses === "function" ? withWitnesses(input.witnesses) : withWitnesses,
      (CompiledContract as { withCompiledFileAssets: (p: string) => unknown }).withCompiledFileAssets(
        input.compiledAssetsPath,
      ),
    );
  return { compiledContract };
}

export async function deployNamedOrganization(input: {
  providers: unknown;
  organizationName: string;
  compiledContract: unknown;
  privateStateId: string;
  initialPrivateState: unknown;
}): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const organizationId = organizationIdFromName(input.organizationName);
  const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
  const deployed = await deployContract(input.providers as never, {
    compiledContract: input.compiledContract,
    privateStateId: input.privateStateId,
    initialPrivateState: input.initialPrivateState,
    args: [hex32ToBytes(organizationId)],
  } as never);
  const contractAddress = readContractAddress(deployed);
  const status = requireSucceedEntirely(readTxStatus((deployed as { deployTxData?: unknown }).deployTxData));
  const txId = readTxId((deployed as { deployTxData?: unknown }).deployTxData);
  if (!contractAddress) {
    throw new Error("deploy failed");
  }
  return { contractAddress, organizationId, status, txId };
}

export async function submitNamedCircuit(input: {
  providers: unknown;
  contractAddress: string;
  compiledContract: unknown;
  privateStateId: string;
  circuitId: string;
  args: unknown[];
}): Promise<{ status: string; txId: string; submitted: boolean }> {
  const { submitCallTx } = await import("@midnight-ntwrk/midnight-js-contracts");
  const finalized = await submitCallTx(input.providers as never, {
    compiledContract: input.compiledContract,
    contractAddress: input.contractAddress,
    privateStateId: input.privateStateId,
    circuitId: input.circuitId,
    args: input.args,
  } as never);
  const status = readTxStatus(finalized);
  if (!status) throw new Error("submit failed");
  return {
    status,
    txId: readTxId(finalized),
    submitted: status === MIDNIGHT_SUCCESS_STATUS,
  };
}

export function requireSucceedEntirely(status: string): string {
  if (status !== MIDNIGHT_SUCCESS_STATUS) {
    throw new Error("deploy failed");
  }
  return status;
}

export { readContractAddress, readTxId, readTxStatus };
