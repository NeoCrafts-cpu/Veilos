import { afterEach, describe, expect, it } from "vitest";
import {
  beginWalletWork,
  endWalletWork,
  isWalletWorkInFlight,
  resetWalletWorkLockForTests,
  shouldSkipWalletSessionCheck,
} from "./wallet-work-lock.js";

describe("wallet work lock", () => {
  afterEach(() => {
    resetWalletWorkLockForTests();
  });

  it("skips session checks while a prove/submit is in flight", () => {
    expect(shouldSkipWalletSessionCheck()).toBe(false);
    beginWalletWork();
    expect(isWalletWorkInFlight()).toBe(true);
    expect(shouldSkipWalletSessionCheck()).toBe(true);
    endWalletWork();
    expect(isWalletWorkInFlight()).toBe(false);
    expect(shouldSkipWalletSessionCheck()).toBe(true);
    expect(shouldSkipWalletSessionCheck(Date.now() + 16_000)).toBe(false);
  });

  it("nests overlapping Wave 1 and Wave 2 work", () => {
    beginWalletWork();
    beginWalletWork();
    endWalletWork();
    expect(isWalletWorkInFlight()).toBe(true);
    endWalletWork();
    expect(isWalletWorkInFlight()).toBe(false);
  });
});
