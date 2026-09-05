import { describe, expect, it } from "vitest";
import { asHex32, bytesToHex32, hex32ToBytes } from "./index.js";

describe("public identifier encoding", () => {
  it("round-trips 32-byte ids", () => {
    const bytes = new Uint8Array(32);
    bytes[0] = 0xab;
    bytes[31] = 0xcd;
    const hex = bytesToHex32(bytes);
    expect(hex).toHaveLength(64);
    expect(hex32ToBytes(hex)).toEqual(bytes);
    expect(asHex32(`0x${hex}`)).toBe(hex);
  });

  it("rejects malformed public ids", () => {
    expect(() => asHex32("zzzz")).toThrow(/invalid public identifier/);
    expect(() => bytesToHex32(new Uint8Array(16))).toThrow(/invalid public identifier/);
  });
});
