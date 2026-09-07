import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { confirmEconomySettlement, ECONOMY_PRIVATE_STATE_ID } from "./economy-client.js";
import type { PublicLedgerView } from "./ledger-view.js";

describe("economy client", () => {
  it("uses a distinct private-state id from Wave 1", () => {
    expect(ECONOMY_PRIVATE_STATE_ID).toBe("VeliosEconomyPrivateState");
  });

  it("does not settle from SucceedEntirely without an indexed row", async () => {
    const empty: PublicLedgerView = {
      organization: {
        organizationId: asHex32("33".repeat(32)),
        status: "active",
        adminCommitment: asHex32("44".repeat(32)),
        contractAddress: "aa".repeat(32),
        actionCount: 0n,
      },
      members: [],
      agents: [],
      actions: [],
    };
    const stale = await confirmEconomySettlement({
      status: "SucceedEntirely",
      txId: "tx-settle",
      actionId: "11".repeat(32),
      contractAddress: "aa".repeat(32),
      timeoutMs: 10,
      pollMs: 5,
      readLedger: async () => empty,
    });
    expect(stale.kind).toBe("stale");
    const failed = await confirmEconomySettlement({
      status: "FailEntirely",
      txId: "tx-fail",
      actionId: "11".repeat(32),
      contractAddress: "aa".repeat(32),
      readLedger: async () => empty,
    });
    expect(failed.kind).toBe("failed");
  });
});
