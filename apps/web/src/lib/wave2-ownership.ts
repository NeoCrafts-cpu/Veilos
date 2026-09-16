/**
 * Public ownership labels for Wave 2 contracts.
 * Owner secrets stay in the encrypted vault. This module never stores them.
 */

export type ContractRole = "none" | "observer" | "owner";

export function contractRole(input: {
  address?: string | undefined;
  ownerSecret?: string | undefined;
  publishedAddress?: string | undefined;
}): ContractRole {
  if (!input.address) return "none";
  if (input.ownerSecret) return "owner";
  if (input.publishedAddress && input.address === input.publishedAddress) return "observer";
  return "observer";
}

export function stripPublishedWriteAddress(
  address: string | undefined,
  publishedAddress: string | undefined,
  ownerSecret: string | undefined,
): string | undefined {
  if (!address) return undefined;
  if (publishedAddress && address === publishedAddress && !ownerSecret) return undefined;
  return address;
}

export function ownershipLabel(role: ContractRole): string {
  if (role === "owner") return "Owner";
  if (role === "observer") return "Observer";
  return "Not deployed";
}
