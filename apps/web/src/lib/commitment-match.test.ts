import { commitmentsFromPrivateState, randomBytes32 } from "@velios/policy-engine";
import { bytesToHex32, type PublicAgent, type PublicMember, type VeliosPrivateState } from "@velios/shared-types";
import { roleLabelToBytes, vendorIdFromRecipient } from "@velios/midnight/ids";
import { describe, expect, it } from "vitest";
import { matchOperatorToLedger } from "./commitment-match.js";

function sampleState(): VeliosPrivateState {
  return {
    ownerSecret: randomBytes32(),
    memberSecret: randomBytes32(),
    agentSecret: randomBytes32(),
    agentRole: roleLabelToBytes("Treasury Operator"),
    roleSalt: randomBytes32(),
    perActionLimit: 10n,
    dailyLimit: 20n,
    vendorId: vendorIdFromRecipient("supplier"),
    credentialOk: true,
    credentialExpiry: 2_000_000_000n,
    selfModifyAllowed: false,
    policySalt: randomBytes32(),
    spendPeriodStart: 0n,
    dailySpend: 0n,
    spendSalt: randomBytes32(),
    nextSpendSalt: randomBytes32(),
  };
}

function agentFrom(state: VeliosPrivateState): PublicAgent {
  const local = commitmentsFromPrivateState(state);
  return {
    agentId: bytesToHex32(randomBytes32()),
    organizationId: bytesToHex32(randomBytes32()),
    status: "active",
    memberId: bytesToHex32(randomBytes32()),
    ownerCommitment: bytesToHex32(local.owner),
    agentCommitment: bytesToHex32(local.agent),
    roleCommitment: bytesToHex32(local.role),
    policyCommitment: bytesToHex32(local.policy),
    spendCommitment: bytesToHex32(local.spend),
  };
}

describe("matchOperatorToLedger", () => {
  it("returns none without private state", () => {
    expect(matchOperatorToLedger({ privateState: null, members: [] })).toBe("none");
  });

  it("returns ready_to_create when no agent exists", () => {
    expect(matchOperatorToLedger({ privateState: sampleState(), members: [] })).toBe("ready_to_create");
  });

  it("returns verified when all four commitments match", () => {
    const state = sampleState();
    expect(matchOperatorToLedger({ privateState: state, agent: agentFrom(state), members: [] })).toBe("verified");
  });

  it("returns stale_spend when only spend differs", () => {
    const state = sampleState();
    const agent = agentFrom(state);
    const stale: VeliosPrivateState = { ...state, spendSalt: randomBytes32() };
    expect(matchOperatorToLedger({ privateState: stale, agent, members: [] })).toBe("stale_spend");
  });

  it("returns mismatch when owner does not open the agent", () => {
    const state = sampleState();
    const other = sampleState();
    expect(matchOperatorToLedger({ privateState: other, agent: agentFrom(state), members: [] })).toBe("mismatch");
  });

  it("returns mismatch when members exist but none match and there is no agent", () => {
    const state = sampleState();
    const member: PublicMember = {
      memberId: bytesToHex32(randomBytes32()),
      organizationId: bytesToHex32(randomBytes32()),
      status: "active",
      memberCommitment: bytesToHex32(randomBytes32()),
    };
    expect(matchOperatorToLedger({ privateState: state, members: [member] })).toBe("mismatch");
  });
});
