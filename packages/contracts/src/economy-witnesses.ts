/**
 * Witness callbacks for economy.compact.
 * Values are untrusted until circuits rebind them to public commitments.
 * Do not log this state.
 */

export type EconomyMerklePath = {
  leaf: Uint8Array;
  path: { sibling: { field: bigint }; goes_left: boolean }[];
};

export type VeliosEconomyPrivateState = {
  ownerSecret: Uint8Array;
  holderSecret: Uint8Array;
  credentialClass: bigint;
  credentialExpiry: bigint;
  credentialSalt: Uint8Array;
  credentialPath: EconomyMerklePath;
  revocationSecret: Uint8Array;
  intentSalt: Uint8Array;
  reasonDigest: Uint8Array;
  vendorId: Uint8Array;
  perActionLimit: bigint;
  dailyLimit: bigint;
  spendPeriodStart: bigint;
  spendDaily: bigint;
  spendSalt: Uint8Array;
  nextSpendSalt: Uint8Array;
  policySalt: Uint8Array;
  ballotChoice: bigint;
  ballotSalt: Uint8Array;
  tallyYes: bigint;
  tallyNo: bigint;
  bidSalt: Uint8Array;
  bidAmount: bigint;
  awardSalt: Uint8Array;
  winnerHolder: Uint8Array;
};

export type EconomyWitnessContext = {
  privateState: VeliosEconomyPrivateState;
};

export function emptyCredentialPath(leaf = new Uint8Array(32)): EconomyMerklePath {
  return {
    leaf,
    path: Array.from({ length: 10 }, () => ({ sibling: { field: 0n }, goes_left: true })),
  };
}

export function createEconomyPrivateState(
  seed: Pick<VeliosEconomyPrivateState, "ownerSecret"> & Partial<VeliosEconomyPrivateState>,
): VeliosEconomyPrivateState {
  const zeros = new Uint8Array(32);
  return {
    holderSecret: seed.holderSecret ?? zeros,
    credentialClass: seed.credentialClass ?? 0n,
    credentialExpiry: seed.credentialExpiry ?? 0n,
    credentialSalt: seed.credentialSalt ?? zeros,
    credentialPath: seed.credentialPath ?? emptyCredentialPath(),
    revocationSecret: seed.revocationSecret ?? zeros,
    intentSalt: seed.intentSalt ?? zeros,
    reasonDigest: seed.reasonDigest ?? zeros,
    vendorId: seed.vendorId ?? zeros,
    perActionLimit: seed.perActionLimit ?? 0n,
    dailyLimit: seed.dailyLimit ?? 0n,
    spendPeriodStart: seed.spendPeriodStart ?? 0n,
    spendDaily: seed.spendDaily ?? 0n,
    spendSalt: seed.spendSalt ?? zeros,
    nextSpendSalt: seed.nextSpendSalt ?? zeros,
    policySalt: seed.policySalt ?? zeros,
    ballotChoice: seed.ballotChoice ?? 0n,
    ballotSalt: seed.ballotSalt ?? zeros,
    tallyYes: seed.tallyYes ?? 0n,
    tallyNo: seed.tallyNo ?? 0n,
    bidSalt: seed.bidSalt ?? zeros,
    bidAmount: seed.bidAmount ?? 0n,
    awardSalt: seed.awardSalt ?? zeros,
    winnerHolder: seed.winnerHolder ?? zeros,
    ...seed,
  };
}

export const economyWitnesses = {
  ownerSecret: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.ownerSecret] as const,
  holderSecret: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.holderSecret] as const,
  credentialClass: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.credentialClass] as const,
  credentialExpiry: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.credentialExpiry] as const,
  credentialSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.credentialSalt] as const,
  credentialPath: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.credentialPath] as const,
  revocationSecret: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.revocationSecret] as const,
  intentSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.intentSalt] as const,
  reasonDigestW: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.reasonDigest] as const,
  vendorId: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.vendorId] as const,
  perActionLimit: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.perActionLimit] as const,
  dailyLimit: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.dailyLimit] as const,
  spendPeriodStart: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.spendPeriodStart] as const,
  spendDaily: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.spendDaily] as const,
  spendSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.spendSalt] as const,
  nextSpendSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.nextSpendSalt] as const,
  policySalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.policySalt] as const,
  ballotChoice: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.ballotChoice] as const,
  ballotSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.ballotSalt] as const,
  tallyYes: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.tallyYes] as const,
  tallyNo: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.tallyNo] as const,
  bidSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.bidSalt] as const,
  bidAmount: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.bidAmount] as const,
  awardSalt: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.awardSalt] as const,
  winnerHolder: ({ privateState }: EconomyWitnessContext) => [privateState, privateState.winnerHolder] as const,
};
