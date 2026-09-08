import { CREDENTIAL_CLASS_ID, type CredentialClass } from "@velios/shared-types";
import { encodeUint64, pad32, persistentHash } from "@velios/policy-engine";

export const DOMAIN_HOLDER = "velios:holder:";
export const DOMAIN_CRED = "velios:cred:";
export const DOMAIN_CRED_REV = "velios:credrev:";

export function holderCommitment(holderSecret: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_HOLDER), holderSecret]);
}

export function credentialCommitment(input: {
  holderSecret: Uint8Array;
  organizationId: Uint8Array;
  className: CredentialClass;
  expiry: bigint;
  salt: Uint8Array;
}): Uint8Array {
  return persistentHash([
    pad32(DOMAIN_CRED),
    holderCommitment(input.holderSecret),
    input.organizationId,
    encodeUint64(CREDENTIAL_CLASS_ID[input.className]),
    encodeUint64(input.expiry),
    input.salt,
  ]);
}

export function revocationNullifier(commitment: Uint8Array, revocationSecret: Uint8Array): Uint8Array {
  return persistentHash([pad32(DOMAIN_CRED_REV), commitment, revocationSecret]);
}
