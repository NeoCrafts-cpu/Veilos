/**
 * TEST MODEL ONLY. Mirrors economy.compact predicates. Not a ledger.
 */

import { organizationCredentialHolder, type IssuedCredentialPublic } from "@velios/credentials";
import { intentCommitment } from "@velios/policy-engine";
import type { CredentialClass } from "@velios/shared-types";
import { addressCommitment, settlementNullifier } from "./commitments.js";

export class EconomyAssertError extends Error {
  constructor(readonly assertMessage: string) {
    super(assertMessage);
    this.name = "EconomyAssertError";
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new EconomyAssertError(message);
}

export type EconomyReplica = {
  authorizations: Map<string, { intent: Uint8Array; agentId: Uint8Array; periodStart: bigint; periodEnd: bigint }>;
  settlements: Set<string>;
  revoked: Uint8Array[];
};

export function emptyEconomy(): EconomyReplica {
  return { authorizations: new Map(), settlements: new Set(), revoked: [] };
}

export function replicaAuthorize(input: {
  state: EconomyReplica;
  actionId: Uint8Array;
  agentId: Uint8Array;
  organizationId: Uint8Array;
  amount: bigint;
  vendorId: Uint8Array;
  reason: string;
  periodStart: bigint;
  periodEnd: bigint;
  salt: Uint8Array;
  credential: IssuedCredentialPublic;
  requiredClass: CredentialClass;
  perActionLimit: bigint;
  dailyLimit: bigint;
}): Uint8Array {
  const proved = organizationCredentialHolder.prove({
    credential: input.credential,
    requiredClass: input.requiredClass,
    periodEnd: input.periodEnd,
    revoked: input.state.revoked,
    organizationId: input.organizationId,
  });
  assert(proved.ok, proved.ok ? "ok" : proved.code);
  assert(input.amount <= input.perActionLimit, "policy predicate failed");
  assert(input.amount <= input.dailyLimit, "policy predicate failed");
  const intent = intentCommitment({
    actionId: input.actionId,
    agentId: input.agentId,
    organizationId: input.organizationId,
    amount: input.amount,
    vendorId: input.vendorId,
    reason: input.reason,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    salt: input.salt,
  });
  input.state.authorizations.set(Buffer.from(input.actionId).toString("hex"), {
    intent,
    agentId: input.agentId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
  });
  return intent;
}

export function replicaSettle(input: {
  state: EconomyReplica;
  actionId: Uint8Array;
  amount: bigint;
  recipientBytes: Uint8Array;
  vendorId: Uint8Array;
  organizationId: Uint8Array;
  reason: string;
  salt: Uint8Array;
}): Uint8Array {
  const row = input.state.authorizations.get(Buffer.from(input.actionId).toString("hex"));
  assert(Boolean(row), "authorization missing");
  assert(Buffer.from(addressCommitment(input.recipientBytes)).equals(Buffer.from(input.vendorId)), "recipient mismatch");
  const intent = intentCommitment({
    actionId: input.actionId,
    agentId: row!.agentId,
    organizationId: input.organizationId,
    amount: input.amount,
    vendorId: input.vendorId,
    reason: input.reason,
    periodStart: row!.periodStart,
    periodEnd: row!.periodEnd,
    salt: input.salt,
  });
  assert(Buffer.from(intent).equals(Buffer.from(row!.intent)), "intent mismatch");
  const nullifier = settlementNullifier(input.actionId);
  const key = Buffer.from(nullifier).toString("hex");
  assert(!input.state.settlements.has(key), "already settled");
  input.state.settlements.add(key);
  return nullifier;
}
