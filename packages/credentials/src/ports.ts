import type { CredentialClass } from "@velios/shared-types";

export type CredentialIssueInput = {
  holderSecret: Uint8Array;
  organizationId: Uint8Array;
  className: CredentialClass;
  expiry: bigint;
  salt: Uint8Array;
  revocationSecret: Uint8Array;
};

export type IssuedCredentialPublic = {
  commitment: Uint8Array;
  revocationNullifier: Uint8Array;
  className: CredentialClass;
  organizationId: Uint8Array;
  expiry: bigint;
};

export type CredentialIssuer = {
  issue(input: CredentialIssueInput): IssuedCredentialPublic;
  revoke(nullifier: Uint8Array): void;
};

export type CredentialHolder = {
  prove(input: {
    credential: IssuedCredentialPublic;
    requiredClass: CredentialClass;
    periodEnd: bigint;
    revoked: Uint8Array[];
    organizationId?: Uint8Array;
  }): { ok: true } | { ok: false; code: string };
};

export type OfficialCredentialAdapter = {
  kind: "official-midnight-vc";
  compatible: false;
  reason: string;
};
