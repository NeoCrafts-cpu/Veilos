import { describe, expect, it } from "vitest";
import {
  loadCompiledAuditorPreview,
  loadCompiledGovernancePreview,
  loadCompiledProcurementPreview,
} from "./index.js";
import {
  compiledAuditorPreviewArtifactsPresent,
  compiledGovernancePreviewArtifactsPresent,
  compiledProcurementPreviewArtifactsPresent,
} from "./node-artifacts.js";

const GOVERNANCE = ["registerVoter", "revokeVoter", "createProposal", "castBallot", "finalizeProposal"] as const;
const PROCUREMENT = ["registerBidder", "revokeBidder", "createProcurement", "submitBid", "awardProcurement"] as const;

describe("Wave 2 Preview companions", () => {
  it("exposes governance circuits when artifacts exist", async () => {
    if (!compiledGovernancePreviewArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:governance-preview`. Skipping.");
      return;
    }
    const loaded = await loadCompiledGovernancePreview();
    expect(loaded).not.toBeNull();
    const dummy = Object.fromEntries(
      ["ownerSecret", "holderSecret", "revocationSecret", "ballotChoice", "ballotSalt", "tallyYes", "tallyNo"].map(
        (name) => [name, () => undefined],
      ),
    );
    const instance = new (loaded!.Contract as new (w: unknown) => { impureCircuits: Record<string, unknown> })(dummy);
    for (const circuitId of GOVERNANCE) {
      expect(typeof instance.impureCircuits[circuitId], circuitId).toBe("function");
    }
  });

  it("exposes procurement circuits when artifacts exist", async () => {
    if (!compiledProcurementPreviewArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:procurement-preview`. Skipping.");
      return;
    }
    const loaded = await loadCompiledProcurementPreview();
    expect(loaded).not.toBeNull();
    const dummy = Object.fromEntries(
      ["ownerSecret", "holderSecret", "revocationSecret", "bidSalt", "bidAmount", "awardSalt"].map((name) => [
        name,
        () => undefined,
      ]),
    );
    const instance = new (loaded!.Contract as new (w: unknown) => { impureCircuits: Record<string, unknown> })(dummy);
    for (const circuitId of PROCUREMENT) {
      expect(typeof instance.impureCircuits[circuitId], circuitId).toBe("function");
    }
  });

  it("exposes recordDisclosure when artifacts exist", async () => {
    if (!compiledAuditorPreviewArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:auditor-preview`. Skipping.");
      return;
    }
    const loaded = await loadCompiledAuditorPreview();
    expect(loaded).not.toBeNull();
    const instance = new (loaded!.Contract as new (w: unknown) => { impureCircuits: Record<string, unknown> })({
      ownerSecret: () => undefined,
    });
    expect(typeof instance.impureCircuits.recordDisclosure).toBe("function");
  });
});
