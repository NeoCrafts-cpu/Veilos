/**
 * Witnesses for procurement-preview.compact. Do not log this state.
 */

export type ProcurementPreviewPrivateState = {
  ownerSecret: Uint8Array;
  holderSecret: Uint8Array;
  revocationSecret: Uint8Array;
  bidSalt: Uint8Array;
  bidAmount: bigint;
  awardSalt: Uint8Array;
  winnerHolder: Uint8Array;
};

export function createProcurementPreviewPrivateState(
  seed: Pick<ProcurementPreviewPrivateState, "ownerSecret"> & Partial<ProcurementPreviewPrivateState>,
): ProcurementPreviewPrivateState {
  const zeros = new Uint8Array(32);
  return {
    holderSecret: zeros,
    revocationSecret: zeros,
    bidSalt: zeros,
    bidAmount: 0n,
    awardSalt: zeros,
    winnerHolder: zeros,
    ...seed,
  };
}

export const procurementPreviewWitnesses = {
  ownerSecret: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.ownerSecret] as const,
  holderSecret: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.holderSecret] as const,
  revocationSecret: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.revocationSecret] as const,
  bidSalt: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.bidSalt] as const,
  bidAmount: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.bidAmount] as const,
  awardSalt: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.awardSalt] as const,
  winnerHolder: ({ privateState }: { privateState: ProcurementPreviewPrivateState }) =>
    [privateState, privateState.winnerHolder] as const,
};
