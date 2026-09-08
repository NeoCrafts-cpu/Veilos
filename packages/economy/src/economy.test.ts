import { issueOrganizationCredential } from "@velios/credentials";
import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { emptyEconomy, replicaAuthorize, replicaSettle } from "./replica.js";
import { addressCommitment, settlementNullifier } from "./commitments.js";
import { settlementDisclosureCopy } from "./leakage.js";

describe("authorization-bound unshielded settlement", () => {
  const organizationId = new Uint8Array(32).fill(2);
  const actionId = new Uint8Array(32).fill(3);
  const agentId = new Uint8Array(32).fill(4);
  const recipient = new Uint8Array(32).fill(5);
  const vendorId = addressCommitment(recipient);
  const salt = randomBytes32();
  const credential = issueOrganizationCredential({
    holderSecret: randomBytes32(),
    organizationId,
    className: "treasury",
    expiry: 2_000_000_000n,
    salt: randomBytes32(),
    revocationSecret: randomBytes32(),
  });

  it("authorizes only with a valid organization credential", () => {
    const state = emptyEconomy();
    expect(() =>
      replicaAuthorize({
        state,
        actionId,
        agentId,
        organizationId,
        amount: 100n,
        vendorId,
        reason: "invoice",
        periodStart: 1n,
        periodEnd: 2n,
        salt,
        credential,
        requiredClass: "admin",
        perActionLimit: 1_000n,
        dailyLimit: 1_000n,
      }),
    ).toThrow(/wrong_class/);
  });

  it("settles once and rejects altered amount or recipient", () => {
    const state = emptyEconomy();
    replicaAuthorize({
      state,
      actionId,
      agentId,
      organizationId,
      amount: 100n,
      vendorId,
      reason: "invoice",
      periodStart: 1n,
      periodEnd: 2n,
      salt,
      credential,
      requiredClass: "treasury",
      perActionLimit: 1_000n,
      dailyLimit: 1_000n,
    });
    const base = {
      state,
      actionId,
      amount: 100n,
      recipientBytes: recipient,
      vendorId,
      organizationId,
      reason: "invoice",
      salt,
    };
    expect(replicaSettle(base)).toEqual(settlementNullifier(actionId));
    expect(() => replicaSettle(base)).toThrow(/already settled/);
    const other = emptyEconomy();
    replicaAuthorize({
      ...base,
      state: other,
      credential,
      requiredClass: "treasury",
      perActionLimit: 1_000n,
      dailyLimit: 1_000n,
      agentId,
      periodStart: 1n,
      periodEnd: 2n,
    });
    expect(() => replicaSettle({ ...base, state: other, amount: 101n })).toThrow(/intent mismatch/);
    expect(() =>
      replicaSettle({ ...base, state: other, recipientBytes: new Uint8Array(32).fill(9) }),
    ).toThrow(/recipient mismatch/);
  });

  it("documents unshielded leakage before signing", () => {
    const copy = settlementDisclosureCopy();
    expect(copy.publicByDesign).toContain("amount");
    expect(copy.stillPrivate).toContain("reason");
  });
});
