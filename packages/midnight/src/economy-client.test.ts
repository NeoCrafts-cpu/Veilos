import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { confirmEconomyField, confirmEconomySettlement, ECONOMY_PRIVATE_STATE_ID } from "./economy-client.js";
import type { EconomyLedgerView } from "./economy-ledger.js";
import { GOVERNANCE_PRIVATE_STATE_ID, PROCUREMENT_PRIVATE_STATE_ID, AUDITOR_PRIVATE_STATE_ID } from "./companion-client.js";

function emptyEconomy(contractAddress: string): EconomyLedgerView {
  return {
    kind: "economy-preview",
    contractAddress,
    organizationId: asHex32("33".repeat(32)),
    organizationStatus: "active",
    adminCommitment: asHex32("44".repeat(32)),
    credentialCommitments: [],
    revokedNullifiers: [],
    credentialCount: 0n,
    usedActionIds: [],
    authorizations: [],
    actionCount: 0n,
    settlementNullifiers: [],
    settlements: [],
    settlementCount: 0n,
  };
}

describe("economy client", () => {
  it("uses a distinct private-state id from Wave 1", () => {
    expect(ECONOMY_PRIVATE_STATE_ID).toBe("VeliosEconomyPrivateState");
    expect(GOVERNANCE_PRIVATE_STATE_ID).toBe("VeliosGovernancePrivateState");
    expect(PROCUREMENT_PRIVATE_STATE_ID).toBe("VeliosProcurementPrivateState");
    expect(AUDITOR_PRIVATE_STATE_ID).toBe("VeliosAuditorPrivateState");
  });

  it("does not settle from SucceedEntirely without an indexed settlement row", async () => {
    const empty = emptyEconomy("aa".repeat(32));
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

  it("confirms a credential only after the commitment is on the ledger", async () => {
    const commitment = asHex32("99".repeat(32));
    const missing = await confirmEconomyField({
      status: "SucceedEntirely",
      txId: "tx-issue",
      contractAddress: "aa".repeat(32),
      timeoutMs: 10,
      pollMs: 5,
      readLedger: async () => emptyEconomy("aa".repeat(32)),
      present: (view) => view.credentialCommitments.includes(commitment),
    });
    expect(missing.kind).toBe("stale");
    const confirmed = await confirmEconomyField({
      status: "SucceedEntirely",
      txId: "tx-issue",
      contractAddress: "aa".repeat(32),
      readLedger: async () => ({
        ...emptyEconomy("aa".repeat(32)),
        credentialCommitments: [commitment],
        credentialCount: 1n,
      }),
      present: (view) => view.credentialCommitments.includes(commitment),
    });
    expect(confirmed.kind).toBe("confirmed");
  });
});
