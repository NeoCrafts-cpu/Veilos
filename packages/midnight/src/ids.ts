import {
  randomBytes32,
  utf8Bytes32,
  DOMAIN_AGENT,
  DOMAIN_MEMBER,
  DOMAIN_ORG,
  DOMAIN_ROLE,
  DOMAIN_VENDOR,
} from "@velios/policy-engine";
import { bytesToHex32, type Hex32 } from "@velios/shared-types";

export const PRIVATE_STATE_ID = "VeliosAuthorizationPrivateState";

export function organizationIdFromName(name: string): Hex32 {
  return bytesToHex32(utf8Bytes32(name, DOMAIN_ORG));
}

export function agentIdFromLabel(label: string): Hex32 {
  return bytesToHex32(utf8Bytes32(label, DOMAIN_AGENT));
}

/** Public member identifier. Derived from a label, never from a secret. */
export function memberIdFromLabel(label: string): Hex32 {
  return bytesToHex32(utf8Bytes32(label, DOMAIN_MEMBER));
}

/** Hashes a private role label so the raw role never leaves private state. */
export function roleLabelToBytes(label: string): Uint8Array {
  return utf8Bytes32(label, DOMAIN_ROLE);
}

export function vendorIdFromRecipient(recipient: string): Uint8Array {
  return utf8Bytes32(recipient, DOMAIN_VENDOR);
}

export function newActionId(): Hex32 {
  return bytesToHex32(randomBytes32());
}
