import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { projectEconomyLedger, type CompactEconomyLedger } from "./economy-ledger.js";

function bytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

describe("economy ledger projection", () => {
  it("projects public credential and settlement rows without witness fields", () => {
    const actionId = bytes("11".repeat(32));
    const ledger: CompactEconomyLedger = {
      organizationId: bytes("22".repeat(32)),
      organizationStatus: 1,
      adminCommitment: bytes("33".repeat(32)),
      credentials: [[bytes("44".repeat(32)), true]],
      revokedNullifiers: [],
      credentialCount: 1n,
      usedActionIds: [actionId],
      authorizations: [
        [
          actionId,
          {
            agentId: bytes("55".repeat(32)),
            result: 0,
            intentCommitment: bytes("66".repeat(32)),
            periodStart: 1n,
            periodEnd: 2n,
          },
        ],
      ],
      actionCount: 1n,
      settlementNullifiers: [],
      settlements: [
        [
          actionId,
          {
            actionId,
            amount: 100n,
            recipient: bytes("77".repeat(32)),
            periodStart: 1n,
          },
        ],
      ],
      settlementCount: 1n,
    };
    const view = projectEconomyLedger(ledger, "aa".repeat(32));
    expect(view.credentialCount).toBe(1n);
    expect(view.authorizations[0]?.actionId).toBe(asHex32("11".repeat(32)));
    expect(view.settlements[0]?.amount).toBe(100n);
    expect(JSON.stringify(view, (_k, v) => (typeof v === "bigint" ? v.toString() : v))).not.toMatch(
      /ownerSecret|holderSecret|ballotChoice|bidAmount/,
    );
  });
});
