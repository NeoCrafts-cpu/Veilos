import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { selectedAgent, selectedMember } from "./session-entities.js";

const memberA = {
  memberId: asHex32("11".repeat(32)),
  organizationId: asHex32("33".repeat(32)),
  status: "active" as const,
  memberCommitment: asHex32("44".repeat(32)),
};
const memberB = { ...memberA, memberId: asHex32("22".repeat(32)) };

describe("selected entities", () => {
  it("does not silently pick members[0] when another id is selected", () => {
    expect(selectedMember([memberA, memberB], memberB.memberId)?.memberId).toBe(memberB.memberId);
    expect(selectedMember([memberA, memberB], "ff".repeat(32))).toBeUndefined();
    expect(selectedMember([memberA, memberB])).toBeUndefined();
    expect(selectedMember([memberA])?.memberId).toBe(memberA.memberId);
  });

  it("does not silently pick agents[0] when another id is selected", () => {
    const agentA = {
      agentId: asHex32("55".repeat(32)),
      organizationId: asHex32("33".repeat(32)),
      status: "active" as const,
      memberId: memberA.memberId,
      ownerCommitment: asHex32("66".repeat(32)),
      agentCommitment: asHex32("77".repeat(32)),
      roleCommitment: asHex32("88".repeat(32)),
      policyCommitment: asHex32("99".repeat(32)),
      spendCommitment: asHex32("aa".repeat(32)),
    };
    const agentB = { ...agentA, agentId: asHex32("bb".repeat(32)) };
    expect(selectedAgent([agentA, agentB], agentB.agentId)?.agentId).toBe(agentB.agentId);
    expect(selectedAgent([agentA, agentB])).toBeUndefined();
  });
});
