/**
 * Wave 2 economy client. Uses official MidnightJS deployContract / submitCallTx.
 * Settlement is authorized only after SucceedEntirely and exact indexer read-back.
 */

import {
  economyPreviewWitnesses,
  economyWitnesses,
  loadCompiledEconomy,
  loadCompiledEconomyPreview,
} from "@velios/contracts";
import { asHex32, hex32ToBytes, MIDNIGHT_SUCCESS_STATUS, type Hex32 } from "@velios/shared-types";
import type { EconomyPreviewPrivateState, VeliosEconomyPrivateState } from "@velios/contracts";
import { organizationIdFromName } from "./ids.js";
import { waitForPublicAction, type LedgerReader } from "./indexer-confirm.js";

export const ECONOMY_PRIVATE_STATE_ID = "VeliosEconomyPrivateState";

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

async function compileEconomyContract(
  name: string,
  loaded: { Contract: unknown } | null,
  witnesses: unknown,
  compiledAssetsPath: string,
  missing: string,
): Promise<{ compiledContract: unknown }> {
  if (!loaded) {
    throw new Error(missing);
  }
  const { CompiledContract } = await import("@midnight-ntwrk/midnight-js-protocol/compact-js");
  const withWitnesses =
    (CompiledContract as { withWitnesses?: (w: unknown) => unknown }).withWitnesses ??
    (CompiledContract as { withVacantWitnesses?: unknown }).withVacantWitnesses;
  const compiledContract = (
    CompiledContract as { make: (name: string, ctor: unknown) => { pipe: (...args: unknown[]) => unknown } }
  )
    .make(name, loaded.Contract)
    .pipe(
      typeof withWitnesses === "function" ? withWitnesses(witnesses) : withWitnesses,
      (CompiledContract as { withCompiledFileAssets: (p: string) => unknown }).withCompiledFileAssets(
        compiledAssetsPath,
      ),
    );
  return { compiledContract };
}

export async function requireCompiledEconomy(compiledAssetsPath: string): Promise<{
  compiledContract: unknown;
}> {
  return compileEconomyContract(
    "VeliosEconomy",
    await loadCompiledEconomy(),
    economyWitnesses,
    compiledAssetsPath,
    "environment missing: economy compact artifacts not compiled",
  );
}

export async function requireCompiledEconomyPreview(compiledAssetsPath: string): Promise<{
  compiledContract: unknown;
}> {
  return compileEconomyContract(
    "VeliosEconomyPreview",
    await loadCompiledEconomyPreview(),
    economyPreviewWitnesses,
    compiledAssetsPath,
    "environment missing: economy-preview compact artifacts not compiled",
  );
}

export async function deployEconomyOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: VeliosEconomyPrivateState | EconomyPreviewPrivateState,
  options: { compiledAssetsPath: string; preview?: boolean },
): Promise<{ contractAddress: string; organizationId: Hex32; status: string; txId: string }> {
  const organizationId = organizationIdFromName(organizationName);
  const { compiledContract } = options.preview
    ? await requireCompiledEconomyPreview(options.compiledAssetsPath)
    : await requireCompiledEconomy(options.compiledAssetsPath);
  const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
  const deployed = await deployContract(providers as never, {
    compiledContract,
    privateStateId: ECONOMY_PRIVATE_STATE_ID,
    initialPrivateState,
    args: [hex32ToBytes(organizationId)],
  } as never);
  const contractAddress = readContractAddress(deployed);
  const status = readTxStatus((deployed as { deployTxData?: unknown }).deployTxData);
  const txId = readTxId((deployed as { deployTxData?: unknown }).deployTxData);
  if (status && status !== MIDNIGHT_SUCCESS_STATUS) {
    throw new Error("economy deploy failed");
  }
  if (!contractAddress) {
    throw new Error("economy deploy failed");
  }
  return { contractAddress, organizationId, status: status || MIDNIGHT_SUCCESS_STATUS, txId };
}

export async function callEconomyCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options: { compiledAssetsPath: string },
): Promise<{ status: string; txId: string; submitted: boolean }> {
  const { compiledContract } = await requireCompiledEconomy(options.compiledAssetsPath);
  const { submitCallTx } = await import("@midnight-ntwrk/midnight-js-contracts");
  const finalized = await submitCallTx(providers as never, {
    compiledContract,
    contractAddress,
    privateStateId: ECONOMY_PRIVATE_STATE_ID,
    circuitId,
    args,
  } as never);
  const status = readTxStatus(finalized);
  if (!status) throw new Error("submit failed");
  return {
    status,
    txId: readTxId(finalized),
    submitted: status === MIDNIGHT_SUCCESS_STATUS,
  };
}

export async function confirmEconomySettlement(input: {
  status: string;
  txId: string;
  actionId: string;
  contractAddress: string;
  readLedger: LedgerReader;
  timeoutMs?: number;
  pollMs?: number;
}): Promise<{ kind: "settled" | "stale" | "failed"; txId: string }> {
  if (input.status !== MIDNIGHT_SUCCESS_STATUS) {
    return { kind: "failed", txId: input.txId };
  }
  const confirmed = await waitForPublicAction({
    actionId: asHex32(input.actionId),
    ...(input.contractAddress ? { contractAddress: input.contractAddress } : {}),
    timeoutMs: input.timeoutMs ?? 30_000,
    pollMs: input.pollMs ?? 1_000,
    readLedger: input.readLedger,
  });
  return {
    kind: confirmed.status === "confirmed" ? "settled" : "stale",
    txId: input.txId,
  };
}
