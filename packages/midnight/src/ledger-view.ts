/**
 * Project Compact `ledger()` public state into UI types.
 * Only commitments, ids, statuses, and counters — never witnesses.
 */

import {
  asHex32,
  bytesToHex32,
  type PublicAction,
  type PublicAgent,
  type PublicMember,
  type PublicOrganization,
} from "@velios/shared-types";

export type CompactMemberRow = {
  organizationId: Uint8Array;
  status: number;
  memberCommitment: Uint8Array;
};

export type CompactAgentRow = {
  organizationId: Uint8Array;
  status: number;
  memberId: Uint8Array;
  ownerCommitment: Uint8Array;
  agentCommitment: Uint8Array;
  roleCommitment: Uint8Array;
  policyCommitment: Uint8Array;
  spendCommitment: Uint8Array;
};

export type CompactActionRow = {
  agentId: Uint8Array;
  actionType: number;
  result: number;
  resultCommitment: Uint8Array;
  periodStart: bigint;
  periodEnd: bigint;
};

export type CompactLedger = {
  organizationId: Uint8Array;
  organizationStatus: number;
  adminCommitment: Uint8Array;
  members: Iterable<[Uint8Array, CompactMemberRow]>;
  agents: Iterable<[Uint8Array, CompactAgentRow]>;
  actions: Iterable<[Uint8Array, CompactActionRow]>;
  memberCount: bigint;
  agentCount: bigint;
  actionCount: bigint;
};

export type PublicLedgerView = {
  organization: PublicOrganization;
  members: PublicMember[];
  agents: PublicAgent[];
  actions: PublicAction[];
};

function activeStatus(value: number): "inactive" | "active" {
  return value === 1 ? "active" : "inactive";
}

export function projectLedger(ledger: CompactLedger, contractAddress: string): PublicLedgerView {
  const organizationId = bytesToHex32(ledger.organizationId);
  const members: PublicMember[] = [];
  for (const [memberId, row] of ledger.members) {
    members.push({
      memberId: bytesToHex32(memberId),
      organizationId: bytesToHex32(row.organizationId),
      status: activeStatus(row.status),
      memberCommitment: bytesToHex32(row.memberCommitment),
    });
  }
  const agents: PublicAgent[] = [];
  for (const [agentId, row] of ledger.agents) {
    agents.push({
      agentId: bytesToHex32(agentId),
      organizationId: bytesToHex32(row.organizationId),
      status: activeStatus(row.status),
      memberId: bytesToHex32(row.memberId),
      ownerCommitment: bytesToHex32(row.ownerCommitment),
      agentCommitment: bytesToHex32(row.agentCommitment),
      roleCommitment: bytesToHex32(row.roleCommitment),
      policyCommitment: bytesToHex32(row.policyCommitment),
      spendCommitment: bytesToHex32(row.spendCommitment),
    });
  }
  const actions: PublicAction[] = [];
  for (const [actionId, row] of ledger.actions) {
    actions.push({
      actionId: bytesToHex32(actionId),
      agentId: bytesToHex32(row.agentId),
      actionType: "payment",
      result: "authorized",
      resultCommitment: bytesToHex32(row.resultCommitment),
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
    });
  }
  return {
    organization: {
      organizationId,
      status: activeStatus(ledger.organizationStatus),
      adminCommitment: bytesToHex32(ledger.adminCommitment),
      contractAddress,
      memberCount: ledger.memberCount,
      agentCount: ledger.agentCount,
      actionCount: ledger.actionCount,
    },
    members,
    agents,
    actions,
  };
}

export function contractStateValue(state: unknown): unknown {
  if (state && typeof state === "object" && "data" in state) {
    return (state as { data: unknown }).data;
  }
  return state;
}

export function asPublishedHex(value: string) {
  return asHex32(value);
}
