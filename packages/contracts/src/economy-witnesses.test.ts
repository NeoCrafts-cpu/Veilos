import { describe, expect, it } from "vitest";
import { createEconomyPrivateState, economyWitnesses, emptyCredentialPath } from "./economy-witnesses.js";

describe("economy witnesses", () => {
  it("exposes every Compact-required witness", () => {
    const required = [
      "ownerSecret",
      "holderSecret",
      "credentialClass",
      "credentialExpiry",
      "credentialSalt",
      "credentialPath",
      "revocationSecret",
      "intentSalt",
      "reasonDigestW",
      "vendorId",
      "perActionLimit",
      "dailyLimit",
      "spendPeriodStart",
      "spendDaily",
      "ballotChoice",
      "ballotSalt",
      "tallyYes",
      "tallyNo",
      "bidSalt",
      "bidAmount",
      "awardSalt",
    ];
    for (const name of required) {
      expect(typeof economyWitnesses[name as keyof typeof economyWitnesses], name).toBe("function");
    }
    expect(emptyCredentialPath().path).toHaveLength(10);
    const state = createEconomyPrivateState({ ownerSecret: new Uint8Array(32).fill(1) });
    expect(economyWitnesses.ownerSecret({ privateState: state })[1]).toEqual(state.ownerSecret);
  });
});