import { describe, expect, it } from "vitest";
import { validateLabel, validatePolicyLimits, validateReason } from "./validation.js";

describe("form validation", () => {
  it("rejects empty and oversized labels", () => {
    expect(validateLabel("")).toMatch(/required/i);
    expect(validateLabel("a".repeat(33))).toMatch(/32 bytes/i);
    expect(validateLabel("TREASURY-01")).toBeUndefined();
  });

  it("requires daily limit to cover the per-action limit", () => {
    const result = validatePolicyLimits("10", "5");
    expect(result.errors.daily).toMatch(/at least/i);
  });

  it("rejects a blank reason", () => {
    expect(validateReason("")).toMatch(/required/i);
  });
});
