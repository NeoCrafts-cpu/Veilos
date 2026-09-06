import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compactSourcePath, compiledArtifactsPresent } from "./node-artifacts.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);

function compactAvailable(): boolean {
  try {
    execFileSync("compact", ["--help"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

describe("X4 Compact compile", () => {
  it("ships the Wave 1 Compact source", () => {
    expect(existsSync(compactSourcePath)).toBe(true);
  });

  // Must stay async: the compile takes ~3 minutes, and a synchronous child
  // process would block the vitest worker's event loop long enough for its
  // reporter RPC heartbeat to time out and fail the run despite passing tests.
  it("compiles with Midnight Compact when the compiler is installed", async () => {
    if (!compactAvailable()) {
      console.warn("ENVIRONMENT MISSING: Midnight Compact compiler is not on PATH. Skipping compile.");
      return;
    }
    const { stdout } = await execFileAsync("bash", [path.join(root, "scripts", "compile.sh")], {
      maxBuffer: 32 * 1024 * 1024,
    });
    expect(stdout).toContain("Compiled artifacts written to");
    expect(compiledArtifactsPresent()).toBe(true);
  }, 600_000);
});
