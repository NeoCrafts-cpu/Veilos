import type { AuthorizationOutcome } from "@velios/shared-types";

export function resultHeadline(outcome: AuthorizationOutcome, circuitSubmitted: boolean): string {
  if (outcome.kind === "authorized") return "AUTHORIZATION RECORDED";
  if (outcome.kind === "rejected" && !circuitSubmitted) return "NOT AUTHORIZED";
  if (outcome.kind === "rejected") return "AUTHORIZATION REFUSED";
  if (outcome.kind === "failed" && outcome.code === "wallet_rejected") return "WALLET APPROVAL WAS DECLINED";
  if (outcome.kind === "failed" && outcome.code === "environment_missing") return "NOT READY TO AUTHORIZE";
  if (outcome.kind === "timeout") return "TRY AGAIN";
  if (outcome.kind === "interrupted") return "PROOF INTERRUPTED";
  if (outcome.kind === "pending") return "AUTHORIZING";
  if (outcome.kind === "stale") return "SUBMITTED, AWAITING INDEXER";
  if (outcome.kind === "failed") return "TRANSACTION SUBMISSION FAILED";
  return "WAITING FOR A VERIFIED RESULT";
}

export function resultExplanation(input: {
  outcome: AuthorizationOutcome;
  previewCode?: string | undefined;
  circuitSubmitted: boolean;
}): string {
  const { outcome, previewCode, circuitSubmitted } = input;
  if (outcome.kind === "authorized") {
    return "Midnight returned SucceedEntirely and the indexer has the public action. Authorization was recorded. No funds were transferred.";
  }
  if (outcome.kind === "rejected" && !circuitSubmitted) {
    return "A local policy check refused this request. No Compact proof was generated and Midnight was not called. The private limit is not disclosed.";
  }
  if (outcome.kind === "rejected" && previewCode === "preview_allow") {
    return "Midnight rejected the proof. Local preview expected allow, so the operator vault likely does not open this agent’s commitments. Import the correct backup, then retry.";
  }
  if (outcome.kind === "rejected") {
    return "Midnight rejected the proof. The circuit refused the witnesses. The private constraint is not disclosed.";
  }
  if (outcome.kind === "failed" && outcome.code === "wallet_rejected") {
    return "The wallet declined the transaction. Review the request and approve the popup to try again.";
  }
  if (outcome.kind === "failed" && outcome.code === "environment_missing") {
    return "Wallet, proof server, indexer, or operator access is not ready. This screen does not invent an authorized result.";
  }
  if (outcome.kind === "timeout") {
    return "The authorization window is too close to the ledger clock boundary. Retry the request.";
  }
  if (outcome.kind === "interrupted") {
    return "The proof was interrupted before a confirmed authorization. No public action was written. You can review the request and submit again.";
  }
  if (outcome.kind === "stale") {
    return "Midnight returned SucceedEntirely, but the indexer has not published this action id yet. The result is not AUTHORIZED until the exact public row appears.";
  }
  if (outcome.kind === "failed") {
    return "The transaction was submitted but did not return SucceedEntirely. No authorized public action was written.";
  }
  return "Waiting for a verified Midnight transaction status.";
}

export function recoveryLabel(outcome: AuthorizationOutcome, circuitSubmitted: boolean): string {
  if (outcome.kind === "rejected" && !circuitSubmitted) return "Edit request";
  if (outcome.kind === "rejected") return "Restore operator access";
  if (outcome.kind === "failed" && outcome.code === "wallet_rejected") return "Review authorization";
  if (outcome.kind === "timeout" || outcome.kind === "interrupted") return "Review authorization";
  if (outcome.kind === "stale") return "Refresh public data";
  if (outcome.kind === "failed") return "Check readiness";
  return "Authorize another action";
}

export function localRefuseCopy(code?: string): string {
  if (code === "preview_deny_vendor") return "This recipient is not approved for this agent.";
  if (code === "preview_deny_credential" || code === "preview_deny_expired") {
    return "The operator credential is not valid for this authorization window.";
  }
  if (code === "preview_deny_inactive") return "The organization or agent is not active.";
  return "This request is not authorized against the committed private policy. The private limit is not disclosed.";
}
