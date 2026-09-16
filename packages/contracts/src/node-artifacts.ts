import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const compactSourcePath = path.resolve(currentDir, "..", "compact", "authorization.compact");
export const zkConfigPath = path.resolve(currentDir, "..", "managed", "authorization");
export const economySourcePath = path.resolve(currentDir, "..", "compact", "economy.compact");
export const economyZkConfigPath = path.resolve(currentDir, "..", "managed", "economy");
export const economyPreviewSourcePath = path.resolve(currentDir, "..", "compact", "economy-preview.compact");
export const economyPreviewZkConfigPath = path.resolve(currentDir, "..", "managed", "economy-preview");
export const governancePreviewSourcePath = path.resolve(currentDir, "..", "compact", "governance-preview.compact");
export const governancePreviewZkConfigPath = path.resolve(currentDir, "..", "managed", "governance-preview");
export const procurementPreviewSourcePath = path.resolve(currentDir, "..", "compact", "procurement-preview.compact");
export const procurementPreviewZkConfigPath = path.resolve(currentDir, "..", "managed", "procurement-preview");
export const auditorPreviewSourcePath = path.resolve(currentDir, "..", "compact", "auditor-preview.compact");
export const auditorPreviewZkConfigPath = path.resolve(currentDir, "..", "managed", "auditor-preview");

export function compiledArtifactsPresent(): boolean {
  return existsSync(path.join(zkConfigPath, "contract"));
}

export function compiledEconomyArtifactsPresent(): boolean {
  return existsSync(path.join(economyZkConfigPath, "contract"));
}

export function compiledEconomyPreviewArtifactsPresent(): boolean {
  return existsSync(path.join(economyPreviewZkConfigPath, "contract"));
}

export function compiledGovernancePreviewArtifactsPresent(): boolean {
  return existsSync(path.join(governancePreviewZkConfigPath, "contract"));
}

export function compiledProcurementPreviewArtifactsPresent(): boolean {
  return existsSync(path.join(procurementPreviewZkConfigPath, "contract"));
}

export function compiledAuditorPreviewArtifactsPresent(): boolean {
  return existsSync(path.join(auditorPreviewZkConfigPath, "contract"));
}
