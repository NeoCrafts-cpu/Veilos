import { describe, expect, it } from "vitest";
import { PREVIEW_CONFIG } from "./network.js";
import { browserProvingReady, LOCAL_PROOF_MISSING } from "./browser-proving.js";

describe("browser proving gates", () => {
  it("treats an attached wallet prover as ready", async () => {
    await expect(browserProvingReady("wallet", undefined, PREVIEW_CONFIG)).resolves.toBe(true);
  });

  it("fails closed when only an unreachable local proof-server is available", async () => {
    await expect(
      browserProvingReady("local-http", "http://127.0.0.1:9/health", PREVIEW_CONFIG),
    ).resolves.toBe(false);
  });

  it("keeps the fail-closed copy when hosted proving is missing", () => {
    expect(LOCAL_PROOF_MISSING).toMatch(/proof-server:8\.1\.0/);
    expect(LOCAL_PROOF_MISSING).not.toMatch(/api-preview\.1am\.xyz/);
  });
});
