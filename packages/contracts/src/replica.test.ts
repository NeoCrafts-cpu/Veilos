/**
 * Compact contract tests (C1–C30).
 *
 * These execute the Compact semantics replica that mirrors
 * `compact/authorization.compact`. They are isolated unit tests, not a
 * production Midnight path. Real-network authority is `SucceedEntirely`
 * after `compact compile` + MidnightJS (see tests/integration).
 */

import { describe, expect, it } from "vitest";
import { authorizationWindow, roleCommitment } from "@velios/policy-engine";
import type { VeliosPrivateState } from "@velios/shared-types";
import {
  authorizeAction,
  CircuitAssertError,
  constructOrganization,
  createAgent,
  registerMember,
  setAgentPolicy,
  setAgentPolicyBySelf,
  setAgentStatus,
  setMemberStatus,
  setOrganizationStatus,
} from "./replica.js";

const orgId = fill(0x11);
const memberA = fill(0xc1);
const memberB = fill(0xc2);
const agentA = fill(0xa1);
const agentB = fill(0xb2);
const vendor = fill(0x82);
const otherVendor = fill(0x33);
const action1 = fill(0x01);
const action2 = fill(0x02);
const action3 = fill(0x03);

/** A window containing BLOCK_TIME, and the next day's window. */
const BLOCK_TIME = 1_700_000_000n;
const WINDOW = authorizationWindow(BLOCK_TIME);
const NEXT_WINDOW = authorizationWindow(BLOCK_TIME + 86_400n);
const NEXT_BLOCK_TIME = BLOCK_TIME + 86_400n;

function fill(n: number): Uint8Array {
  return new Uint8Array(32).fill(n);
}

function privateState(overrides: Partial<VeliosPrivateState> = {}): VeliosPrivateState {
  return {
    ownerSecret: fill(0x51),
    memberSecret: fill(0x61),
    agentSecret: fill(0x62),
    agentRole: fill(0x63),
    roleSalt: fill(0x64),
    perActionLimit: 25_000n,
    dailyLimit: 25_000n,
    vendorId: vendor,
    credentialOk: true,
    credentialExpiry: 1_800_000_000n,
    selfModifyAllowed: false,
    policySalt: fill(0x71),
    spendPeriodStart: WINDOW.periodStart,
    dailySpend: 0n,
    spendSalt: fill(0x81),
    nextSpendSalt: fill(0x91),
    ...overrides,
  };
}

function readyLedger(state = privateState()) {
  const ledger = constructOrganization(orgId, state);
  registerMember(ledger, memberA, state);
  createAgent(ledger, agentA, memberA, state);
  return ledger;
}

function authorize(
  ledger: ReturnType<typeof readyLedger>,
  state: VeliosPrivateState,
  overrides: Partial<{
    agentId: Uint8Array;
    actionId: Uint8Array;
    amount: bigint;
    vendorId: Uint8Array;
    claimedOrganizationId: Uint8Array;
    periodStart: bigint;
    periodEnd: bigint;
    blockTimeSeconds: bigint;
  }> = {},
) {
  authorizeAction(
    ledger,
    {
      agentId: overrides.agentId ?? agentA,
      actionId: overrides.actionId ?? action1,
      actionType: "payment",
      amount: overrides.amount ?? 4800n,
      vendorId: overrides.vendorId ?? vendor,
      claimedOrganizationId: overrides.claimedOrganizationId ?? orgId,
      periodStart: overrides.periodStart ?? WINDOW.periodStart,
      periodEnd: overrides.periodEnd ?? WINDOW.periodEnd,
      blockTimeSeconds: overrides.blockTimeSeconds ?? BLOCK_TIME,
    },
    state,
  );
}

