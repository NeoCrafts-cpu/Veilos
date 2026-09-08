import { encodeUint64, pad32, persistentHash } from "@velios/policy-engine";

export function settlementNullifier(actionId: Uint8Array): Uint8Array {
  return persistentHash([pad32("velios:settle:"), actionId]);
}

export function addressCommitment(addressBytes: Uint8Array): Uint8Array {
  return persistentHash([pad32("velios:addr:"), addressBytes]);
}

export function ballotCommitment(input: {
  proposalId: Uint8Array;
  holder: Uint8Array;
  choice: bigint;
  salt: Uint8Array;
}): Uint8Array {
  return persistentHash([
    pad32("velios:ballot:"),
    input.proposalId,
    input.holder,
    encodeUint64(input.choice),
    input.salt,
  ]);
}

export function voteNullifier(proposalId: Uint8Array, holder: Uint8Array): Uint8Array {
  return persistentHash([pad32("velios:votenul:"), proposalId, holder]);
}

export function bidCommitment(input: {
  procurementId: Uint8Array;
  holder: Uint8Array;
  amount: bigint;
  salt: Uint8Array;
}): Uint8Array {
  return persistentHash([
    pad32("velios:bid:"),
    input.procurementId,
    input.holder,
    encodeUint64(input.amount),
    input.salt,
  ]);
}

export function awardCommitment(input: {
  procurementId: Uint8Array;
  winnerBid: Uint8Array;
  salt: Uint8Array;
}): Uint8Array {
  return persistentHash([pad32("velios:award:"), input.procurementId, input.winnerBid, input.salt]);
}

export function disclosureScopeCommitment(input: {
  auditorId: Uint8Array;
  claims: Uint8Array;
  nonce: Uint8Array;
}): Uint8Array {
  return persistentHash([pad32("velios:disclose:"), input.auditorId, input.claims, input.nonce]);
}
