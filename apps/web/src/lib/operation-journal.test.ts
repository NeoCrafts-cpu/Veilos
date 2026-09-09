import { asHex32 } from "@velios/shared-types";
import { describe, expect, it } from "vitest";
import { emptyJournal, journalToOperations, upsertJournalEntry } from "./operation-journal.js";
import { reconcileJournal } from "./reconcile-journal.js";
import { randomBytes32 } from "@velios/policy-engine";
import { bytesToHex32 } from "@velios/shared-types";
import { roleLabelToBytes, vendorIdFromRecipient } from "@velios/midnight/ids";

const actionId = asHex32("11".repeat(32));

describe("operation journal", () => {
  it("does not store amount or recipient", () => {
    const journal = upsertJournalEntry(emptyJournal(), {
      actionId,
      kind: "authorization",
      status: "pending",
      phase: "proving",
      circuitSubmitted: true,
      contractAddress: "aa".repeat(32),
      intentCommitment: asHex32("22".repeat(32)),
      expectedPeriodStart: "1",
      expectedDailySpend: "4800",
      expectedSpendSalt: asHex32("33".repeat(32)),
      expectedNextSpendSalt: asHex32("44".repeat(32)),
      submittedAt: "2026-09-16T00:00:00.000Z",
    });
    expect(JSON.stringify(journal)).not.toMatch(/recipient|reason|ownerSecret/);
    expect(journalToOperations(journal)[actionId]?.status).toBe("pending");
  });

  it("applies expected spend when the indexer has the action", () => {
    const spendSalt = randomBytes32();
    const next = randomBytes32();
    const state = {
      ownerSecret: randomBytes32(),
      memberSecret: randomBytes32(),
      agentSecret: randomBytes32(),
      agentRole: roleLabelToBytes("Treasury Operator"),
      roleSalt: randomBytes32(),
      perActionLimit: 10n,
      dailyLimit: 20n,
      vendorId: vendorIdFromRecipient("supplier"),
      credentialOk: true,
      credentialExpiry: 2_000_000_000n,
      selfModifyAllowed: false,
      policySalt: randomBytes32(),
      spendPeriodStart: 0n,
      dailySpend: 0n,
      spendSalt,
      nextSpendSalt: next,
    };
    const reconciled = reconcileJournal({
      privateState: state,
      journal: upsertJournalEntry(emptyJournal(), {
        actionId,
        kind: "authorization",
        status: "pending",
        circuitSubmitted: true,
        contractAddress: "aa".repeat(32),
        intentCommitment: asHex32("22".repeat(32)),
        expectedPeriodStart: "99",
        expectedDailySpend: "7",
        expectedSpendSalt: bytesToHex32(spendSalt),
        expectedNextSpendSalt: bytesToHex32(next),
        submittedAt: "2026-09-16T00:00:00.000Z",
      }),
      actions: [
        {
          actionId,
          agentId: asHex32("55".repeat(32)),
          actionType: "payment",
          result: "authorized",
          resultCommitment: asHex32("66".repeat(32)),
          periodStart: 99n,
          periodEnd: 100n,
        },
      ],
    });
    expect(reconciled.privateState.dailySpend).toBe(7n);
    expect(reconciled.authorizedIds).toEqual([actionId]);
    expect(reconciled.journal.entries).toHaveLength(0);
  });

  it("discards failed pre-submit entries without applying spend", () => {
    const spendSalt = randomBytes32();
    const next = randomBytes32();
    const state = {
      ownerSecret: randomBytes32(),
      memberSecret: randomBytes32(),
      agentSecret: randomBytes32(),
      agentRole: roleLabelToBytes("Treasury Operator"),
      roleSalt: randomBytes32(),
      perActionLimit: 10n,
      dailyLimit: 20n,
      vendorId: vendorIdFromRecipient("supplier"),
      credentialOk: true,
      credentialExpiry: 2_000_000_000n,
      selfModifyAllowed: false,
      policySalt: randomBytes32(),
      spendPeriodStart: 0n,
      dailySpend: 0n,
      spendSalt,
      nextSpendSalt: next,
    };
    const reconciled = reconcileJournal({
      privateState: state,
      journal: upsertJournalEntry(emptyJournal(), {
        actionId,
        kind: "authorization",
        status: "failed",
        circuitSubmitted: false,
        contractAddress: "aa".repeat(32),
        intentCommitment: asHex32("22".repeat(32)),
        expectedPeriodStart: "99",
        expectedDailySpend: "7",
        expectedSpendSalt: bytesToHex32(spendSalt),
        expectedNextSpendSalt: bytesToHex32(next),
        submittedAt: "2026-09-16T00:00:00.000Z",
      }),
      actions: [],
    });
    expect(reconciled.privateState.dailySpend).toBe(0n);
    expect(reconciled.authorizedIds).toEqual([]);
    expect(reconciled.journal.entries).toHaveLength(0);
  });
});
