export const UNSHIELDED_PUBLIC_FIELDS = [
  "amount",
  "recipient address",
  "treasury/contract",
  "transaction id",
  "block time",
] as const;

export const STILL_PRIVATE_AFTER_SETTLEMENT = [
  "policy limits",
  "accumulated spend opening",
  "credential claims",
  "reason",
  "internal vendor metadata",
] as const;

export function settlementDisclosureCopy(): {
  publicByDesign: readonly string[];
  stillPrivate: readonly string[];
} {
  return {
    publicByDesign: UNSHIELDED_PUBLIC_FIELDS,
    stillPrivate: STILL_PRIVATE_AFTER_SETTLEMENT,
  };
}
