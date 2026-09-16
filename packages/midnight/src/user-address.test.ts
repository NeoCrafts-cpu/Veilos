import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { compactUserAddress, parseUserAddressBytes } from "./user-address.js";

describe("user address", () => {
  it("accepts 32-byte hex as Compact UserAddress.bytes", () => {
    const hex = "ab".repeat(32);
    const bytes = parseUserAddressBytes(hex, "preview");
    expect(bytes).toHaveLength(32);
    expect(compactUserAddress(bytes).bytes).toEqual(bytes);
  });

  it("rejects labels that are not unshielded addresses", () => {
    expect(() => parseUserAddressBytes("supplier-8271", "preview")).toThrow(/invalid recipient/i);
  });

  it("rejects empty input", () => {
    expect(() => parseUserAddressBytes("  ", "preview")).toThrow(/required/i);
  });

  it("normalizes 0x-prefixed hex", () => {
    const bytes = parseUserAddressBytes(`0x${"cd".repeat(32)}`, "preview");
    expect(asHex32("cd".repeat(32)));
    expect(bytes[0]).toBe(0xcd);
  });
});
