/**
 * Real local Midnight I1–I7 runner. Uses official CLI wallet + MidnightJS.
 * Never logs seeds, witnesses, or private policy values.
 */

import { WebSocket } from "ws";
import { createVeliosPrivateState } from "@velios/contracts";
import { compiledArtifactsPresent, zkConfigPath } from "@velios/contracts/node";
import {
  agentIdFromLabel,
  LOCAL_CONFIG,
  memberIdFromLabel,
  newActionId,
  organizationIdFromName,
  roleLabelToBytes,
  vendorIdFromRecipient,
} from "@velios/midnight";
import { authorizePayment, callCircuit, deployOrganization } from "@velios/midnight/client";
import { findPublicAction, waitForPublicAction } from "@velios/midnight/indexer-confirm";
import { readPublicLedger } from "@velios/midnight";
import { currentAuthorizationWindow, randomBytes32 } from "@velios/policy-engine";
import { hex32ToBytes, MIDNIGHT_SUCCESS_STATUS } from "@velios/shared-types";

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket = WebSocket;

export type LocalSliceResult = {
  contractAddress: string;
  deployStatus: string;
  registerMemberStatus: string;
  createAgentStatus: string;
  setAgentPolicyStatus: string;
  authorizeStatus: string;
  actionId: string;
  indexedActionId?: string;
  invalidOutcome: string;
  invalidIndexed: boolean;
};

let cached: Promise<LocalSliceResult> | undefined;

export async function runLocalVerticalSlice(): Promise<LocalSliceResult> {
  cached ??= runOnce();
  return cached;
}

async function runOnce(): Promise<LocalSliceResult> {
  if (!compiledArtifactsPresent()) {
    throw new Error("environment missing: compact artifacts");
  }
  const seed = process.env["VELIOS_WALLET_SEED"];
  if (!seed) {
    throw new Error("environment missing: VELIOS_WALLET_SEED is required for the local Midnight slice");
  }

  const { MidnightWalletProvider } = await import("@velios/cli/wallet");
  const { buildCliProviders } = await import("@velios/cli/providers");
  const wallet = await MidnightWalletProvider.build(LOCAL_CONFIG, { kind: "seed", value: seed });
  await wallet.start();
  try {
    const window = currentAuthorizationWindow();
    const privateState = createVeliosPrivateState({
      ownerSecret: randomBytes32(),
      memberSecret: randomBytes32(),
      agentSecret: randomBytes32(),
      agentRole: roleLabelToBytes("Treasury Operator"),
      roleSalt: randomBytes32(),
      perActionLimit: 25_000n,
      dailyLimit: 25_000n,
      vendorId: vendorIdFromRecipient("supplier-8271"),
      credentialOk: true,
      credentialExpiry: window.periodEnd + 30n * 86_400n,
      selfModifyAllowed: false,
      policySalt: randomBytes32(),
      spendSalt: randomBytes32(),
    });
    const providers = buildCliProviders(wallet, zkConfigPath, LOCAL_CONFIG);
    const deployed = await deployOrganization(providers, "VELIOS LOCAL SLICE", privateState, {
      compiledAssetsPath: zkConfigPath,
    });
    const memberId = memberIdFromLabel("FOUNDING-MEMBER");
    const registerMember = await callCircuit(
      providers,
      deployed.contractAddress,
      "registerMember",
      [hex32ToBytes(memberId)],
      { compiledAssetsPath: zkConfigPath },
    );
    const agentId = agentIdFromLabel("TREASURY-01");
    const createAgent = await callCircuit(
      providers,
      deployed.contractAddress,
      "createAgent",
      [hex32ToBytes(agentId), hex32ToBytes(memberId)],
      { compiledAssetsPath: zkConfigPath },
    );
    const setPolicy = await callCircuit(
      providers,
      deployed.contractAddress,
      "setAgentPolicy",
      [hex32ToBytes(agentId)],
      { compiledAssetsPath: zkConfigPath },
    );
    const actionId = newActionId();
    const authorized = await authorizePayment({
      providers,
      contractAddress: deployed.contractAddress,
      organizationId: organizationIdFromName("VELIOS LOCAL SLICE"),
      intent: {
        type: "PAYMENT",
        agentId,
        recipientLabel: "supplier-8271",
        amount: 4_800n,
        reason: "local-slice",
        actionId,
      },
      privateState,
      vendorId: vendorIdFromRecipient("supplier-8271"),
      confirmTimeoutMs: 60_000,
    });
    const confirmed = await waitForPublicAction({
      actionId,
      timeoutMs: 15_000,
      readLedger: () => readPublicLedger(providers, deployed.contractAddress),
    });
    const invalidActionId = newActionId();
    const invalid = await authorizePayment({
      providers,
      contractAddress: deployed.contractAddress,
      organizationId: organizationIdFromName("VELIOS LOCAL SLICE"),
      intent: {
        type: "PAYMENT",
        agentId,
        recipientLabel: "supplier-8271",
        amount: 100_000n,
        reason: "over-limit",
        actionId: invalidActionId,
      },
      privateState: authorized.nextPrivateState,
      vendorId: vendorIdFromRecipient("supplier-8271"),
      confirmTimeoutMs: 5_000,
    });
    const invalidView = await readPublicLedger(providers, deployed.contractAddress);
    return {
      contractAddress: deployed.contractAddress,
      deployStatus: MIDNIGHT_SUCCESS_STATUS,
      registerMemberStatus: registerMember.status,
      createAgentStatus: createAgent.status,
      setAgentPolicyStatus: setPolicy.status,
      authorizeStatus: authorized.outcome.kind,
      actionId,
      indexedActionId: confirmed.action?.actionId ?? findPublicAction(confirmed.view ?? invalidView, actionId)?.actionId,
      invalidOutcome: invalid.outcome.kind,
      invalidIndexed: Boolean(findPublicAction(invalidView, invalidActionId)),
    };
  } finally {
    await wallet.stop().catch(() => undefined);
  }
}
