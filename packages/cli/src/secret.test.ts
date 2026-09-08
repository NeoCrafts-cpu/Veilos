import { describe, expect, it } from "vitest";
import { loadEnvFile, parseHexSeed, parseMnemonic, resolveWalletSecret } from "./secret.js";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const TEST_SEED = "11".repeat(32);

describe("wallet secret parsing", () => {
  it("accepts a 32-byte hex seed and rejects short or odd-length values", () => {
    expect(parseHexSeed(`0x${TEST_SEED.toUpperCase()}`)).toBe(TEST_SEED);
    expect(() => parseHexSeed("abc")).toThrow(/hex string/);
    expect(() => parseHexSeed("11".repeat(16))).toThrow(/hex string/);
  });

  it("accepts 12 or 24 lowercase words and never echoes them in the error", () => {
    const words = Array.from({ length: 24 }, () => "abandon").join(" ");
    expect(parseMnemonic(`  ${words}  `)).toBe(words);
    expect(() => parseMnemonic("too short")).toThrow(/12 or 24/);
    try {
      parseMnemonic("Abandon ".repeat(24));
    } catch (error) {
      expect(error instanceof Error ? error.message : "").not.toMatch(/Abandon/);
    }
  });

  it("requires exactly one secret source", () => {
    expect(() => resolveWalletSecret({}, [], () => TEST_SEED)).toThrow(/VELIOS_WALLET_SEED/);
    expect(() =>
      resolveWalletSecret({ VELIOS_WALLET_SEED: TEST_SEED, VELIOS_WALLET_MNEMONIC: "abandon ".repeat(12).trim() }, [], () => TEST_SEED),
    ).toThrow(/only one/);
    expect(() =>
      resolveWalletSecret({ VELIOS_WALLET_SEED: TEST_SEED }, ["--fresh"], () => TEST_SEED),
    ).toThrow(/--fresh/);

    const mnemonic = "abandon ".repeat(12).trim();
    const fromMnemonicFlag = resolveWalletSecret(
      { VELIOS_WALLET_SEED: TEST_SEED, VELIOS_WALLET_MNEMONIC: mnemonic },
      ["--use-mnemonic"],
      () => TEST_SEED,
    );
    expect(fromMnemonicFlag).toEqual({ secret: { kind: "mnemonic", value: mnemonic }, generated: false });

    const restored = resolveWalletSecret({ VELIOS_WALLET_SEED: TEST_SEED }, [], () => "22".repeat(32));
    expect(restored).toEqual({ secret: { kind: "seed", value: TEST_SEED }, generated: false });

    const generated = resolveWalletSecret({}, ["--fresh"], () => TEST_SEED);
    expect(generated.generated).toBe(true);
    expect(generated.secret).toEqual({ kind: "seed", value: TEST_SEED });
  });

  it("loads .env without overriding existing values", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "velios-env-"));
    const file = path.join(dir, ".env");
    writeFileSync(file, "VELIOS_NETWORK=preview\nVELIOS_WALLET_SEED=should-not-win\n");
    const env: NodeJS.ProcessEnv = { VELIOS_WALLET_SEED: "already-set" };
    loadEnvFile(file, env);
    expect(env.VELIOS_NETWORK).toBe("preview");
    expect(env.VELIOS_WALLET_SEED).toBe("already-set");
  });
});
