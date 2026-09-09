/**
 * Encrypted write-ahead journal for authorization recovery.
 * Never store amount, recipient, reason, or secrets in plaintext.
 */

import { asHex32, type ActionOperation, type Hex32 } from "@velios/shared-types";

export const JOURNAL_KIND = "velios-operation-journal";
export const JOURNAL_VERSION = 1;

export type JournalEntry = {
  actionId: Hex32;
  kind: ActionOperation["kind"];
  status: ActionOperation["status"];
  phase?: ActionOperation["phase"];
  circuitSubmitted: boolean;
  txId?: string;
  contractAddress: string;
  intentCommitment: Hex32;
  expectedPeriodStart: string;
  expectedDailySpend: string;
  expectedSpendSalt: Hex32;
  expectedNextSpendSalt: Hex32;
  submittedAt: string;
};

export type OperationJournal = {
  version: number;
  kind: typeof JOURNAL_KIND;
  entries: JournalEntry[];
};

export function emptyJournal(): OperationJournal {
  return { version: JOURNAL_VERSION, kind: JOURNAL_KIND, entries: [] };
}

export function isOperationJournal(value: unknown): value is OperationJournal {
  if (!value || typeof value !== "object") return false;
  const record = value as OperationJournal;
  return record.kind === JOURNAL_KIND && Array.isArray(record.entries);
}

export function upsertJournalEntry(journal: OperationJournal, entry: JournalEntry): OperationJournal {
  return {
    ...journal,
    entries: [...journal.entries.filter((item) => item.actionId !== entry.actionId), entry],
  };
}

export function removeJournalEntry(journal: OperationJournal, actionId: Hex32): OperationJournal {
  return { ...journal, entries: journal.entries.filter((item) => item.actionId !== actionId) };
}

export function journalToOperations(journal: OperationJournal): Record<string, ActionOperation> {
  return Object.fromEntries(
    journal.entries.map((entry) => [
      entry.actionId,
      {
        actionId: entry.actionId,
        kind: entry.kind,
        status: entry.status,
        circuitSubmitted: entry.circuitSubmitted,
        ...(entry.phase ? { phase: entry.phase } : {}),
        ...(entry.txId ? { txId: entry.txId } : {}),
        contractAddress: entry.contractAddress,
      } satisfies ActionOperation,
    ]),
  );
}

export function asJournalActionId(value: string): Hex32 {
  return asHex32(value);
}
