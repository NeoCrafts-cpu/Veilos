import { MIDNIGHT_SUCCESS_STATUS, type AuthorizationOutcome, type Hex32 } from "@velios/shared-types";

/** Official MidnightJS documented statuses. */
export type MidnightTxStatus = "SucceedEntirely" | "FailFallible" | "FailEntirely" | string;

export const PUBLIC_ERROR_MESSAGES = {
  environment_missing: "Wallet, proof server, indexer, or operator access is not ready.",
  wallet_rejected: "The wallet declined the transaction. Approve the popup to retry.",
  submit_failed: "Midnight could not finish the proof or submit the transaction.",
  policy_violation: "Midnight rejected the proof. The private constraint is not disclosed.",
  proof_rejected: "Midnight rejected the proof. The private constraint is not disclosed.",
  indexer_stale: "The transaction was submitted. The indexer has not confirmed the public action yet.",
  hosted_prover: "This app proves through the local proof server, not a hosted prover.",
} as const;

export function outcomeFromTxStatus(input: {
  status: MidnightTxStatus;
  actionId: Hex32;
  contractAddress: string;
  txId: string;
}): AuthorizationOutcome {
  if (input.status === MIDNIGHT_SUCCESS_STATUS) {
    return { kind: "pending", phase: "indexing" };
  }
  if (input.status === "FailFallible" || input.status === "FailEntirely") {
    return { kind: "failed", code: "submit_failed" };
  }
  return { kind: "failed", code: "submit_failed" };
}

export function outcomeFromIndexerConfirm(input: {
  confirmed: boolean;
  actionId: Hex32;
  contractAddress: string;
  txId: string;
}): AuthorizationOutcome {
  if (input.confirmed) {
    return {
      kind: "authorized",
      actionId: input.actionId,
      contractAddress: input.contractAddress,
      txId: input.txId,
    };
  }
  return { kind: "stale" };
}

/**
 * Every `assert` message in `compact/authorization.compact`. These are the
 * generic, secret-free strings the circuit emits; a match means the circuit
 * refused the action, which is a rejection rather than an infrastructure fault.
 */
const CIRCUIT_ASSERT_MESSAGES = [
  "organization inactive",
  "wrong organization",
  "unauthorized",
  "member exists",
  "member missing",
  "member inactive",
  "agent exists",
  "agent missing",
  "agent inactive",
  "self modify denied",
  "policy predicate failed",
  "credential predicate failed",
  "credential expired",
  "invalid period",
  "period too long",
  "period not started",
  "period elapsed",
  "stale period",
  "replay",
  "credential path",
  "credential class",
  "credential revoked",
  "already revoked",
  "credential exists",
  "authorization missing",
  "not authorized",
  "recipient mismatch",
  "intent mismatch",
  "already settled",
  "proposal exists",
  "proposal missing",
  "proposal closed",
  "vote not started",
  "vote elapsed",
  "already voted",
  "not a voter",
  "voter revoked",
  "voter exists",
  "invalid ballot",
  "vote still open",
  "procurement exists",
  "procurement missing",
  "procurement closed",
  "bidding not started",
  "bidding elapsed",
  "not a bidder",
  "bidder revoked",
  "bidder exists",
  "duplicate bid",
  "disclosure exists",
] as const;

export function explainCaughtError(error: unknown, fallback: string): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let i = 0; i < 4 && current; i += 1) {
    if (current instanceof Error) {
      parts.push(current.message);
      current = current.cause;
    } else {
      break;
    }
  }
  const message = parts.join(" — ") || fallback;
  if (/1am\.xyz/i.test(message)) return PUBLIC_ERROR_MESSAGES.hosted_prover;
  if (/request failed/i.test(message) && !/DUST/i.test(message)) return PUBLIC_ERROR_MESSAGES.submit_failed;
  if (/econnrefused|environment missing|fetch/i.test(message)) return PUBLIC_ERROR_MESSAGES.environment_missing;
  if (/wallet|permission|disconnect|dust/i.test(message)) return PUBLIC_ERROR_MESSAGES.wallet_rejected;
  if (CIRCUIT_ASSERT_MESSAGES.some((needle) => message.toLowerCase().includes(needle))) {
    return PUBLIC_ERROR_MESSAGES.policy_violation;
  }
  return PUBLIC_ERROR_MESSAGES.submit_failed;
}

export function outcomeFromCaughtError(error: unknown): AuthorizationOutcome {
  const raw = error instanceof Error ? error.message : "";
  const message = explainCaughtError(error, "failed");
  const lower = `${raw} ${message}`.toLowerCase();
  if (lower.includes("environment") || lower.includes("econnrefused") || lower.includes("fetch")) {
    return { kind: "failed", code: "environment_missing" };
  }
  if (
    lower.includes("permission") ||
    lower.includes("wallet") ||
    lower.includes("disconnect") ||
    lower.includes("request failed") ||
    lower.includes("dust")
  ) {
    return { kind: "failed", code: "wallet_rejected" };
  }
  if (CIRCUIT_ASSERT_MESSAGES.some((needle) => lower.includes(needle)) || lower.includes("assert")) {
    return { kind: "rejected", code: "policy_violation" };
  }
  if (lower.includes("proof") || lower.includes("zk")) {
    return { kind: "rejected", code: "proof_rejected" };
  }
  return { kind: "failed", code: "submit_failed" };
}

export function publicErrorLabel(outcome: AuthorizationOutcome): string {
  switch (outcome.kind) {
    case "authorized":
      return "AUTHORIZED";
    case "rejected":
      return "PROOF REJECTED";
    case "failed":
      return outcome.code === "environment_missing"
        ? "MIDNIGHT ENVIRONMENT MISSING"
        : "ACTION FAILED";
    case "timeout":
      return "TIMED OUT";
    case "stale":
      return "INDEXER STALE";
    case "pending":
      return "PENDING";
    case "interrupted":
      return "PROOF INTERRUPTED";
    default:
      return "IDLE";
  }
}
