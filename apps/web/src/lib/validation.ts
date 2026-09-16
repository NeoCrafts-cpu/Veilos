import { UINT64_MAX } from "@velios/policy-engine";

export const LABEL_MAX_BYTES = 32;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function validateLabel(value: string, label = "Name"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (utf8ByteLength(trimmed) > LABEL_MAX_BYTES) {
    return `${label} must be ${LABEL_MAX_BYTES} bytes or fewer.`;
  }
  return undefined;
}

export function validatePolicyAmount(value: string, label: string): { error?: string; amount?: bigint } {
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  if (!/^\d+$/.test(trimmed)) return { error: `${label} must be a whole number.` };
  const amount = BigInt(trimmed);
  if (amount <= 0n) return { error: `${label} must be greater than zero.` };
  if (amount > UINT64_MAX) return { error: `${label} is too large.` };
  return { amount };
}

export function validatePolicyLimits(perAction: string, daily: string): {
  perActionLimit?: bigint | undefined;
  dailyLimit?: bigint | undefined;
  errors: { perAction?: string | undefined; daily?: string | undefined };
} {
  const per = validatePolicyAmount(perAction, "Per-action limit");
  const day = validatePolicyAmount(daily, "Daily limit");
  const errors: { perAction?: string; daily?: string } = {};
  if (per.error) errors.perAction = per.error;
  if (day.error) errors.daily = day.error;
  if (per.amount !== undefined && day.amount !== undefined && day.amount < per.amount) {
    errors.daily = "Daily limit must be at least the per-action limit.";
  }
  return { perActionLimit: per.amount, dailyLimit: day.amount, errors };
}

export function validateReason(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Reason is required.";
  if (utf8ByteLength(trimmed) > 200) return "Reason must be 200 bytes or fewer.";
  return undefined;
}

export type AuthorizationDraftValidation = {
  recipient?: string;
  amount?: string;
  reason?: string;
  parsedAmount?: bigint;
};

export function validateAuthorizationDraft(input: {
  recipient: string;
  amount: string;
  reason: string;
}): AuthorizationDraftValidation {
  const parsed = validatePolicyAmount(input.amount, "Amount");
  const recipient = input.recipient.trim() ? undefined : "Recipient is required.";
  const reason = validateReason(input.reason);
  return {
    ...(recipient ? { recipient } : {}),
    ...(parsed.error ? { amount: parsed.error } : {}),
    ...(reason ? { reason } : {}),
    ...(parsed.amount !== undefined ? { parsedAmount: parsed.amount } : {}),
  };
}
