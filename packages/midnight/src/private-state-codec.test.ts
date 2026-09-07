import { describe, expect, it } from "vitest";
import { decodePrivateState, encodePrivateState } from "./private-state-codec.js";
import { asHex32, hex32ToBytes } from "@velios/shared-types";

const hex = (nibble: string) => hex32ToBytes(asHex32(nibble.repeat(64).slice(0, 64)));

describe("private-state codec", () => {
  it("round-trips bytes and bigints without leaking into error text", () => {
    const original = {
      ownerSecret: hex("a"),
      memberSecret: hex("b"),
      agentSecret: hex("c"),
      agentRole: hex("d"),
      roleSalt: hex("e"),
      perActionLimit: 25_000n,
      dailyLimit: 25_000n,
      vendorId: hex("f"),
      credentialOk: true,
      credentialExpiry: 1_789_303_380n,
      selfModifyAllowed: false,
      policySalt: hex("1"),
      spendPeriodStart: 10n,
      dailySpend: 4_800n,
      spendSalt: hex("2"),
      nextSpendSalt: hex("3"),
    };
    const encoded = encodePrivateState(original);
    const decoded = decodePrivateState(encoded);
    expect(decoded.perActionLimit).toBe(25_000n);
    expect(decoded.dailySpend).toBe(4_800n);
    expect(decoded.ownerSecret).toEqual(original.ownerSecret);
    expect(() => decodePrivateState({ ownerSecret: "nope" })).toThrow(/invalid private-state field/);
    try {
      decodePrivateState({ ownerSecret: original.ownerSecret });
    } catch (error) {
      expect(String(error)).not.toMatch(/aaaa/);
    }
  });
});
