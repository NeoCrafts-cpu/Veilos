import { describe, expect, it } from "vitest";
import { PREVIEW_ECONOMY_DEPLOYMENT } from "@velios/midnight/published";
import { contractRole, stripPublishedWriteAddress } from "./wave2-ownership.js";

const published = PREVIEW_ECONOMY_DEPLOYMENT.contractAddress;

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
