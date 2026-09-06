/**
 * TEST / LOCAL CIRCUIT MODEL ONLY.
 *
 * This file mirrors `compact/authorization.compact` so Wave 1 predicates can
 * be exercised before `compact compile` artifacts exist. It is NOT a Midnight
 * ledger, NOT a proof server, and MUST NOT be imported from production UI or
 * `packages/midnight` provider paths.
 *
 * Authority on a real network is the compiled Compact circuit + MidnightJS
 * transaction status `SucceedEntirely`.
 *
 * The circuit reads block time from the ledger clock. Here the caller supplies
 * `blockTimeSeconds`, standing in for `kernel.blockTimeGreaterThan`.
 */

import {
  agentCommitment,
  memberCommitment,
  ownerCommitment,
  policyCommitment,
  resultCommitment,
  roleCommitment,
  spendCommitment,
} from "@velios/policy-engine";
import type { VeliosPrivateState } from "@velios/shared-types";
import { bytesEqual } from "@velios/policy-engine";

export type OrganizationStatus = "inactive" | "active";
export type MemberStatus = "inactive" | "active";
export type AgentStatus = "inactive" | "active";
export type ActionType = "payment";

export type MemberPublic = {
  organizationId: Uint8Array;
  status: MemberStatus;
  memberCommitment: Uint8Array;
};

export type AgentPublic = {
  organizationId: Uint8Array;
  status: AgentStatus;
  memberId: Uint8Array;
  ownerCommitment: Uint8Array;
  agentCommitment: Uint8Array;
  roleCommitment: Uint8Array;
  policyCommitment: Uint8Array;
  spendCommitment: Uint8Array;
};

export type ActionPublic = {
  agentId: Uint8Array;
  actionType: ActionType;
  result: "authorized";
  resultCommitment: Uint8Array;
  periodStart: bigint;
  periodEnd: bigint;
};

export type ReplicaLedger = {
  organizationId: Uint8Array;
  organizationStatus: OrganizationStatus;
  adminCommitment: Uint8Array;
  members: Map<string, MemberPublic>;
  agents: Map<string, AgentPublic>;
  usedActionIds: Set<string>;
  actions: Map<string, ActionPublic>;
  memberCount: bigint;
  agentCount: bigint;
  actionCount: bigint;
};

export class CircuitAssertError extends Error {
  readonly assertMessage: string;
  constructor(assertMessage: string) {
    super(assertMessage);
    this.name = "CircuitAssertError";
    this.assertMessage = assertMessage;
  }
}

