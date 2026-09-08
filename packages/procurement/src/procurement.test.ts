import { holderCommitment, issueOrganizationCredential } from "@velios/credentials";
import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { awardLowestBid, createProcurement, publicProcurementView, submitSealedBid } from "./index.js";

describe("sealed procurement", () => {
  it("hides losing bids from the public view", () => {
    const procurementId = new Uint8Array(32).fill(6);
    const holderA = holderCommitment(randomBytes32());
    const holderB = holderCommitment(randomBytes32());
    const cred = (holderSecret: Uint8Array) =>
      issueOrganizationCredential({
        holderSecret,
        organizationId: new Uint8Array(32).fill(1),
        className: "procurement",
        expiry: 2_000_000_000n,
        salt: randomBytes32(),
        revocationSecret: randomBytes32(),
      });
    const secretA = randomBytes32();
    const secretB = randomBytes32();
    const lot = createProcurement({
      procurementId,
      windowStart: 1n,
      windowEnd: 10n,
      budget: 500n,
    });
    const saltA = randomBytes32();
    const saltB = randomBytes32();
    submitSealedBid({
      lot,
      holder: holderCommitment(secretA),
      amount: 200n,
      salt: saltA,
      now: 5n,
      credential: cred(secretA),
      revoked: [],
    });
    submitSealedBid({
      lot,
      holder: holderCommitment(secretB),
      amount: 350n,
      salt: saltB,
      now: 5n,
      credential: cred(secretB),
      revoked: [],
    });
    const treasuryActionId = new Uint8Array(32).fill(7);
    const award = awardLowestBid({
      lot,
      openings: [
        { holder: holderCommitment(secretA), amount: 200n, salt: saltA },
        { holder: holderCommitment(secretB), amount: 350n, salt: saltB },
      ],
      awardSalt: randomBytes32(),
      treasuryActionId,
      authorizedActionIds: [treasuryActionId],
    });
    const published = JSON.stringify({
      view: publicProcurementView(lot),
      award: Buffer.from(award).toString("hex"),
    });
    expect(published).not.toMatch(/350|losing|bidAmount/);
    expect(() =>
      awardLowestBid({
        lot: createProcurement({ procurementId, windowStart: 1n, windowEnd: 10n, budget: 100n }),
        openings: [],
        awardSalt: randomBytes32(),
        treasuryActionId,
        authorizedActionIds: [treasuryActionId],
      }),
    ).toThrow(/no bids/);
    expect(() =>
      awardLowestBid({
        lot,
        openings: [
          { holder: holderCommitment(secretA), amount: 200n, salt: saltA },
          { holder: holderCommitment(secretB), amount: 350n, salt: saltB },
        ],
        awardSalt: randomBytes32(),
        treasuryActionId,
        authorizedActionIds: [],
      }),
    ).toThrow(/authorization missing/);
    expect(holderA).not.toEqual(holderB);
    const lateLot = createProcurement({
      procurementId,
      windowStart: 1n,
      windowEnd: 10n,
      budget: 500n,
    });
    expect(() =>
      submitSealedBid({
        lot: lateLot,
        holder: holderCommitment(secretA),
        amount: 100n,
        salt: randomBytes32(),
        now: 11n,
        credential: cred(secretA),
        revoked: [],
      }),
    ).toThrow(/late bid/);
  });
});
