import { describe, expect, it } from "vitest";
import { asHex32 } from "@velios/shared-types";
import { explainCaughtError, outcomeFromCaughtError, outcomeFromTxStatus, publicErrorLabel } from "./status.js";

const actionId = asHex32("11".repeat(32));

describe("transaction status mapping", () => {
  it("treats SucceedEntirely as submitted, not recorded", () => {
    const ok = outcomeFromTxStatus({
      status: "SucceedEntirely",
      actionId,
      contractAddress: "abc",
      txId: "tx1",
    });
    expect(ok).toEqual({ kind: "pending", phase: "indexing" });
    expect(outcomeFromTxStatus({ status: "FailEntirely", actionId, contractAddress: "abc", txId: "tx1" }).kind).toBe(
      "failed",
    );
    expect(outcomeFromTxStatus({ status: "FailFallible", actionId, contractAddress: "abc", txId: "tx1" }).kind).toBe(
      "failed",
    );
  });

  it("authorizes only after indexer confirmation", async () => {
    const { outcomeFromIndexerConfirm } = await import("./status.js");
    expect(
      outcomeFromIndexerConfirm({
        confirmed: true,
        actionId,
        contractAddress: "abc",
        txId: "tx1",
      }).kind,
    ).toBe("authorized");
    expect(
      outcomeFromIndexerConfirm({
        confirmed: false,
        actionId,
        contractAddress: "abc",
        txId: "tx1",
      }),
    ).toEqual({ kind: "stale" });
  });

  it("maps circuit asserts to rejection without leaking limits", () => {
    const rejected = outcomeFromCaughtError(new Error("policy predicate failed"));
    expect(rejected.kind).toBe("rejected");
    expect(JSON.stringify(rejected)).not.toMatch(/25000|48000|limit/);
    expect(publicErrorLabel(rejected)).toBe("PROOF REJECTED");
  });

  it("treats every authorization.compact assert as a rejection, not a fault", () => {
    // Mirrors the assert strings in compact/authorization.compact. A circuit
    // refusal must never be reported as an infrastructure failure.
    const asserts = [
      "organization inactive",
      "wrong organization",
      "unauthorized",
      "member exists",
      "member missing",
      "member inactive",
      "agent exists",
      "agent missing",
      "agent inactive",
      "self modify denied",
      "policy predicate failed",
      "credential predicate failed",
      "credential expired",
      "invalid period",
      "period too long",
      "period not started",
      "period elapsed",
      "stale period",
      "replay",
    ];
    for (const message of asserts) {
      const outcome = outcomeFromCaughtError(new Error(message));
      expect(outcome, message).toEqual({ kind: "rejected", code: "policy_violation" });
    }
  });

  it("maps a wallet Request failed submit to a public wallet rejection", () => {
    const outcome = outcomeFromCaughtError(
      new Error("Unexpected error submitting scoped transaction '<unnamed>': Error: Request failed"),
    );
    expect(outcome).toEqual({ kind: "failed", code: "wallet_rejected" });
    expect(explainCaughtError(new Error("Error: Request failed"), "failed")).toMatch(/finish the proof|submit/);
  });

  it("keeps the private expiry out of the public rejection", () => {
    const outcome = outcomeFromCaughtError(new Error("credential expired"));
    // No timestamp, no expiry instant, no window bound.
    expect(JSON.stringify(outcome)).not.toMatch(/\d{9,}/);
    expect(publicErrorLabel(outcome)).toBe("PROOF REJECTED");
  });
});
