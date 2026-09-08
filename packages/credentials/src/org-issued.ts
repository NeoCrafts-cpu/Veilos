import type { CredentialClass } from "@velios/shared-types";
import { credentialCommitment, revocationNullifier } from "./commitments.js";
import type { CredentialHolder, CredentialIssueInput, CredentialIssuer, IssuedCredentialPublic } from "./ports.js";

export function issueOrganizationCredential(input: CredentialIssueInput): IssuedCredentialPublic {
  const commitment = credentialCommitment(input);
  return {
    commitment,
    revocationNullifier: revocationNullifier(commitment, input.revocationSecret),
    className: input.className,
    organizationId: input.organizationId,
    expiry: input.expiry,
  };
}

export class OrganizationCredentialRegistry implements CredentialIssuer {
  readonly issued = new Map<string, IssuedCredentialPublic>();
  readonly revoked = new Set<string>();

  issue(input: CredentialIssueInput): IssuedCredentialPublic {
    const published = issueOrganizationCredential(input);
    this.issued.set(Buffer.from(published.commitment).toString("hex"), published);
    return published;
  }

  revoke(nullifier: Uint8Array): void {
    this.revoked.add(Buffer.from(nullifier).toString("hex"));
  }
}

export const organizationCredentialHolder: CredentialHolder = {
  prove(input) {
    if (input.organizationId && !Buffer.from(input.credential.organizationId).equals(Buffer.from(input.organizationId))) {
      return { ok: false, code: "wrong_issuer" };
    }
    if (input.credential.className !== input.requiredClass) {
      return { ok: false, code: "wrong_class" };
    }
    if (input.credential.expiry < input.periodEnd) {
      return { ok: false, code: "expired" };
    }
    if (input.revoked.some((item) => Buffer.from(item).equals(Buffer.from(input.credential.revocationNullifier)))) {
      return { ok: false, code: "revoked" };
    }
    return { ok: true };
  },
};

export function requiredClassForAction(kind: "authorize" | "vote" | "bid"): CredentialClass {
  if (kind === "vote") return "admin";
  if (kind === "bid") return "procurement";
  return "treasury";
}
