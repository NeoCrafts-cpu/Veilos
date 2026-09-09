import { asHex32, hex32ToBytes, type Hex32, type PublicAction, type VeliosPrivateState } from "@velios/shared-types";
import { removeJournalEntry, type JournalEntry, type OperationJournal } from "./operation-journal.js";

export function applyJournalSpend(state: VeliosPrivateState, entry: JournalEntry): VeliosPrivateState {
  return {
    ...state,
    spendPeriodStart: BigInt(entry.expectedPeriodStart),
    dailySpend: BigInt(entry.expectedDailySpend),
    spendSalt: hex32ToBytes(entry.expectedSpendSalt),
    nextSpendSalt: hex32ToBytes(entry.expectedNextSpendSalt),
  };
}

export function reconcileJournal(input: {
  journal: OperationJournal;
  privateState: VeliosPrivateState;
  actions: PublicAction[];
}): { journal: OperationJournal; privateState: VeliosPrivateState; authorizedIds: Hex32[] } {
  let journal = input.journal;
  let privateState = input.privateState;
  const authorizedIds: Hex32[] = [];
  for (const entry of input.journal.entries) {
    if (!entry.circuitSubmitted && (entry.status === "failed" || entry.status === "rejected")) {
      journal = removeJournalEntry(journal, asHex32(entry.actionId));
      continue;
    }
    const indexed = input.actions.some((action) => action.actionId === entry.actionId);
    if (indexed) {
      privateState = applyJournalSpend(privateState, entry);
      journal = removeJournalEntry(journal, asHex32(entry.actionId));
      authorizedIds.push(asHex32(entry.actionId));
    }
  }
  return { journal, privateState, authorizedIds };
}
