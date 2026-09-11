import { describe, expect, it } from "vitest";
import { compiledEconomyArtifactsPresent } from "@velios/contracts/node";
import { emptyEconomy, replicaAuthorize, replicaSettle, settlementDisclosureCopy } from "@velios/economy";
import { issueOrganizationCredential } from "@velios/credentials";
import { addressCommitment } from "@velios/economy";
import { randomBytes32 } from "@velios/policy-engine";

const required = process.env["VELIOS_REQUIRE_MIDNIGHT"] === "1";

describe("Wave 2 economy integration", () => {
  it("keeps the Compact economy artifacts available when required", () => {
    const ready = compiledEconomyArtifactsPresent();
    if (!ready && required) {
      throw new Error("VELIOS_REQUIRE_MIDNIGHT=1 but economy Compact artifacts are missing");
    }
    if (!ready) {
      console.warn("ENVIRONMENT MISSING: run `pnpm --filter @velios/contracts compile:economy`");
    }
    expect(ready || !required).toBe(true);
  });

  it("binds settlement to the authorized intent in the replica", () => {
    const organizationId = new Uint8Array(32).fill(1);
    const recipient = new Uint8Array(32).fill(2);
    const vendorId = addressCommitment(recipient);
    const state = emptyEconomy();
    const credential = issueOrganizationCredential({
      holderSecret: randomBytes32(),
      organizationId,
      className: "treasury",
      expiry: 2_000_000_000n,
      salt: randomBytes32(),
      revocationSecret: randomBytes32(),
    });
    replicaAuthorize({
      state,
      actionId: new Uint8Array(32).fill(3),
      agentId: new Uint8Array(32).fill(4),
      organizationId,
      amount: 10n,
      vendorId,
      reason: "award",
      periodStart: 1n,
      periodEnd: 2n,
      salt: randomBytes32(),
      credential,
      requiredClass: "treasury",
      perActionLimit: 100n,
      dailyLimit: 100n,
    });
    expect(settlementDisclosureCopy().publicByDesign).toContain("amount");
    expect(() =>
      replicaSettle({
        state,
        actionId: new Uint8Array(32).fill(3),
        amount: 11n,
        recipientBytes: recipient,
        vendorId,
        organizationId,
        reason: "award",
        salt: new Uint8Array(32).fill(9),
      }),
    ).toThrow();
  });
});
