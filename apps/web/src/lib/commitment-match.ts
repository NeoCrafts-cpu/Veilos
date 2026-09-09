import { commitmentsFromPrivateState, bytesEqual } from "@velios/policy-engine";
import { hex32ToBytes, type OperatorMatch, type PublicAgent, type PublicMember, type VeliosPrivateState } from "@velios/shared-types";

export function matchOperatorToLedger(input: {
  privateState: VeliosPrivateState | null;
  agent?: PublicAgent | undefined;
  members: PublicMember[];
}): OperatorMatch {
  if (!input.privateState) return "none";
  const local = commitmentsFromPrivateState(input.privateState);
  const memberHit = input.members.some((member) =>
    bytesEqual(local.member, hex32ToBytes(member.memberCommitment)),
  );
  if (!input.agent) {
    return memberHit || input.members.length === 0 ? "ready_to_create" : "mismatch";
  }
  const owner = bytesEqual(local.owner, hex32ToBytes(input.agent.ownerCommitment));
  const role = bytesEqual(local.role, hex32ToBytes(input.agent.roleCommitment));
  const policy = bytesEqual(local.policy, hex32ToBytes(input.agent.policyCommitment));
  const spend = bytesEqual(local.spend, hex32ToBytes(input.agent.spendCommitment));
  if (owner && role && policy && spend) return "verified";
  if (owner && role && policy) return "stale_spend";
  return "mismatch";
}
