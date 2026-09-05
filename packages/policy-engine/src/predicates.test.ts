import { describe, expect, it } from "vitest";
import type { VeliosPrivateState } from "@velios/shared-types";
import { authorizationWindow } from "./period.js";
import { previewAuthorize, validateAgentIdLabel } from "./predicates.js";

const vendor = new Uint8Array(32).fill(9);
const WINDOW = authorizationWindow(1_700_000_000n);
const NEXT_WINDOW = authorizationWindow(1_700_000_000n + 86_400n);

function state(overrides: Partial<VeliosPrivateState> = {}): VeliosPrivateState {
  return {
    ownerSecret: new Uint8Array(32).fill(1),
    memberSecret: new Uint8Array(32).fill(5),
    agentSecret: new Uint8Array(32).fill(6),
    agentRole: new Uint8Array(32).fill(7),
    roleSalt: new Uint8Array(32).fill(8),
    perActionLimit: 25_000n,
    dailyLimit: 25_000n,
    vendorId: vendor,
    credentialOk: true,
    credentialExpiry: 1_800_000_000n,
    selfModifyAllowed: false,
    policySalt: new Uint8Array(32).fill(2),
    spendPeriodStart: WINDOW.periodStart,
    dailySpend: 0n,
    spendSalt: new Uint8Array(32).fill(3),
    nextSpendSalt: new Uint8Array(32).fill(4),
    ...overrides,
  };
}

describe("local preview (non-authoritative)", () => {
  it("U1 rejects empty agent id", () => {
    expect(() => validateAgentIdLabel("")).toThrow(/agent id required/);
    expect(() => validateAgentIdLabel("   ")).toThrow(/agent id required/);
  });

  it("U4 preview-allows 4800 vs limit 25000", () => {
    const decision = previewAuthorize({
      amount: 4800n,
      vendorId: vendor,
      privateState: state(),
      window: WINDOW,
    });
    expect(decision).toEqual({ allowed: true, code: "preview_allow" });
  });

  it("U5 preview-denies 48000 vs limit 25000", () => {
    const decision = previewAuthorize({
      amount: 48_000n,
      vendorId: vendor,
      privateState: state(),
      window: WINDOW,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("preview_deny_amount");
  });

  it("U6 preview must not be treated as Authorized", () => {
    const decision = previewAuthorize({
      amount: 4800n,
      vendorId: vendor,
      privateState: state(),
      window: WINDOW,
    });
    expect(decision).not.toHaveProperty("kind", "authorized");
    expect(Object.keys(decision).sort()).toEqual(["allowed", "code"]);
  });

  it("denies daily overflow and bad credential/vendor", () => {
    expect(
      previewAuthorize({
        amount: 20_000n,
        vendorId: vendor,
        privateState: state({ dailySpend: 10_000n }),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_daily");
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state({ credentialOk: false }),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_credential");
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: new Uint8Array(32).fill(8),
        privateState: state(),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_vendor");
  });

  it("U7 denies a credential that expires before the window ends", () => {
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state({ credentialExpiry: WINDOW.periodEnd - 1n }),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_expired");
  });

  it("U8 rolls the daily bucket over in a new window", () => {
    // Capped out in WINDOW...
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state({ dailySpend: 25_000n }),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_daily");
    // ...but the next window starts from zero.
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state({ dailySpend: 25_000n }),
        window: NEXT_WINDOW,
      }).code,
    ).toBe("preview_allow");
  });

  it("U9 denies a spend bucket committed for a later window", () => {
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state({ spendPeriodStart: NEXT_WINDOW.periodStart }),
        window: WINDOW,
      }).code,
    ).toBe("preview_deny_stale_period");
  });

  it("U10 denies an inactive member", () => {
    expect(
      previewAuthorize({
        amount: 100n,
        vendorId: vendor,
        privateState: state(),
        window: WINDOW,
        memberActive: false,
      }).code,
    ).toBe("preview_deny_inactive");
  });
});
