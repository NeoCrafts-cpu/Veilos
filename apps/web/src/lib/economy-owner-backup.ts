import { asHex32 } from "@velios/shared-types";

/**
 * Read the CLI treasury operator backup (gitignored preview-economy.json).
 * Returns the owner secret hex. Never log the payload.
 */
export function economyOwnerSecretFromBackup(value: unknown): string {
  if (!value || typeof value !== "object") {
    throw new Error("This file is not a treasury operator backup.");
  }
  const record = value as Record<string, unknown>;
  if (record.kind === "velios-operator-vault" || record.kind === "velios-wave2-vault") {
    throw new Error("This is the encrypted vault from this browser. Use the treasury operator backup instead.");
  }
  if (typeof record.memberSecret === "string" || typeof record.agentSecret === "string") {
    throw new Error("This is organization access. Import it under Organization access.");
  }
  const raw = record.ownerSecret ?? record.economyOwnerSecret;
  if (typeof raw !== "string") {
    throw new Error("This backup does not contain treasury operator access.");
  }
  try {
    return asHex32(raw);
  } catch {
    throw new Error("This backup does not contain treasury operator access.");
  }
}
