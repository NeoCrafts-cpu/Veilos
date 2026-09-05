import { describe, expect, it } from "vitest";
import { intentCommitment, reasonDigest } from "./commitments.js";

const actionId = new Uint8Array(32).fill(1);
const agentId = new Uint8Array(32).fill(2);
const organizationId = new Uint8Array(32).fill(3);
const vendorId = new Uint8Array(32).fill(4);
const salt = new Uint8Array(32).fill(5);

function base() {
  return {
    actionId,
    agentId,
    organizationId,
    amount: 4800n,
    vendorId,
    reason: "invoice-88",
    periodStart: 1n,
    periodEnd: 86_401n,
    salt,
  };
}

describe("intent commitment", () => {
  it("is deterministic and binds amount, recipient, organization, and action", () => {
    const first = intentCommitment(base());
    expect(intentCommitment(base())).toEqual(first);
    expect(intentCommitment({ ...base(), amount: 4801n })).not.toEqual(first);
    expect(intentCommitment({ ...base(), vendorId: new Uint8Array(32).fill(9) })).not.toEqual(first);
    expect(intentCommitment({ ...base(), organizationId: new Uint8Array(32).fill(8) })).not.toEqual(first);
    expect(intentCommitment({ ...base(), actionId: new Uint8Array(32).fill(7) })).not.toEqual(first);
    expect(reasonDigest("invoice-88")).not.toEqual(reasonDigest("invoice-89"));
  });
});
