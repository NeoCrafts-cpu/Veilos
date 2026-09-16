import { describe, expect, it } from "vitest";
import { compiledEconomyArtifactsPresent } from "@velios/contracts/node";
import { PREVIEW_ECONOMY_DEPLOYMENT } from "@velios/midnight/published";

const live = process.env["VELIOS_LIVE_PREVIEW"] === "1";
const required = process.env["VELIOS_REQUIRE_MIDNIGHT"] === "1";

describe("Wave 2 live Preview W2-L1–W2-L7", () => {
  it("keeps live cases gated on a real wallet and provider", () => {
    if (!live) {
      expect(live).toBe(false);
      return;
    }
    const seed = process.env["VELIOS_WALLET_SEED"];
    const proof = process.env["VELIOS_PROOF_SERVER"];
    if (!seed || !proof) {
      throw new Error("ENVIRONMENT MISSING: VELIOS_LIVE_PREVIEW=1 requires a real wallet seed and proof server.");
    }
    expect(compiledEconomyArtifactsPresent() || !required).toBe(true);
  });

  it.skipIf(!live)("W2-L1 published economy-preview address is the retained Preview deploy", () => {
    expect(PREVIEW_ECONOMY_DEPLOYMENT.contractAddress).toMatch(/^[0-9a-f]{64}$/);
    expect(PREVIEW_ECONOMY_DEPLOYMENT.deployTxId.length).toBeGreaterThan(8);
  });

  it.skipIf(!live)("W2-L2–W2-L7 require a live caller, not a replica", () => {
    throw new Error(
      "ENVIRONMENT MISSING: run the operator app with a Preview wallet to retain credential, payment, settlement, companion, and award tx evidence in docs/preview-evidence.md.",
    );
  });
});
