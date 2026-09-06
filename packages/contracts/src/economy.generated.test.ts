import { describe, expect, it } from "vitest";
import { loadCompiledEconomy } from "./index.js";
import { compiledEconomyArtifactsPresent } from "./node-artifacts.js";

const ECONOMY_CIRCUITS = [
  "issueCredential",
  "revokeCredential",
  "authorizePayment",
  "depositNight",
  "settleAuthorizedPayment",
  "createProposal",
  "castBallot",
  "finalizeProposal",
  "createProcurement",
  "submitBid",
  "awardProcurement",
  "recordDisclosure",
] as const;

describe("Wave 2 compiled economy", () => {
  it("exposes every economy circuit when artifacts exist", async () => {
    if (!compiledEconomyArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:economy`. Skipping.");
      return;
    }
    const loaded = await loadCompiledEconomy();
    expect(loaded).not.toBeNull();
    const dummy = Object.fromEntries(
      [
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
        "spendSalt",
        "nextSpendSalt",
        "policySalt",
        "ballotChoice",
        "ballotSalt",
        "tallyYes",
        "tallyNo",
        "bidSalt",
        "bidAmount",
        "awardSalt",
      ].map((name) => [name, () => undefined]),
    );
    const instance = new (loaded!.Contract as new (w: unknown) => {
      impureCircuits: Record<string, unknown>;
    })(dummy);
    for (const circuitId of ECONOMY_CIRCUITS) {
      expect(typeof instance.impureCircuits[circuitId], circuitId).toBe("function");
    }
  });
});
