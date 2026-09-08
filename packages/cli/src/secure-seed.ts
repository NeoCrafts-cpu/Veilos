/**
 * Persist a freshly generated wallet seed with restrictive permissions.
 * Never print the seed unless the caller passes --print-seed.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function writeGeneratedSeedFile(repoRoot: string, seed: string): string {
  const dir = path.join(repoRoot, ".private-state");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const filePath = path.join(dir, "preview-wallet.seed");
  writeFileSync(filePath, `${seed}\n`, { mode: 0o600, encoding: "utf8" });
  return filePath;
}
