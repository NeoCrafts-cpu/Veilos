/**
 * Witnesses for auditor-preview.compact. Do not log this state.
 */

export type AuditorPreviewPrivateState = {
  ownerSecret: Uint8Array;
};

export function createAuditorPreviewPrivateState(
  seed: Pick<AuditorPreviewPrivateState, "ownerSecret">,
): AuditorPreviewPrivateState {
  return { ownerSecret: seed.ownerSecret };
}

export const auditorPreviewWitnesses = {
  ownerSecret: ({ privateState }: { privateState: AuditorPreviewPrivateState }) =>
    [privateState, privateState.ownerSecret] as const,
};
