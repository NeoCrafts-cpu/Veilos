import { describe, expect, it } from "vitest";
import { validateOperatorPassphrase } from "./passphrase.js";

describe("operator passphrase policy", () => {
  it("rejects short or weak passphrases", () => {
    expect(validateOperatorPassphrase("short")).toMatch(/16/);
    expect(validateOperatorPassphrase("abcdefghijklmnop")).toMatch(/three of/);
  });

  it("accepts a 16-character mixed passphrase", () => {
    expect(validateOperatorPassphrase("CorrectHorse12ab")).toBeUndefined();
  });
});