describe("Wave 1 Compact semantics (authorization.compact)", () => {
  it("C1 valid payment action PASS", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    authorize(ledger, state);
    expect(ledger.actions.size).toBe(1);
    expect([...ledger.actions.values()][0]?.result).toBe("authorized");
  });

  it("C2 amount above per-action limit REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() => authorize(ledger, state, { amount: 48_000n })).toThrow(CircuitAssertError);
    expect(ledger.actions.size).toBe(0);
  });

  it("C3 daily spend + amount above daily limit REJECT", () => {
    const state = privateState({ dailySpend: 24_000n });
    const ledger = constructOrganization(orgId, state);
    registerMember(ledger, memberA, state);
    createAgent(ledger, agentA, memberA, state);
    expect(() => authorize(ledger, state, { amount: 2000n })).toThrow(/policy predicate failed/);
    expect(ledger.actions.size).toBe(0);
  });

  it("C4 inactive agent REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    setAgentStatus(ledger, agentA, "inactive", state);
    expect(() => authorize(ledger, state)).toThrow(/agent inactive/);
  });

  it("C5 credentialOk false REJECT", () => {
    const good = privateState();
    const ledger = readyLedger(good);
    const bad = privateState({ credentialOk: false, policySalt: fill(0x71) });
    // Same salt but credential flipped — commitment no longer opens.
    expect(() => authorize(ledger, bad)).toThrow(/policy predicate failed|credential/);
  });

  it("C6 invalid credential fixture REJECT", () => {
    const invalid = privateState({ credentialOk: false });
    const ledger = constructOrganization(orgId, invalid);
    registerMember(ledger, memberA, invalid);
    createAgent(ledger, agentA, memberA, invalid);
    expect(() => authorize(ledger, invalid)).toThrow(/credential predicate failed/);
  });

  it("C7 wrong organization id REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() => authorize(ledger, state, { claimedOrganizationId: fill(0xff) })).toThrow(
      /wrong organization/,
    );
  });

  it("C8 duplicate action id REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    authorize(ledger, state, { actionId: action1 });
    const after = {
      ...state,
      dailySpend: 4800n,
      spendSalt: state.nextSpendSalt,
      nextSpendSalt: fill(0x92),
    };
    expect(() => authorize(ledger, after, { actionId: action1 })).toThrow(/replay/);
  });

  it("C9 replay of a successful action REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    authorize(ledger, state);
    const afterSuccess = {
      ...state,
      dailySpend: 4800n,
      spendSalt: state.nextSpendSalt,
      nextSpendSalt: fill(0x93),
    };
    expect(() => authorize(ledger, afterSuccess)).toThrow(/replay/);
    expect(ledger.actions.size).toBe(1);
  });

  it("C10 witness preimage does not open policy commitment REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    const tampered = privateState({ perActionLimit: 99_999n });
    expect(() => authorize(ledger, tampered)).toThrow(/policy predicate failed/);
  });

  it("C11 wrong owner secret REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    const otherOwner = privateState({ ownerSecret: fill(0x00) });
    expect(() => authorize(ledger, otherOwner)).toThrow(/unauthorized/);
  });

  it("C12 unauthorized setAgentPolicy REJECT", () => {
    const owner = privateState();
    const ledger = readyLedger(owner);
    const attacker = privateState({ ownerSecret: fill(0xee) });
    expect(() => setAgentPolicy(ledger, agentA, attacker)).toThrow(/unauthorized/);
  });

  it("C13 inactive organization REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    setOrganizationStatus(ledger, "inactive", state);
    expect(() => authorize(ledger, state)).toThrow(/organization inactive/);
  });

  it("C14 vendor id != committed vendor REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() => authorize(ledger, state, { vendorId: otherVendor })).toThrow(
      /policy predicate failed/,
    );
  });

  it("C15 create agent twice with same id REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() => createAgent(ledger, agentA, memberA, state)).toThrow(/agent exists/);
  });

  it("C16 credential expiring before the window end REJECT", () => {
    // Expiry inside the window is still an expiry: the circuit requires the
    // credential to be valid through the whole proved window.
    const expiring = privateState({ credentialExpiry: WINDOW.periodEnd - 1n });
    const ledger = constructOrganization(orgId, expiring);
    registerMember(ledger, memberA, expiring);
    createAgent(ledger, agentA, memberA, expiring);
    expect(() => authorize(ledger, expiring)).toThrow(/credential expired/);
    expect(ledger.actions.size).toBe(0);
  });

  it("C17 credential valid exactly to the window end PASS", () => {
    const boundary = privateState({ credentialExpiry: WINDOW.periodEnd });
    const ledger = constructOrganization(orgId, boundary);
    registerMember(ledger, memberA, boundary);
    createAgent(ledger, agentA, memberA, boundary);
    authorize(ledger, boundary);
    expect(ledger.actions.size).toBe(1);
  });

  it("C18 daily limit resets in the next window PASS", () => {
    // Spent to the daily cap yesterday; today the bucket rolls over.
    const spent = privateState({ dailySpend: 25_000n });
    const ledger = constructOrganization(orgId, spent);
    registerMember(ledger, memberA, spent);
    createAgent(ledger, agentA, memberA, spent);
    expect(() => authorize(ledger, spent, { amount: 4800n })).toThrow(
      /policy predicate failed/,
    );
    authorize(ledger, spent, {
      amount: 4800n,
      actionId: action2,
      periodStart: NEXT_WINDOW.periodStart,
      periodEnd: NEXT_WINDOW.periodEnd,
      blockTimeSeconds: NEXT_BLOCK_TIME,
    });
    expect(ledger.actions.size).toBe(1);
  });

  it("C19 spend bucket from a later window REJECT", () => {
    // A bucket committed for tomorrow cannot be spent against today's window.
    const future = privateState({ spendPeriodStart: NEXT_WINDOW.periodStart });
    const ledger = constructOrganization(orgId, future);
    registerMember(ledger, memberA, future);
    createAgent(ledger, agentA, memberA, future);
    expect(() => authorize(ledger, future)).toThrow(/stale period/);
  });

  it("C20 window that has not started yet REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() =>
      authorize(ledger, state, { blockTimeSeconds: WINDOW.periodStart }),
    ).toThrow(/period not started/);
  });

  it("C21 window already elapsed REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() =>
      authorize(ledger, state, { blockTimeSeconds: WINDOW.periodEnd + 1n }),
    ).toThrow(/period elapsed/);
  });

  it("C22 window longer than one day REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() =>
      authorize(ledger, state, { periodEnd: WINDOW.periodStart + 86_401n }),
    ).toThrow(/period too long/);
  });

  it("C23 inverted window REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    expect(() =>
      authorize(ledger, state, {
        periodStart: WINDOW.periodEnd,
        periodEnd: WINDOW.periodStart,
      }),
    ).toThrow(/invalid period/);
  });

  it("C24 createAgent for an unknown member REJECT", () => {
    const state = privateState();
    const ledger = constructOrganization(orgId, state);
    expect(() => createAgent(ledger, agentA, memberA, state)).toThrow(/member missing/);
  });

  it("C25 createAgent by a wrong member secret REJECT", () => {
    const admin = privateState();
    const ledger = constructOrganization(orgId, admin);
    registerMember(ledger, memberA, admin);
    const impostor = privateState({ memberSecret: fill(0xde) });
    expect(() => createAgent(ledger, agentB, memberA, impostor)).toThrow(/unauthorized/);
  });

  it("C26 createAgent under an inactive member REJECT", () => {
    const state = privateState();
    const ledger = constructOrganization(orgId, state);
    registerMember(ledger, memberA, state);
    setMemberStatus(ledger, memberA, "inactive", state);
    expect(() => createAgent(ledger, agentA, memberA, state)).toThrow(/member inactive/);
  });

  it("C27 revoking a member disables its agent's authorizations REJECT", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    setMemberStatus(ledger, memberA, "inactive", state);
    expect(() => authorize(ledger, state)).toThrow(/member inactive/);
  });

  it("C28 registerMember by a non-admin REJECT", () => {
    const admin = privateState();
    const ledger = constructOrganization(orgId, admin);
    const attacker = privateState({ ownerSecret: fill(0xee) });
    expect(() => registerMember(ledger, memberB, attacker)).toThrow(/unauthorized/);
  });

  it("C29 duplicate member id REJECT", () => {
    const state = privateState();
    const ledger = constructOrganization(orgId, state);
    registerMember(ledger, memberA, state);
    expect(() => registerMember(ledger, memberA, state)).toThrow(/member exists/);
  });

  it("C30 self policy modification denied unless the committed policy allows it", () => {
    const denied = privateState({ selfModifyAllowed: false });
    const deniedLedger = readyLedger(denied);
    expect(() => setAgentPolicyBySelf(deniedLedger, agentA, denied)).toThrow(
      /self modify denied/,
    );

    // An agent cannot flip the flag: a different flag means a different policy
    // commitment, so the committed-policy check fails first.
    const forged = privateState({ selfModifyAllowed: true });
    expect(() => setAgentPolicyBySelf(deniedLedger, agentA, forged)).toThrow(
      /policy predicate failed/,
    );

    const allowed = privateState({ selfModifyAllowed: true, policySalt: fill(0x72) });
    const allowedLedger = readyLedger(allowed);
    setAgentPolicyBySelf(allowedLedger, agentA, {
      ...allowed,
      agentRole: fill(0x65),
    });
    expect(allowedLedger.agents.get(key(agentA))?.roleCommitment).toEqual(
      roleCommitment(fill(0x65), allowed.roleSalt),
    );
  });

  it("C31 self policy modification with a wrong agent secret REJECT", () => {
    const allowed = privateState({ selfModifyAllowed: true });
    const ledger = readyLedger(allowed);
    const impostor = { ...allowed, agentSecret: fill(0xdd) };
    expect(() => setAgentPolicyBySelf(ledger, agentA, impostor)).toThrow(/unauthorized/);
  });

  it("public counters track members, agents and authorized actions", () => {
    const state = privateState();
    const ledger = constructOrganization(orgId, state);
    expect(ledger.memberCount).toBe(0n);
    registerMember(ledger, memberA, state);
    registerMember(ledger, memberB, state);
    createAgent(ledger, agentA, memberA, state);
    authorize(ledger, state);
    expect(ledger.memberCount).toBe(2n);
    expect(ledger.agentCount).toBe(1n);
    expect(ledger.actionCount).toBe(1n);
  });

  it("action record carries the chain-bound window as its public timestamp", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    authorize(ledger, state);
    const record = ledger.actions.get(key(action1));
    expect(record?.periodStart).toBe(WINDOW.periodStart);
    expect(record?.periodEnd).toBe(WINDOW.periodEnd);
  });

  it("role commitment hides the role but changes when the role changes", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    const stored = ledger.agents.get(key(agentA))?.roleCommitment;
    expect(stored).toEqual(roleCommitment(state.agentRole, state.roleSalt));
    // The raw role never appears on the ledger.
    expect(stored).not.toEqual(state.agentRole);
    expect(roleCommitment(fill(0x66), state.roleSalt)).not.toEqual(stored);
  });

  it("authorized policy change then only the new preimage opens", () => {
    const original = privateState();
    const ledger = readyLedger(original);
    const updated = privateState({
      perActionLimit: 50_000n,
      dailyLimit: 50_000n,
      policySalt: fill(0x22),
    });
    setAgentPolicy(ledger, agentA, updated);
    expect(() => authorize(ledger, original, { amount: 4800n })).toThrow(
      /policy predicate failed/,
    );
    authorize(ledger, updated, { amount: 30_000n, actionId: action2 });
    expect(ledger.actions.size).toBe(1);
  });

  it("wrong agent policy preimage cannot authorize another agent", () => {
    const a = privateState();
    const b = privateState({ ownerSecret: fill(0xb0), policySalt: fill(0xb1) });
    const ledger = constructOrganization(orgId, a);
    registerMember(ledger, memberA, a);
    createAgent(ledger, agentA, memberA, a);
    createAgent(ledger, agentB, memberA, { ...b, memberSecret: a.memberSecret });
    expect(() => authorize(ledger, a, { agentId: agentB })).toThrow(/unauthorized|policy/);
  });

  it("spend accumulates across actions inside one window", () => {
    const state = privateState();
    const ledger = readyLedger(state);
    authorize(ledger, state, { amount: 20_000n, actionId: action1 });
    const after = {
      ...state,
      dailySpend: 20_000n,
      spendSalt: state.nextSpendSalt,
      nextSpendSalt: fill(0x94),
    };
    // 20_000 + 6_000 exceeds the 25_000 daily cap even though each action is
    // under the per-action cap.
    expect(() => authorize(ledger, after, { amount: 6000n, actionId: action2 })).toThrow(
      /policy predicate failed/,
    );
    authorize(ledger, after, { amount: 5000n, actionId: action3 });
    expect(ledger.actionCount).toBe(2n);
  });
});

function key(id: Uint8Array): string {
  return [...id].map((b) => b.toString(16).padStart(2, "0")).join("");
}
