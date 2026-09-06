/**
 * Witnesses for economy-preview.compact. Do not log this state.
 */

import type { VeliosEconomyPrivateState } from "./economy-witnesses.js";

export type EconomyPreviewPrivateState = Omit<VeliosEconomyPrivateState, "credentialPath" | "ballotChoice" | "ballotSalt" | "tallyYes" | "tallyNo" | "bidSalt" | "bidAmount" | "awardSalt">;

export function createEconomyPreviewPrivateState(
  seed: Pick<EconomyPreviewPrivateState, "ownerSecret"> & Partial<EconomyPreviewPrivateState>,
): EconomyPreviewPrivateState {
  const zeros = new Uint8Array(32);
  return {
    holderSecret: zeros,
    credentialClass: 0n,
    credentialExpiry: 0n,
    credentialSalt: zeros,
    revocationSecret: zeros,
    intentSalt: zeros,
    reasonDigest: zeros,
    vendorId: zeros,
    perActionLimit: 0n,
    dailyLimit: 0n,
    spendPeriodStart: 0n,
    spendDaily: 0n,
    ...seed,
  };
}

export const economyPreviewWitnesses = {
  ownerSecret: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.ownerSecret] as const,
  holderSecret: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.holderSecret] as const,
  credentialClass: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.credentialClass] as const,
  credentialExpiry: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.credentialExpiry] as const,
  credentialSalt: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.credentialSalt] as const,
  revocationSecret: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.revocationSecret] as const,
  intentSalt: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.intentSalt] as const,
  reasonDigestW: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.reasonDigest] as const,
  vendorId: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.vendorId] as const,
  perActionLimit: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.perActionLimit] as const,
  dailyLimit: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.dailyLimit] as const,
  spendPeriodStart: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.spendPeriodStart] as const,
  spendDaily: ({ privateState }: { privateState: EconomyPreviewPrivateState }) =>
    [privateState, privateState.spendDaily] as const,
};
