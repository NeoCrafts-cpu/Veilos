/**
 * Browser-safe contract helpers. Node filesystem checks live in
 * `./node-artifacts.ts` so Vite can import this module for deploy.
 */

export async function loadCompiledAuthorization(): Promise<{
  Contract: unknown;
  ledger: unknown;
  pureCircuits?: Record<string, (...args: unknown[]) => unknown>;
} | null> {
  try {
    const generated = await import("../managed/authorization/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
      pureCircuits: generated.pureCircuits as Record<string, (...args: unknown[]) => unknown>,
    };
  } catch {
    return null;
  }
}

export { applySuccessfulSpend, createVeliosPrivateState, witnesses } from "./witnesses.js";
export type { Witnesses, WitnessContext } from "./witnesses.js";
export {
  createEconomyPrivateState,
  economyWitnesses,
  emptyCredentialPath,
} from "./economy-witnesses.js";
export type { EconomyMerklePath, VeliosEconomyPrivateState } from "./economy-witnesses.js";
export { createEconomyPreviewPrivateState, economyPreviewWitnesses } from "./economy-preview-witnesses.js";
export type { EconomyPreviewPrivateState } from "./economy-preview-witnesses.js";
export { createGovernancePreviewPrivateState, governancePreviewWitnesses } from "./governance-preview-witnesses.js";
export type { GovernancePreviewPrivateState } from "./governance-preview-witnesses.js";
export {
  createProcurementPreviewPrivateState,
  procurementPreviewWitnesses,
} from "./procurement-preview-witnesses.js";
export type { ProcurementPreviewPrivateState } from "./procurement-preview-witnesses.js";
export { createAuditorPreviewPrivateState, auditorPreviewWitnesses } from "./auditor-preview-witnesses.js";
export type { AuditorPreviewPrivateState } from "./auditor-preview-witnesses.js";

export async function loadCompiledEconomy(): Promise<{
  Contract: unknown;
  ledger: unknown;
} | null> {
  try {
    const generated = await import("../managed/economy/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
    };
  } catch {
    return null;
  }
}

export async function loadCompiledEconomyPreview(): Promise<{
  Contract: unknown;
  ledger: unknown;
} | null> {
  try {
    const generated = await import("../managed/economy-preview/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
    };
  } catch {
    return null;
  }
}

export async function loadCompiledGovernancePreview(): Promise<{
  Contract: unknown;
  ledger: unknown;
} | null> {
  try {
    const generated = await import("../managed/governance-preview/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
    };
  } catch {
    return null;
  }
}

export async function loadCompiledProcurementPreview(): Promise<{
  Contract: unknown;
  ledger: unknown;
} | null> {
  try {
    const generated = await import("../managed/procurement-preview/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
    };
  } catch {
    return null;
  }
}

export async function loadCompiledAuditorPreview(): Promise<{
  Contract: unknown;
  ledger: unknown;
} | null> {
  try {
    const generated = await import("../managed/auditor-preview/contract/index.js");
    return {
      Contract: generated.Contract,
      ledger: generated.ledger,
    };
  } catch {
    return null;
  }
}
