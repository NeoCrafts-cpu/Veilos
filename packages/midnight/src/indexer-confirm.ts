/**
 * Exact public-action confirmation. SucceedEntirely is not enough.
 */

import type { Hex32, PublicAction } from "@velios/shared-types";
import type { PublicLedgerView } from "./ledger-view.js";

export type IndexerConfirmStatus = "confirmed" | "stale" | "missing";

export type IndexerConfirmResult = {
  status: IndexerConfirmStatus;
  action?: PublicAction;
  view?: PublicLedgerView;
};

export type LedgerReader = () => Promise<PublicLedgerView>;

export function findPublicAction(view: PublicLedgerView, actionId: Hex32): PublicAction | undefined {
  return view.actions.find((action) => action.actionId === actionId);
}

export async function confirmPublicAction(input: {
  readLedger: LedgerReader;
  actionId: Hex32;
  contractAddress?: string;
  expectedResult?: PublicAction["result"];
}): Promise<IndexerConfirmResult> {
  const view = await input.readLedger();
  if (input.contractAddress && view.organization.contractAddress !== input.contractAddress) {
    return { status: "missing", view };
  }
  const action = findPublicAction(view, input.actionId);
  if (!action) return { status: "missing", view };
  if (action.actionId !== input.actionId) return { status: "missing", view };
  if (input.expectedResult && action.result !== input.expectedResult) {
    return { status: "missing", view };
  }
  return { status: "confirmed", action, view };
}

export async function waitForPublicAction(input: {
  readLedger: LedgerReader;
  actionId: Hex32;
  contractAddress?: string;
  expectedResult?: PublicAction["result"];
  timeoutMs?: number;
  pollMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<IndexerConfirmResult> {
  const timeoutMs = input.timeoutMs ?? 30_000;
  const pollMs = input.pollMs ?? 1_000;
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const deadline = now() + timeoutMs;
  let last: IndexerConfirmResult = { status: "missing" };
  while (now() <= deadline) {
    last = await confirmPublicAction({
      readLedger: input.readLedger,
      actionId: input.actionId,
      ...(input.contractAddress ? { contractAddress: input.contractAddress } : {}),
      ...(input.expectedResult ? { expectedResult: input.expectedResult } : {}),
    });
    if (last.status === "confirmed") return last;
    if (now() + pollMs > deadline) break;
    await sleep(pollMs);
  }
  return last.view ? { status: "stale", view: last.view } : { status: "stale" };
}
