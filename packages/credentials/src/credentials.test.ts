import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { credentialCommitment, holderCommitment, revocationNullifier } from "./commitments.js";
import { issueOrganizationCredential, OrganizationCredentialRegistry, organizationCredentialHolder } from "./org-issued.js";
import { officialMidnightVcAdapter } from "./official-adapter.js";
import { decryptCredential, encryptCredential } from "./store.js";

const org = new Uint8Array(32).fill(1);

describe("organization-issued credentials", () => {
  it("issues, proves, and revokes without exposing the body in the public record", () => {
    const registry = new OrganizationCredentialRegistry();
    const holderSecret = randomBytes32();
    const salt = randomBytes32();
    const revocationSecret = randomBytes32();
    const issued = registry.issue({
      holderSecret,
      organizationId: org,
      className: "treasury",
      expiry: 2_000_000_000n,
      salt,
      revocationSecret,
    });
    expect(issued.commitment).toEqual(
      credentialCommitment({
        holderSecret,
        organizationId: org,
        className: "treasury",
        expiry: 2_000_000_000n,
        salt,
      }),
    );
    expect(JSON.stringify({ commitment: Buffer.from(issued.commitment).toString("hex") })).not.toMatch(/holderSecret/);
    expect(
      organizationCredentialHolder.prove({
        credential: issued,
        requiredClass: "treasury",
        periodEnd: 1_900_000_000n,
        revoked: [],
      }).ok,
    ).toBe(true);
    registry.revoke(issued.revocationNullifier);
    expect(
      organizationCredentialHolder.prove({
        credential: issued,
        requiredClass: "treasury",
        periodEnd: 1_900_000_000n,
        revoked: [...registry.revoked].map((hex) => Buffer.from(hex, "hex")),
      }),
    ).toEqual({ ok: false, code: "revoked" });
    expect(revocationNullifier(issued.commitment)).toEqual(issued.revocationNullifier);
    expect(revocationNullifier(issued.commitment)).toEqual(revocationNullifier(issued.commitment));
    expect(holderCommitment(holderSecret)).toHaveLength(32);
    expect(
      credentialCommitment({
        holderSecret,
        organizationId: org,
        className: "treasury",
        expiry: 2_000_000_000n,
        salt,
        vendorId: new Uint8Array(32).fill(2),
        perActionLimit: 100n,
        dailyLimit: 200n,
      }),
    ).not.toEqual(issued.commitment);
  });

  it("encrypts credential bodies", async () => {
    const envelope = await encryptCredential(
      {
        organizationId: "aa".repeat(32),
        className: "treasury",
        expiry: "2000000000",
        commitment: "bb".repeat(32),
        holderSecret: "cc".repeat(32),
        salt: "dd".repeat(32),
        revocationSecret: "ee".repeat(32),
      },
      "CorrectHorseBattery",
    );
    expect(JSON.stringify(envelope)).not.toMatch(/holderSecret|CorrectHorse/);
    const opened = await decryptCredential(envelope, "CorrectHorseBattery");
    expect(opened.className).toBe("treasury");
    expect(officialMidnightVcAdapter().compatible).toBe(false);
  });

  it("rejects expired, wrong-issuer, and wrong-holder class proofs", () => {
    const issued = issueOrganizationCredential({
      holderSecret: randomBytes32(),
      organizationId: org,
      className: "treasury",
      expiry: 100n,
      salt: randomBytes32(),
      revocationSecret: randomBytes32(),
    });
    expect(
      organizationCredentialHolder.prove({
        credential: issued,
        requiredClass: "treasury",
        periodEnd: 200n,
        revoked: [],
      }),
    ).toEqual({ ok: false, code: "expired" });
    expect(
      organizationCredentialHolder.prove({
        credential: issued,
        requiredClass: "treasury",
        periodEnd: 50n,
        revoked: [],
        organizationId: new Uint8Array(32).fill(9),
      }),
    ).toEqual({ ok: false, code: "wrong_issuer" });
    expect(
      organizationCredentialHolder.prove({
        credential: issued,
        requiredClass: "auditor",
        periodEnd: 50n,
        revoked: [],
      }),
    ).toEqual({ ok: false, code: "wrong_class" });
  });
});
