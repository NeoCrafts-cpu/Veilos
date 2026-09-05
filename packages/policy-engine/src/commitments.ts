import type { VeliosPrivateState } from "@velios/shared-types";
import {
  DOMAIN_AGENT_KEY,
  DOMAIN_INTENT,
  DOMAIN_MEMBER,
  DOMAIN_OWNER,
  DOMAIN_POLICY,
  DOMAIN_REASON,
  DOMAIN_RESULT,
  DOMAIN_ROLE,
  DOMAIN_SPEND,
  encodeBoolean,
  encodeUint64,
  pad32,
  persistentHash,
} from "./encoding.js";

export function ownerCommitment(ownerSecret: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_OWNER), ownerSecret]);
}

export function memberCommitment(memberSecret: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_MEMBER), memberSecret]);
}

export function agentCommitment(agentSecret: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_AGENT_KEY), agentSecret]);
}

export function roleCommitment(role: Uint8Array, salt: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_ROLE), role, salt]);
}

export function policyCommitment(input: {
  perActionLimit: bigint;
  dailyLimit: bigint;
  vendorId: Uint8Array;
  credentialOk: boolean;
  credentialExpiry: bigint;
  selfModifyAllowed: boolean;
  salt?: Uint8Array;
  policySalt?: Uint8Array;
}): Uint8Array {
  const salt = input.salt ?? input.policySalt;
  if (!salt) {
    throw new Error("policy salt required");
  }
  return persistentHash([
    pad32(DOMAIN_POLICY),
    encodeUint64(input.perActionLimit),
    encodeUint64(input.dailyLimit),
    input.vendorId,
    encodeBoolean(input.credentialOk),
    encodeUint64(input.credentialExpiry),
    encodeBoolean(input.selfModifyAllowed),
    salt,
  ]);
}

export function spendCommitment(
  periodStart: bigint,
  dailySpend: bigint,
  salt: Uint8Array,
): Uint8Array {
  return persistentHash([
    pad32(DOMAIN_SPEND),
    encodeUint64(periodStart),
    encodeUint64(dailySpend),
    salt,
  ]);
}

export function resultCommitment(actionId: Uint8Array, agentId: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_RESULT), actionId, agentId]);
}

export function reasonDigest(reason: string): Uint8Array {
  return persistentHash([pad32(DOMAIN_REASON), pad32(reason.slice(0, 32))]);
}

export function intentCommitment(input: {
  actionId: Uint8Array;
  agentId: Uint8Array;
  organizationId: Uint8Array;
  amount: bigint;
  vendorId: Uint8Array;
  reason: string;
  periodStart: bigint;
  periodEnd: bigint;
  salt: Uint8Array;
  actionType?: bigint;
}): Uint8Array {
  return persistentHash([
    pad32(DOMAIN_INTENT),
    input.actionId,
    input.agentId,
    input.organizationId,
    encodeUint64(input.actionType ?? 0n),
    encodeUint64(input.amount),
    input.vendorId,
    reasonDigest(input.reason),
    encodeUint64(input.periodStart),
    encodeUint64(input.periodEnd),
    input.salt,
  ]);
}

export function commitmentsFromPrivateState(state: VeliosPrivateState): {
  owner: Uint8Array;
  member: Uint8Array;
  agent: Uint8Array;
  role: Uint8Array;
  policy: Uint8Array;
  spend: Uint8Array;
} {
  return {
    owner: ownerCommitment(state.ownerSecret),
    member: memberCommitment(state.memberSecret),
    agent: agentCommitment(state.agentSecret),
    role: roleCommitment(state.agentRole, state.roleSalt),
    policy: policyCommitment(state),
    spend: spendCommitment(state.spendPeriodStart, state.dailySpend, state.spendSalt),
  };
}
