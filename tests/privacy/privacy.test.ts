import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publicSlice } from "../../apps/web/src/state/session.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const forbiddenLogs = [
  "console.log(privateState",
  "console.log(ownerSecret",
  "console.log(perActionLimit",
];
const forbiddenGlobalPersist = ["localStorage.setItem", "sessionStorage.setItem"];
const persistAllowlist = [
  path.join(root, "apps/web/src/lib/operator-state.ts"),
  path.join(root, "apps/web/src/lib/operator-vault.ts"),
  path.join(root, "apps/web/src/lib/workspace.ts"),
  path.join(root, "apps/web/src/lib/wave2-contracts.ts"),
  path.join(root, "apps/web/src/lib/wave2-vault.ts"),
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "managed") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("privacy regressions", () => {
  it("P1/P5 production sources do not log secrets or persist plaintext policy", () => {
    const files = [
      ...walk(path.join(root, "apps/web/src")),
      ...walk(path.join(root, "packages/midnight/src")),
      ...walk(path.join(root, "packages/contracts/src")),
    ].filter((file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"));
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of forbiddenLogs) {
        expect(text.includes(needle), `${file} contains ${needle}`).toBe(false);
      }
      if (!persistAllowlist.includes(file)) {
        for (const needle of forbiddenGlobalPersist) {
          expect(text.includes(needle), `${file} contains ${needle}`).toBe(false);
        }
      } else {
        expect(text).toMatch(/Never log the (payload|passphrase)|Never store private state/);
        expect(text).not.toMatch(/console\.(log|info|debug|warn)/);
        if (file.endsWith("operator-vault.ts")) {
          expect(text).toMatch(/Ciphertext may be stored/);
          expect(text).not.toMatch(/perActionLimit/);
        }
      }
    }
  });

  it("P3/P4 public store and routes carry only public ids", () => {
    const slice = publicSlice({
      organizationName: "ACME AUTONOMOUS SYSTEMS",
      organization: null,
      members: [],
      agents: [],
      actions: [],
      ledgerSync: "none",
    });
    expect(JSON.stringify(slice)).not.toMatch(/4800|25000|ownerSecret|reason/);
  });

  it("P6 Wave 1 ships no analytics package", () => {
    const webPkg = JSON.parse(readFileSync(path.join(root, "apps/web/package.json"), "utf8"));
    const deps = { ...webPkg.dependencies, ...webPkg.devDependencies };
    expect(Object.keys(deps).join(",")).not.toMatch(/segment|mixpanel|amplitude|gtag|analytics/i);
  });
});
