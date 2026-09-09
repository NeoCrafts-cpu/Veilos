import { describe, expect, it } from "vitest";
import { resultExplanation, resultHeadline } from "./result-copy.js";

describe("authorization result copy", () => {
  it("does not call a local refuse a proof rejection", () => {
    expect(resultHeadline({ kind: "rejected", code: "policy_violation" }, false)).toBe("NOT AUTHORIZED");
    expect(
      resultExplanation({
        outcome: { kind: "rejected", code: "policy_violation" },
        previewCode: "preview_deny_amount",
        circuitSubmitted: false,
      }),
    ).toMatch(/Midnight was not called/i);
  });

  it("explains a circuit reject after a local allow without naming the limit", () => {
    const text = resultExplanation({
      outcome: { kind: "rejected", code: "proof_rejected" },
      previewCode: "preview_allow",
      circuitSubmitted: true,
    });
    expect(text).toMatch(/commitments|ledger time/i);
    expect(text).not.toMatch(/25000|48000|amount too high|outside a private/);
  });
});
