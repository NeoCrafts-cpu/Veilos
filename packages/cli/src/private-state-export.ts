/**
 * Write operator private state next to the repo so the local UI can join
 * the Preview contract. Gitignored. Never log the payload.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { encodePrivateState } from "@velios/midnight";
import type { VeliosPrivateState } from "@velios/shared-types";

export function writePrivateStateExport(repoRoot: string, state: VeliosPrivateState): string {
  const directory = path.join(repoRoot, ".private-state");
  mkdirSync(directory, { recursive: true });
  const target = path.join(directory, "preview.json");
  writeFileSync(target, `${JSON.stringify(encodePrivateState(state), null, 2)}\n`);
  return target;
}
