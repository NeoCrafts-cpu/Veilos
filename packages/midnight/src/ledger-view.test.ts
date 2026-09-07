import { describe, expect, it } from "vitest";
import { projectLedger, type CompactLedger } from "./ledger-view.js";
import { PREVIEW_DEPLOYMENT, PREVIEW_ECONOMY_DEPLOYMENT } from "./published.js";

function bytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

describe("public ledger projection", () => {
  it("maps Compact ledger fields without copying private integers", () => {
    const org = bytes(PREVIEW_DEPLOYMENT.organizationId);
    const memberId = bytes(PREVIEW_DEPLOYMENT.memberId);
    const ledger: CompactLedger = {
      organizationId: org,
      organizationStatus: 1,
      adminCommitment: bytes("11".repeat(32)),
      members: [
        [
          memberId,
          {
            organizationId: org,
            status: 1,
            memberCommitment: bytes("22".repeat(32)),
          },
        ],
      ],
      agents: [],
      actions: [],
      memberCount: 1n,
      agentCount: 0n,
      actionCount: 0n,
    };
    const view = projectLedger(ledger, PREVIEW_DEPLOYMENT.contractAddress);
    expect(view.organization.organizationId).toBe(PREVIEW_DEPLOYMENT.organizationId);
    expect(view.organization.status).toBe("active");
    expect(view.organization.memberCount).toBe(1n);
    expect(view.members).toHaveLength(1);
    expect(view.members[0]?.memberId).toBe(PREVIEW_DEPLOYMENT.memberId);
    expect(JSON.stringify(view, (_key, value) => (typeof value === "bigint" ? value.toString() : value))).not.toMatch(
      /ownerSecret|perActionLimit|25000/,
    );
  });
});

describe("published Preview deployment", () => {
  it("is the on-chain ACME contract, public fields only", () => {
    expect(PREVIEW_DEPLOYMENT.network).toBe("preview");
    expect(PREVIEW_DEPLOYMENT.contractAddress).toMatch(/^[0-9a-f]{64}$/);
    expect(PREVIEW_DEPLOYMENT.organizationName).toBe("ACME AUTONOMOUS SYSTEMS");
    expect(JSON.stringify(PREVIEW_DEPLOYMENT)).not.toMatch(/ownerSecret|mnemonic|seed/i);
    expect(PREVIEW_ECONOMY_DEPLOYMENT.contractKind).toBe("economy-preview");
    expect(PREVIEW_ECONOMY_DEPLOYMENT.contractAddress).toMatch(/^[0-9a-f]{64}$/);
    expect(PREVIEW_ECONOMY_DEPLOYMENT.contractAddress).not.toBe(PREVIEW_DEPLOYMENT.contractAddress);
  });
});
