/**
 * Encode / decode VeliosPrivateState for the official private-state provider.
 * Never log the payload. Hex only — no plaintext policy in URLs.
 */

import { asHex32, hex32ToBytes, type VeliosPrivateState } from "@velios/shared-types";

export type EncodedPrivateState = {
  ownerSecret: string;
  memberSecret: string;
  agentSecret: string;
  agentRole: string;
  roleSalt: string;
  perActionLimit: string;
  dailyLimit: string;
  vendorId: string;
  credentialOk: boolean;
  credentialExpiry: string;
  selfModifyAllowed: boolean;
  policySalt: string;
  spendPeriodStart: string;
  dailySpend: string;
  spendSalt: string;
  nextSpendSalt: string;
};

function asHex32String(value: unknown, label: string) {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error(`invalid private-state field: ${label}`);
  }
  return asHex32(value);
}

function asIntegerString(value: unknown, label: string): bigint {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`invalid private-state field: ${label}`);
  }
  return BigInt(value);
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function encodePrivateState(state: VeliosPrivateState): EncodedPrivateState {
  return {
    ownerSecret: bytesToHex(state.ownerSecret),
    memberSecret: bytesToHex(state.memberSecret),
    agentSecret: bytesToHex(state.agentSecret),
    agentRole: bytesToHex(state.agentRole),
    roleSalt: bytesToHex(state.roleSalt),
    perActionLimit: state.perActionLimit.toString(),
    dailyLimit: state.dailyLimit.toString(),
    vendorId: bytesToHex(state.vendorId),
    credentialOk: state.credentialOk,
    credentialExpiry: state.credentialExpiry.toString(),
    selfModifyAllowed: state.selfModifyAllowed,
    policySalt: bytesToHex(state.policySalt),
    spendPeriodStart: state.spendPeriodStart.toString(),
    dailySpend: state.dailySpend.toString(),
    spendSalt: bytesToHex(state.spendSalt),
    nextSpendSalt: bytesToHex(state.nextSpendSalt),
  };
}

export function decodePrivateState(encoded: unknown): VeliosPrivateState {
  const record = encoded as Partial<EncodedPrivateState>;
  return {
    ownerSecret: hex32ToBytes(asHex32String(record.ownerSecret, "owner")),
    memberSecret: hex32ToBytes(asHex32String(record.memberSecret, "member")),
    agentSecret: hex32ToBytes(asHex32String(record.agentSecret, "agent")),
    agentRole: hex32ToBytes(asHex32String(record.agentRole, "role")),
    roleSalt: hex32ToBytes(asHex32String(record.roleSalt, "roleSalt")),
    perActionLimit: asIntegerString(record.perActionLimit, "perActionLimit"),
    dailyLimit: asIntegerString(record.dailyLimit, "dailyLimit"),
    vendorId: hex32ToBytes(asHex32String(record.vendorId, "vendor")),
    credentialOk: record.credentialOk === true,
    credentialExpiry: asIntegerString(record.credentialExpiry, "credentialExpiry"),
    selfModifyAllowed: record.selfModifyAllowed === true,
    policySalt: hex32ToBytes(asHex32String(record.policySalt, "policySalt")),
    spendPeriodStart: asIntegerString(record.spendPeriodStart, "spendPeriodStart"),
    dailySpend: asIntegerString(record.dailySpend, "dailySpend"),
    spendSalt: hex32ToBytes(asHex32String(record.spendSalt, "spendSalt")),
    nextSpendSalt: hex32ToBytes(asHex32String(record.nextSpendSalt, "nextSpendSalt")),
  };
}
