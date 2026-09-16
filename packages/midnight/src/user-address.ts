/**
 * Decode an unshielded Midnight recipient into Compact UserAddress.bytes.
 * Official codec: @midnight-ntwrk/wallet-sdk-address-format UnshieldedAddress.
 * Never invent a hash of the bech32 string — sendUnshielded needs the real payload.
 */

import { MidnightBech32m, UnshieldedAddress } from "@midnight-ntwrk/wallet-sdk-address-format";
import { asHex32, hex32ToBytes } from "@velios/shared-types";

export type CompactUserAddress = { bytes: Uint8Array };

export function parseUserAddressBytes(input: string, networkId: string): Uint8Array {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("recipient is required");
  }
  const hex = trimmed.replace(/^0x/i, "");
  if (/^[0-9a-f]{64}$/i.test(hex)) {
    return hex32ToBytes(asHex32(hex.toLowerCase()));
  }
  if (!trimmed.toLowerCase().startsWith("mn_")) {
    throw new Error("invalid recipient address");
  }
  const parsed = MidnightBech32m.parse(trimmed);
  const address = parsed.decode(UnshieldedAddress, networkId);
  const bytes = new Uint8Array(address.data);
  if (bytes.length !== 32) {
    throw new Error("invalid unshielded address");
  }
  return bytes;
}

export function compactUserAddress(bytes: Uint8Array): CompactUserAddress {
  if (bytes.length !== 32) {
    throw new Error("invalid unshielded address");
  }
  return { bytes };
}
