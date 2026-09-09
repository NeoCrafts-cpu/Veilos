import { bytesToHex32, hex32ToBytes, type Hex32, type PaymentIntent } from "@velios/shared-types";
import { intentCommitment, reasonDigest } from "@velios/policy-engine";

export function paymentIntentCommitment(input: {
  intent: PaymentIntent;
  organizationId: Hex32;
  vendorId: Uint8Array;
  periodStart: bigint;
  periodEnd: bigint;
  salt: Uint8Array;
}): Hex32 {
  return bytesToHex32(
    intentCommitment({
      actionId: hex32ToBytes(input.intent.actionId),
      agentId: hex32ToBytes(input.intent.agentId),
      organizationId: hex32ToBytes(input.organizationId),
      amount: input.intent.amount,
      vendorId: input.vendorId,
      reason: input.intent.reason,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      salt: input.salt,
    }),
  );
}

export function sameIntentCommitment(
  left: Hex32,
  right: Hex32,
): boolean {
  return left === right;
}

export { reasonDigest };
