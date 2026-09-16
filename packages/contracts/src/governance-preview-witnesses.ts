/**
 * Witnesses for governance-preview.compact. Do not log this state.
 */

export type GovernancePreviewPrivateState = {
  ownerSecret: Uint8Array;
  holderSecret: Uint8Array;
  revocationSecret: Uint8Array;
  ballotChoice: bigint;
  ballotSalt: Uint8Array;
  tallyYes: bigint;
  tallyNo: bigint;
};

export function createGovernancePreviewPrivateState(
  seed: Pick<GovernancePreviewPrivateState, "ownerSecret"> & Partial<GovernancePreviewPrivateState>,
): GovernancePreviewPrivateState {
  const zeros = new Uint8Array(32);
  return {
    holderSecret: zeros,
    revocationSecret: zeros,
    ballotChoice: 0n,
    ballotSalt: zeros,
    tallyYes: 0n,
    tallyNo: 0n,
    ...seed,
  };
}

export const governancePreviewWitnesses = {
  ownerSecret: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.ownerSecret] as const,
  holderSecret: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.holderSecret] as const,
  revocationSecret: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.revocationSecret] as const,
  ballotChoice: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.ballotChoice] as const,
  ballotSalt: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.ballotSalt] as const,
  tallyYes: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.tallyYes] as const,
  tallyNo: ({ privateState }: { privateState: GovernancePreviewPrivateState }) =>
    [privateState, privateState.tallyNo] as const,
};
