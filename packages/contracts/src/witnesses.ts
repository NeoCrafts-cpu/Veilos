/**
 * Witness callbacks for the Wave 1 contract.
 * Values are untrusted until the circuit rebinds them to public commitments.
 * Do not log any field of VeliosPrivateState.
 */

import type { VeliosPrivateState } from "@velios/shared-types";

export type WitnessContext<PS> = {
  privateState: PS;
};

export type Witnesses<PS = VeliosPrivateState> = {
  ownerSecret(context: WitnessContext<PS>): [PS, Uint8Array];
  memberSecret(context: WitnessContext<PS>): [PS, Uint8Array];
  agentSecret(context: WitnessContext<PS>): [PS, Uint8Array];
  agentRole(context: WitnessContext<PS>): [PS, Uint8Array];
  roleSalt(context: WitnessContext<PS>): [PS, Uint8Array];
  policyPerActionLimit(context: WitnessContext<PS>): [PS, bigint];
  policyDailyLimit(context: WitnessContext<PS>): [PS, bigint];
  policyVendorId(context: WitnessContext<PS>): [PS, Uint8Array];
  policyCredentialOk(context: WitnessContext<PS>): [PS, boolean];
  policyCredentialExpiry(context: WitnessContext<PS>): [PS, bigint];
  policySelfModifyAllowed(context: WitnessContext<PS>): [PS, boolean];
  policySalt(context: WitnessContext<PS>): [PS, Uint8Array];
  spendPeriodStart(context: WitnessContext<PS>): [PS, bigint];
  spendDaily(context: WitnessContext<PS>): [PS, bigint];
  spendSalt(context: WitnessContext<PS>): [PS, Uint8Array];
  nextSpendSalt(context: WitnessContext<PS>): [PS, Uint8Array];
};

export function createVeliosPrivateState(
  seed: Omit<VeliosPrivateState, "dailySpend" | "nextSpendSalt" | "spendPeriodStart"> & {
    dailySpend?: bigint;
    nextSpendSalt?: Uint8Array;
    spendPeriodStart?: bigint;
  },
): VeliosPrivateState {
  return {
    ...seed,
    dailySpend: seed.dailySpend ?? 0n,
    spendPeriodStart: seed.spendPeriodStart ?? 0n,
    nextSpendSalt: seed.nextSpendSalt ?? seed.spendSalt,
  };
}

export const witnesses: Witnesses = {
  ownerSecret: ({ privateState }) => [privateState, privateState.ownerSecret],
  memberSecret: ({ privateState }) => [privateState, privateState.memberSecret],
  agentSecret: ({ privateState }) => [privateState, privateState.agentSecret],
  agentRole: ({ privateState }) => [privateState, privateState.agentRole],
  roleSalt: ({ privateState }) => [privateState, privateState.roleSalt],
  policyPerActionLimit: ({ privateState }) => [privateState, privateState.perActionLimit],
  policyDailyLimit: ({ privateState }) => [privateState, privateState.dailyLimit],
  policyVendorId: ({ privateState }) => [privateState, privateState.vendorId],
  policyCredentialOk: ({ privateState }) => [privateState, privateState.credentialOk],
  policyCredentialExpiry: ({ privateState }) => [privateState, privateState.credentialExpiry],
  policySelfModifyAllowed: ({ privateState }) => [privateState, privateState.selfModifyAllowed],
  policySalt: ({ privateState }) => [privateState, privateState.policySalt],
  spendPeriodStart: ({ privateState }) => [privateState, privateState.spendPeriodStart],
  spendDaily: ({ privateState }) => [privateState, privateState.dailySpend],
  spendSalt: ({ privateState }) => [privateState, privateState.spendSalt],
  nextSpendSalt: ({ privateState }) => [privateState, privateState.nextSpendSalt],
};

/**
 * Rolls the local spend accumulator forward after a confirmed authorization.
 * A spend committed for an earlier window resets, matching the circuit's
 * rolling-window rule.
 */
export function applySuccessfulSpend(
  state: VeliosPrivateState,
  amount: bigint,
  newNextSpendSalt: Uint8Array,
  periodStart: bigint,
): VeliosPrivateState {
  const carried = state.spendPeriodStart === periodStart ? state.dailySpend : 0n;
  return {
    ...state,
    spendPeriodStart: periodStart,
    dailySpend: carried + amount,
    spendSalt: state.nextSpendSalt,
    nextSpendSalt: newNextSpendSalt,
  };
}
