import { describe, expect, it } from "vitest";
import { PREVIEW_CONFIG, publishedDeploymentFor, readPublicLedger, publicIndexerProvider } from "@velios/midnight";

/**
 * Live Preview vertical slice. Never mocks indexer or wallet results.
 * CI must not set VELIOS_LIVE_PREVIEW unless a funded seed is injected as a secret.
 */
describe("preview live vertical slice", () => {
  it("reads the published Preview contract from the official indexer", async () => {
    if (!process.env["VELIOS_LIVE_PREVIEW"]) {
      return;
    }
    const published = publishedDeploymentFor("preview");
    expect(published).not.toBeNull();
    const view = await readPublicLedger(
      { publicDataProvider: publicIndexerProvider(PREVIEW_CONFIG) },
      published!.contractAddress,
    );
    expect(view.organization.organizationId).toBe(published!.organizationId);
    expect(view.organization.status).toBe("active");
  });

  it("authorizes on Preview only when a seed is present", async () => {
    if (!process.env["VELIOS_LIVE_PREVIEW"]) {
      return;
    }
    if (!process.env["VELIOS_WALLET_SEED"] && !process.env["VELIOS_WALLET_MNEMONIC"]) {
      throw new Error("VELIOS_LIVE_PREVIEW=1 requires VELIOS_WALLET_SEED or VELIOS_WALLET_MNEMONIC");
    }
    const { runPreviewDeploy } = await import("./preview-deploy.js");
    const result = await runPreviewDeploy(["--dust-only"]);
    expect(result).toBeTruthy();
  });

  it("reads retained authorizeAction evidence from the official indexer", async () => {
    if (!process.env["VELIOS_LIVE_PREVIEW"]) {
      return;
    }
    const { existsSync, readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const evidencePath = resolve(process.cwd(), "../../deployment.authorize.json");
    if (!existsSync(evidencePath)) {
      return;
    }
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as {
      contractAddress: string;
      actionId: string;
    };
    const view = await readPublicLedger(
      { publicDataProvider: publicIndexerProvider(PREVIEW_CONFIG) },
      evidence.contractAddress,
    );
    expect(view.actions.some((row) => row.actionId === evidence.actionId && row.result === "authorized")).toBe(true);
  });
});
