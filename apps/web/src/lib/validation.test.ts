import { describe, expect, it } from "vitest";
import {
  validateAuthorizationDraft,
  validateLabel,
  validatePolicyLimits,
  validateReason,
} from "./validation.js";

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

  it("validates an authorization draft as one fail-closed unit", () => {
    expect(validateAuthorizationDraft({ recipient: "", amount: "0", reason: "" })).toMatchObject({
      recipient: "Recipient is required.",
      amount: "Amount must be greater than zero.",
      reason: "Reason is required.",
    });
    expect(validateAuthorizationDraft({ recipient: "vendor-1", amount: "42", reason: "Invoice 42" })).toEqual({
      parsedAmount: 42n,
    });
  });
});
