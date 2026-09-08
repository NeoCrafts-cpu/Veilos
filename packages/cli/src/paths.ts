import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function findRepoRoot(startDir = path.dirname(fileURLToPath(import.meta.url))): string {
  let current = startDir;
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error("environment missing: repository root");
}
