import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { identityFromHolderSecret, officialMidnightDidAdapter } from "./index.js";

describe("identity ports", () => {
  it("derives a pseudonymous holder commitment", () => {
    const secret = randomBytes32();
    expect(identityFromHolderSecret(secret).holderCommitment).toHaveLength(32);
  });

  it("keeps the official DID adapter experimental until 4.1.1 compatibility is proven", () => {
    const adapter = officialMidnightDidAdapter();
    expect(adapter.compatible).toBe(false);
    expect(adapter.reason).toMatch(/4\.1\.1/);
  });
});
