import { describe, expect, it } from "vitest";
import { assertUint64, encodeBoolean, encodeUint64, pad32, persistentHash } from "./encoding.js";
import { ownerCommitment, policyCommitment, spendCommitment } from "./commitments.js";

describe("U2 amount encoding", () => {
  it("accepts Uint64 bounds", () => {
    expect(assertUint64(0n)).toBe(0n);
    expect(assertUint64((1n << 64n) - 1n)).toBe((1n << 64n) - 1n);
  });

  it("fails closed on overflow", () => {
    expect(() => assertUint64(1n << 64n)).toThrow(/Uint64/);
    expect(() => assertUint64(-1n)).toThrow(/Uint64/);
  });

  it("fails closed on a missing value instead of encoding zero", () => {
    expect(() => assertUint64(undefined as unknown as bigint)).toThrow(/not a Uint64/);
    expect(() => assertUint64(4800 as unknown as bigint)).toThrow(/not a Uint64/);
  });
});

describe("U3 commitment encoder", () => {
  it("pads domain separators to 32 bytes", () => {
    const padded = pad32("velios:owner:");
    expect(padded.length).toBe(32);
    expect(padded[0]).toBe("v".charCodeAt(0));
    expect(padded[31]).toBe(0);
  });

  it("encodes integers as 32-byte little-endian field bytes", () => {
    const encoded = encodeUint64(4800n);
    expect(encoded.length).toBe(32);
    expect(encoded[0]).toBe(0xc0);
    expect(encoded[1]).toBe(0x12);
    expect(encodeBoolean(true)[0]).toBe(1);
    expect(encodeBoolean(false)[0]).toBe(0);
  });

  it("is deterministic and domain-separated", () => {
    const secret = new Uint8Array(32).fill(7);
    const a = ownerCommitment(secret);
    const b = ownerCommitment(secret);
    expect(a).toEqual(b);
    expect(persistentHash([pad32("velios:owner:"), secret])).toEqual(a);

    const policyInput = {
      perActionLimit: 25_000n,
      dailyLimit: 25_000n,
      vendorId: new Uint8Array(32).fill(1),
      credentialOk: true,
      credentialExpiry: 1_800_000_000n,
      selfModifyAllowed: false,
      salt: new Uint8Array(32).fill(2),
    };
    const policy = policyCommitment(policyInput);
    const spend = spendCommitment(0n, 0n, new Uint8Array(32).fill(3));
    expect(policy).not.toEqual(spend);
    expect(policy).not.toEqual(a);

    // Expiry and the self-modify flag are bound into the commitment, so
    // neither can be changed without invalidating it.
    expect(policyCommitment({ ...policyInput, credentialExpiry: 1_800_000_001n })).not.toEqual(
      policy,
    );
    expect(policyCommitment({ ...policyInput, selfModifyAllowed: true })).not.toEqual(policy);
  });

  it("binds the spend bucket to its window", () => {
    const salt = new Uint8Array(32).fill(3);
    // Same amount in a different window must not reuse the same commitment.
    expect(spendCommitment(86_400n, 4800n, salt)).not.toEqual(
      spendCommitment(172_800n, 4800n, salt),
    );
  });
});
