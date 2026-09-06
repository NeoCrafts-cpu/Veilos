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

export function compiledArtifactsPresent(): boolean {
  return existsSync(path.join(zkConfigPath, "contract"));
}

export function compiledEconomyArtifactsPresent(): boolean {
  return existsSync(path.join(economyZkConfigPath, "contract"));
}

export function compiledEconomyPreviewArtifactsPresent(): boolean {
  return existsSync(path.join(economyPreviewZkConfigPath, "contract"));
}
