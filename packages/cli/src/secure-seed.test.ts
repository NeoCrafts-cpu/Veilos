import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { writeGeneratedSeedFile } from "./secure-seed.js";

describe("secure seed export", () => {
  it("writes the seed with restrictive permissions and does not print it", () => {
    const root = mkdtempSync(path.join(tmpdir(), "velios-seed-"));
    const file = writeGeneratedSeedFile(root, "ab".repeat(32));
    expect(readFileSync(file, "utf8").trim()).toBe("ab".repeat(32));
    expect(statSync(file).mode & 0o777).toBe(0o600);
  });
});