function key(id: Uint8Array): string {
  return [...id].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function assert(cond: boolean, message: string): void {
  if (!cond) throw new CircuitAssertError(message);
}

function currentPolicyCommitment(privateState: VeliosPrivateState): Uint8Array {
  return policyCommitment(privateState);
}

function currentSpendCommitment(privateState: VeliosPrivateState): Uint8Array {
  return spendCommitment(
    privateState.spendPeriodStart,
    privateState.dailySpend,
    privateState.spendSalt,
  );
}

function currentRoleCommitment(privateState: VeliosPrivateState): Uint8Array {
  return roleCommitment(privateState.agentRole, privateState.roleSalt);
}

/** Mirrors `assertWindowIsNow`. */
function assertWindowIsNow(
  periodStart: bigint,
  periodEnd: bigint,
  blockTimeSeconds: bigint,
): void {
  assert(periodEnd > periodStart, "invalid period");
  assert(periodEnd - periodStart <= 86_400n, "period too long");
  assert(blockTimeSeconds > periodStart, "period not started");
  assert(!(blockTimeSeconds > periodEnd), "period elapsed");
}

export function constructOrganization(
  orgId: Uint8Array,
  privateState: VeliosPrivateState,
): ReplicaLedger {
  return {
    organizationId: orgId,
    organizationStatus: "active",
    adminCommitment: ownerCommitment(privateState.ownerSecret),
    members: new Map(),
    agents: new Map(),
    usedActionIds: new Set(),
    actions: new Map(),
    memberCount: 0n,
    agentCount: 0n,
    actionCount: 0n,
  };
}

export function setOrganizationStatus(
  ledger: ReplicaLedger,
  status: OrganizationStatus,
  privateState: VeliosPrivateState,
): void {
  assert(
    bytesEqual(ledger.adminCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  ledger.organizationStatus = status;
}

export function registerMember(
  ledger: ReplicaLedger,
  memberId: Uint8Array,
  privateState: VeliosPrivateState,
): void {
  assert(ledger.organizationStatus === "active", "organization inactive");
  assert(
    bytesEqual(ledger.adminCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  assert(!ledger.members.has(key(memberId)), "member exists");
  ledger.members.set(key(memberId), {
    organizationId: ledger.organizationId,
    status: "active",
    memberCommitment: memberCommitment(privateState.memberSecret),
  });
  ledger.memberCount += 1n;
}

export function setMemberStatus(
  ledger: ReplicaLedger,
  memberId: Uint8Array,
  status: MemberStatus,
  privateState: VeliosPrivateState,
): void {
  assert(
    bytesEqual(ledger.adminCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  const existing = ledger.members.get(key(memberId));
  assert(Boolean(existing), "member missing");
  ledger.members.set(key(memberId), { ...existing!, status });
}

export function createAgent(
  ledger: ReplicaLedger,
  agentId: Uint8Array,
  memberId: Uint8Array,
  privateState: VeliosPrivateState,
): void {
  assert(ledger.organizationStatus === "active", "organization inactive");
  assert(!ledger.agents.has(key(agentId)), "agent exists");

  const member = ledger.members.get(key(memberId));
  assert(Boolean(member), "member missing");
  assert(member!.status === "active", "member inactive");
  assert(
    bytesEqual(member!.memberCommitment, memberCommitment(privateState.memberSecret)),
    "unauthorized",
  );

  ledger.agents.set(key(agentId), {
    organizationId: ledger.organizationId,
    status: "active",
    memberId,
    ownerCommitment: ownerCommitment(privateState.ownerSecret),
    agentCommitment: agentCommitment(privateState.agentSecret),
    roleCommitment: currentRoleCommitment(privateState),
    policyCommitment: currentPolicyCommitment(privateState),
    spendCommitment: currentSpendCommitment(privateState),
  });
  ledger.agentCount += 1n;
}

export function setAgentPolicy(
  ledger: ReplicaLedger,
  agentId: Uint8Array,
  privateState: VeliosPrivateState,
): void {
  assert(ledger.organizationStatus === "active", "organization inactive");
  const agent = ledger.agents.get(key(agentId));
  assert(Boolean(agent), "agent missing");
  assert(agent!.status === "active", "agent inactive");
  assert(
    bytesEqual(agent!.ownerCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  ledger.agents.set(key(agentId), {
    ...agent!,
    roleCommitment: currentRoleCommitment(privateState),
    policyCommitment: currentPolicyCommitment(privateState),
  });
}

/**
 * Self-service policy rotation. Gated on the *currently committed* policy, so
 * an agent cannot grant itself the permission it lacks.
 */
export function setAgentPolicyBySelf(
  ledger: ReplicaLedger,
  agentId: Uint8Array,
  privateState: VeliosPrivateState,
): void {
  assert(ledger.organizationStatus === "active", "organization inactive");
  const agent = ledger.agents.get(key(agentId));
  assert(Boolean(agent), "agent missing");
  assert(agent!.status === "active", "agent inactive");
  assert(
    bytesEqual(agent!.agentCommitment, agentCommitment(privateState.agentSecret)),
    "unauthorized",
  );
  assert(
    bytesEqual(agent!.policyCommitment, currentPolicyCommitment(privateState)),
    "policy predicate failed",
  );
  assert(privateState.selfModifyAllowed, "self modify denied");
  ledger.agents.set(key(agentId), {
    ...agent!,
    roleCommitment: currentRoleCommitment(privateState),
  });
}

export function setAgentStatus(
  ledger: ReplicaLedger,
  agentId: Uint8Array,
  status: AgentStatus,
  privateState: VeliosPrivateState,
): void {
  const agent = ledger.agents.get(key(agentId));
  assert(Boolean(agent), "agent missing");
  assert(
    bytesEqual(agent!.ownerCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  ledger.agents.set(key(agentId), { ...agent!, status });
}

export function authorizeAction(
  ledger: ReplicaLedger,
  args: {
    agentId: Uint8Array;
    actionId: Uint8Array;
    actionType: ActionType;
    amount: bigint;
    vendorId: Uint8Array;
    claimedOrganizationId: Uint8Array;
    periodStart: bigint;
    periodEnd: bigint;
    blockTimeSeconds: bigint;
  },
  privateState: VeliosPrivateState,
): void {
  assert(ledger.organizationStatus === "active", "organization inactive");
  assert(bytesEqual(args.claimedOrganizationId, ledger.organizationId), "wrong organization");
  const agent = ledger.agents.get(key(args.agentId));
  assert(Boolean(agent), "agent missing");
  assert(bytesEqual(agent!.organizationId, ledger.organizationId), "wrong organization");
  assert(agent!.status === "active", "agent inactive");

  const member = ledger.members.get(key(agent!.memberId));
  assert(Boolean(member), "member missing");
  assert(member!.status === "active", "member inactive");

  assertWindowIsNow(args.periodStart, args.periodEnd, args.blockTimeSeconds);

  assert(
    bytesEqual(agent!.ownerCommitment, ownerCommitment(privateState.ownerSecret)),
    "unauthorized",
  );
  assert(
    bytesEqual(agent!.policyCommitment, currentPolicyCommitment(privateState)),
    "policy predicate failed",
  );
  assert(
    bytesEqual(agent!.spendCommitment, currentSpendCommitment(privateState)),
    "policy predicate failed",
  );

  assert(privateState.credentialOk, "credential predicate failed");
  assert(privateState.credentialExpiry >= args.periodEnd, "credential expired");
  assert(bytesEqual(args.vendorId, privateState.vendorId), "policy predicate failed");
  assert(args.amount <= privateState.perActionLimit, "policy predicate failed");

  assert(privateState.spendPeriodStart <= args.periodStart, "stale period");
  const carried =
    privateState.spendPeriodStart === args.periodStart ? privateState.dailySpend : 0n;
  const nextSpend = carried + args.amount;
  assert(nextSpend >= carried, "policy predicate failed");
  assert(nextSpend <= privateState.dailyLimit, "policy predicate failed");
  assert(!ledger.usedActionIds.has(key(args.actionId)), "replay");

  ledger.usedActionIds.add(key(args.actionId));
  ledger.actions.set(key(args.actionId), {
    agentId: args.agentId,
    actionType: args.actionType,
    result: "authorized",
    resultCommitment: resultCommitment(args.actionId, args.agentId),
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
  });
  ledger.actionCount += 1n;
  ledger.agents.set(key(args.agentId), {
    ...agent!,
    spendCommitment: spendCommitment(
      args.periodStart,
      nextSpend,
      privateState.nextSpendSalt,
    ),
  });
}
