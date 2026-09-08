import { describe, expect, it } from "vitest";
import { masterSeedFromSecret } from "./wallet.js";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon diesel";

describe("official HD seed derivation", () => {
  it("derives a deterministic hex master seed from a BIP39 mnemonic", () => {
    const first = masterSeedFromSecret({ kind: "mnemonic", value: TEST_MNEMONIC });
    const second = masterSeedFromSecret({ kind: "mnemonic", value: TEST_MNEMONIC });
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]+$/);
    expect(first.length).toBeGreaterThanOrEqual(64);
  });

  it("passes a hex seed through unchanged", () => {
    const seed = "11".repeat(32);
    expect(masterSeedFromSecret({ kind: "seed", value: seed })).toBe(seed);
  });
});
