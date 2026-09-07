/**
 * Wave 1 authorization client.
 *
 * Production path: official MidnightJS `deployContract` / `submitCallTx`.
 * Never reports AUTHORIZED unless the returned tx status is SucceedEntirely
 * and the public ledger contains the exact action id.
 */

import { applySuccessfulSpend, loadCompiledAuthorization, witnesses } from "@velios/contracts";
import {
  currentAuthorizationWindow,
  nowSeconds,
  randomBytes32,
  windowIsSafeToSubmit,
  type AuthorizationWindow,
} from "@velios/policy-engine";
import {
  asHex32,
  hex32ToBytes,
  MIDNIGHT_SUCCESS_STATUS,
  type AuthorizationOutcome,
  type Hex32,
  type PaymentIntent,
  type VeliosPrivateState,
} from "@velios/shared-types";
import { organizationIdFromName, PRIVATE_STATE_ID } from "./ids.js";
import { waitForPublicAction } from "./indexer-confirm.js";
import { readPublicLedger, type LedgerProviders } from "./join.js";
import { writeJoinedPrivateState } from "./private-state-store.js";
import { outcomeFromCaughtError, outcomeFromIndexerConfirm, outcomeFromTxStatus } from "./status.js";

export { PRIVATE_STATE_ID };

export type DeployedAuthorization = {
  contractAddress: string;
  organizationId: Hex32;
};

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

export async function requireCompiledContract(compiledAssetsPath = "."): Promise<{
  compiledContract: unknown;
  Contract: unknown;
}> {
  const loaded = await loadCompiledAuthorization();
  if (!loaded) {
    throw new Error("environment missing: compact artifacts not compiled");
  }
  const { CompiledContract } = await import("@midnight-ntwrk/midnight-js-protocol/compact-js");
  const withWitnesses =
    (CompiledContract as { withWitnesses?: (w: unknown) => unknown }).withWitnesses ??
    (CompiledContract as { withVacantWitnesses?: unknown }).withVacantWitnesses;
  const compiledContract = (CompiledContract as { make: (name: string, ctor: unknown) => { pipe: (...args: unknown[]) => unknown } })
    .make("VeliosAuthorization", loaded.Contract)
    .pipe(
      typeof withWitnesses === "function" ? withWitnesses(witnesses) : withWitnesses,
      (CompiledContract as { withCompiledFileAssets: (p: string) => unknown }).withCompiledFileAssets(compiledAssetsPath),
    );
  return { compiledContract, Contract: loaded.Contract };
}

export async function deployOrganization(
  providers: unknown,
  organizationName: string,
  initialPrivateState: VeliosPrivateState,
  options?: { compiledAssetsPath?: string },
): Promise<DeployedAuthorization> {
  const organizationId = organizationIdFromName(organizationName);
  const { compiledContract } = await requireCompiledContract(options?.compiledAssetsPath);
  const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
  const deployed = await deployContract(providers as never, {
    compiledContract,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState,
    args: [hex32ToBytes(organizationId)],
  } as never);
  const contractAddress = readContractAddress(deployed);
  const status = readTxStatus((deployed as { deployTxData?: unknown }).deployTxData);
  if (status && status !== MIDNIGHT_SUCCESS_STATUS) {
    throw new Error("deploy failed");
  }
  if (!contractAddress) {
    throw new Error("deploy failed");
  }
  return { contractAddress, organizationId };
}

export async function callCircuit(
  providers: unknown,
  contractAddress: string,
  circuitId: string,
  args: unknown[],
  options?: { compiledAssetsPath?: string },
): Promise<{ status: string; txId: string }> {
  const { compiledContract } = await requireCompiledContract(options?.compiledAssetsPath);
  const { submitCallTx } = await import("@midnight-ntwrk/midnight-js-contracts");
  const finalized = await submitCallTx(providers as never, {
    compiledContract,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    circuitId,
    args,
  } as never);
  const status = readTxStatus(finalized);
  if (!status) {
    throw new Error("submit failed");
  }
  return {
    status,
    txId: readTxId(finalized),
  };
}

export async function authorizePayment(input: {
  providers: unknown;
  contractAddress: string;
  organizationId: Hex32;
  intent: PaymentIntent;
  privateState: VeliosPrivateState;
  vendorId: Uint8Array;
  nowSeconds?: bigint;
  window?: AuthorizationWindow;
  nextSpendSalt?: Uint8Array;
  confirmTimeoutMs?: number;
  confirmPollMs?: number;
}): Promise<{
  outcome: AuthorizationOutcome;
  nextPrivateState: VeliosPrivateState;
  window: AuthorizationWindow;
  txId?: string;
  submitted: boolean;
}> {
  const now = input.nowSeconds ?? nowSeconds();
  const window = input.window ?? currentAuthorizationWindow(() => Number(now) * 1000);
  const nextSpendSalt = input.nextSpendSalt ?? randomBytes32();
  try {
    if (!windowIsSafeToSubmit(window, now)) {
      return { outcome: { kind: "timeout" }, nextPrivateState: input.privateState, window, submitted: false };
    }
    await writeJoinedPrivateState(
      input.providers as Parameters<typeof writeJoinedPrivateState>[0],
      input.contractAddress,
      input.privateState,
    );
    const { status, txId } = await callCircuit(
      input.providers,
      input.contractAddress,
      "authorizeAction",
      [
        hex32ToBytes(input.intent.agentId),
        hex32ToBytes(input.intent.actionId),
        0,
        input.intent.amount,
        input.vendorId,
        hex32ToBytes(input.organizationId),
        window.periodStart,
        window.periodEnd,
      ],
    );
    const submitted = outcomeFromTxStatus({
      status,
      actionId: asHex32(input.intent.actionId),
      contractAddress: input.contractAddress,
      txId,
    });
    if (submitted.kind !== "pending") {
      return { outcome: submitted, nextPrivateState: input.privateState, window, txId, submitted: false };
    }
    const nextPrivateState = applySuccessfulSpend(
      input.privateState,
      input.intent.amount,
      nextSpendSalt,
      window.periodStart,
    );
    await writeJoinedPrivateState(
      input.providers as Parameters<typeof writeJoinedPrivateState>[0],
      input.contractAddress,
      nextPrivateState,
    );
    const confirmed = await waitForPublicAction({
      actionId: asHex32(input.intent.actionId),
      contractAddress: input.contractAddress,
      expectedResult: "authorized",
      timeoutMs: input.confirmTimeoutMs ?? 30_000,
      pollMs: input.confirmPollMs ?? 1_000,
      readLedger: () => readPublicLedger(input.providers as LedgerProviders, input.contractAddress),
    });
    return {
      outcome: outcomeFromIndexerConfirm({
        confirmed: confirmed.status === "confirmed",
        actionId: asHex32(input.intent.actionId),
        contractAddress: input.contractAddress,
        txId,
      }),
      nextPrivateState,
      window,
      txId,
      submitted: true,
    };
  } catch (error) {
    return {
      outcome: outcomeFromCaughtError(error),
      nextPrivateState: input.privateState,
      window,
      submitted: false,
    };
  }
}
