import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  auditorPreviewSourcePath,
  compactSourcePath,
  compiledAuditorPreviewArtifactsPresent,
  compiledEconomyPreviewArtifactsPresent,
  compiledGovernancePreviewArtifactsPresent,
  compiledProcurementPreviewArtifactsPresent,
  economyPreviewSourcePath,
  governancePreviewSourcePath,
  procurementPreviewSourcePath,
} from "./node-artifacts.js";

describe("Wave 2 Preview compact sources", () => {
  it("ships economy, governance, procurement, and auditor Preview contracts", () => {
    expect(existsSync(compactSourcePath)).toBe(true);
    expect(existsSync(economyPreviewSourcePath)).toBe(true);
    expect(existsSync(governancePreviewSourcePath)).toBe(true);
    expect(existsSync(procurementPreviewSourcePath)).toBe(true);
    expect(existsSync(auditorPreviewSourcePath)).toBe(true);
  });

  it("does not claim companion artifacts until they are compiled", () => {
    if (!compiledEconomyPreviewArtifactsPresent()) {
      expect(compiledEconomyPreviewArtifactsPresent()).toBe(false);
    }
    expect(typeof compiledGovernancePreviewArtifactsPresent()).toBe("boolean");
    expect(typeof compiledProcurementPreviewArtifactsPresent()).toBe("boolean");
    expect(typeof compiledAuditorPreviewArtifactsPresent()).toBe("boolean");
  });
});
