/**
 * Local, non-authoritative predicate preview.
 * The Compact circuit is the only authorization authority.
 */

import type { VeliosPrivateState } from "@velios/shared-types";
import { assertUint64 } from "./encoding.js";
import { currentAuthorizationWindow, type AuthorizationWindow } from "./period.js";

export type PreviewDecision = {
  allowed: boolean;
  code:
    | "preview_allow"
    | "preview_deny_amount"
    | "preview_deny_daily"
    | "preview_deny_vendor"
    | "preview_deny_credential"
    | "preview_deny_expired"
    | "preview_deny_overflow"
    | "preview_deny_inactive"
    | "preview_deny_stale_period";
};

/**
 * Mirrors the `authorizeAction` predicate order so the UI can warn before
 * proving. Not authoritative: the compiled circuit is the only authority.
 */
export function previewAuthorize(input: {
  amount: bigint;
  vendorId: Uint8Array;
  privateState: VeliosPrivateState;
  agentActive?: boolean;
  organizationActive?: boolean;
  memberActive?: boolean;
  window?: AuthorizationWindow;
}): PreviewDecision {
  const amount = assertUint64(input.amount);
  const { privateState } = input;
  const window = input.window ?? currentAuthorizationWindow();

  if (
    input.organizationActive === false ||
    input.agentActive === false ||
    input.memberActive === false
  ) {
    return { allowed: false, code: "preview_deny_inactive" };
  }
  if (!privateState.credentialOk) {
    return { allowed: false, code: "preview_deny_credential" };
  }
  // Must stay valid through the end of the window the circuit will prove.
  if (privateState.credentialExpiry < window.periodEnd) {
    return { allowed: false, code: "preview_deny_expired" };
  }
  if (!bytesEqual(input.vendorId, privateState.vendorId)) {
    return { allowed: false, code: "preview_deny_vendor" };
  }
  if (amount > privateState.perActionLimit) {
    return { allowed: false, code: "preview_deny_amount" };
  }
  if (privateState.spendPeriodStart > window.periodStart) {
    return { allowed: false, code: "preview_deny_stale_period" };
  }

  const carried =
    privateState.spendPeriodStart === window.periodStart ? privateState.dailySpend : 0n;
  const nextSpend = carried + amount;
  if (nextSpend < carried) {
    return { allowed: false, code: "preview_deny_overflow" };
  }
  if (nextSpend > privateState.dailyLimit) {
    return { allowed: false, code: "preview_deny_daily" };
  }

  return { allowed: true, code: "preview_allow" };
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export function validateAgentIdLabel(label: string): void {
  if (!label.trim()) {
    throw new Error("agent id required");
  }
}
