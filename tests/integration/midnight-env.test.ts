/**
 * I1–I7: real Midnight stack.
 * Environment absence skips the optional developer suite.
 * `VELIOS_REQUIRE_MIDNIGHT=1` fails immediately instead of passing.
 */

import { describe, expect, it } from "vitest";
import { LOCAL_CONFIG, proofServerReachable } from "@velios/midnight";
import { compiledArtifactsPresent } from "@velios/contracts/node";

const required = process.env["VELIOS_REQUIRE_MIDNIGHT"] === "1";

async function environmentReady(): Promise<boolean> {
  const proof = await proofServerReachable(LOCAL_CONFIG.proofServer);
  const indexer = await proofServerReachable(LOCAL_CONFIG.indexer);
  return proof && indexer && compiledArtifactsPresent();
}

describe("I1–I7 Midnight integration", () => {
  it("fails closed when Midnight is required and missing", async () => {
    const ready = await environmentReady();
    if (!ready && required) {
      throw new Error("VELIOS_REQUIRE_MIDNIGHT=1 but proof server/indexer/artifacts are missing");
    }
    if (!ready) {
      console.warn(
        "ENVIRONMENT MISSING: start scripts/local-dev/compose.yml, compile contracts, then rerun.",
      );
    }
    expect(ready || !required).toBe(true);
  });

  it("I1 deploys an organization on the local stack", async () => {
    const ready = await environmentReady();
    if (!ready) {
      if (required) throw new Error("local Midnight missing");
      return;
    }
    const { runLocalVerticalSlice } = await import("./local-vertical-slice.js");
    const slice = await runLocalVerticalSlice();
    expect(slice.deployStatus).toBe("SucceedEntirely");
    expect(slice.contractAddress).toMatch(/^[0-9a-f]{64}$/i);
  });

  it("I2–I4 register a member, create an agent, and set policy", async () => {
    const ready = await environmentReady();
    if (!ready) {
      if (required) throw new Error("local Midnight missing");
      return;
    }
    const { runLocalVerticalSlice } = await import("./local-vertical-slice.js");
    const slice = await runLocalVerticalSlice();
    expect(slice.registerMemberStatus).toBe("SucceedEntirely");
    expect(slice.createAgentStatus).toBe("SucceedEntirely");
    expect(slice.setAgentPolicyStatus).toBe("SucceedEntirely");
  });

  it("I5 authorizes a valid action and reads the exact indexer row", async () => {
    const ready = await environmentReady();
    if (!ready) {
      if (required) throw new Error("local Midnight missing");
      return;
    }
    const { runLocalVerticalSlice } = await import("./local-vertical-slice.js");
    const slice = await runLocalVerticalSlice();
    expect(slice.authorizeStatus).toBe("authorized");
    expect(slice.indexedActionId).toBe(slice.actionId);
  });

  it("I6 rejects an over-limit action without writing a public row", async () => {
    const ready = await environmentReady();
    if (!ready) {
      if (required) throw new Error("local Midnight missing");
      return;
    }
    const { runLocalVerticalSlice } = await import("./local-vertical-slice.js");
    const slice = await runLocalVerticalSlice();
    expect(slice.invalidOutcome).toMatch(/rejected|failed/);
    expect(slice.invalidIndexed).toBe(false);
  });

  it("I7 treats a proof-server outage as environment missing, not authorized", async () => {
    const ready = await environmentReady();
    if (!ready) {
      if (required) throw new Error("local Midnight missing");
      return;
    }
    const { proofServerReachable: reachable } = await import("@velios/midnight");
    expect(await reachable("http://127.0.0.1:1", 250)).toBe(false);
  });
});
