import { describe, expect, it } from "vitest";
import { contractRole, stripPublishedWriteAddress } from "./wave2-ownership.js";

const published = "0b4a8d7e906a1c05d2c3c788ecf46682387e2239a4df96b201f34ff489547c8f";

describe("wave2 ownership", () => {
  it("never treats the published economy address as writable without an owner secret", () => {
    expect(
      contractRole({
        address: published,
        publishedAddress: published,
      }),
    ).toBe("observer");
    expect(stripPublishedWriteAddress(published, published, undefined)).toBeUndefined();
  });

  it("keeps a user-owned deploy when the vault holds the owner secret", () => {
    const owned = "aa".repeat(32);
    expect(
      contractRole({
        address: owned,
        ownerSecret: "bb".repeat(32),
      }),
    ).toBe("owner");
    expect(stripPublishedWriteAddress(owned, published, "bb".repeat(32))).toBe(owned);
  });
});
