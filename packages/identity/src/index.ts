import { holderCommitment } from "@velios/credentials";

export type HolderIdentity = {
  kind: "org-holder-commitment";
  holderCommitment: Uint8Array;
};

export function identityFromHolderSecret(holderSecret: Uint8Array): HolderIdentity {
  return { kind: "org-holder-commitment", holderCommitment: holderCommitment(holderSecret) };
}

export type MidnightDidAdapter = {
  kind: "official-midnight-did";
  compatible: false;
  reason: string;
};

export function officialMidnightDidAdapter(): MidnightDidAdapter {
  return {
    kind: "official-midnight-did",
    compatible: false,
    reason:
      "@midnight-ntwrk/midnight-did-api 0.5.0 is published against MidnightJS 4.0.2, not the Wave 1 pin 4.1.1. Organization-issued holder commitments remain the production identity.",
  };
}
