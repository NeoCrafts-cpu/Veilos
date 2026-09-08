/**
 * Resolve a Node wallet secret from the local environment.
 * Never log the seed, mnemonic, or derived keys.
 */

import { existsSync, readFileSync } from "node:fs";

export type WalletSecret = { kind: "seed"; value: string } | { kind: "mnemonic"; value: string };

const HEX_SEED = /^[0-9a-fA-F]+$/;

export function parseHexSeed(value: string): string {
  const seed = value.trim().replace(/^0x/i, "");
  if (!HEX_SEED.test(seed) || seed.length % 2 !== 0 || seed.length < 64) {
    throw new Error("VELIOS_WALLET_SEED must be a hex string of even length (at least 32 bytes)");
  }
  return seed.toLowerCase();
}

export function parseMnemonic(value: string): string {
  const mnemonic = value.trim().replace(/\s+/g, " ");
  const words = mnemonic.split(" ");
  if (words.length !== 12 && words.length !== 24) {
    throw new Error("VELIOS_WALLET_MNEMONIC must be 12 or 24 words");
  }
  if (words.some((word) => !/^[a-z]+$/.test(word))) {
    throw new Error("VELIOS_WALLET_MNEMONIC must be lowercase BIP39 words");
  }
  return mnemonic;
}

export function resolveWalletSecret(
  env: NodeJS.ProcessEnv,
  argv: readonly string[],
  generateSeed: () => string,
): { secret: WalletSecret; generated: boolean } {
  const fresh = argv.includes("--fresh");
  const useMnemonic = argv.includes("--use-mnemonic");
  const useSeed = argv.includes("--use-seed");
  const seedRaw = env["VELIOS_WALLET_SEED"]?.trim();
  const mnemonicRaw = env["VELIOS_WALLET_MNEMONIC"]?.trim();

  if (fresh && (seedRaw || mnemonicRaw)) {
    throw new Error("Do not pass --fresh when a wallet secret is already set");
  }
  if (useMnemonic && useSeed) {
    throw new Error("Pass only one of --use-mnemonic or --use-seed");
  }
  if (useMnemonic) {
    if (!mnemonicRaw) {
      throw new Error("VELIOS_WALLET_MNEMONIC is required with --use-mnemonic");
    }
    return { secret: { kind: "mnemonic", value: parseMnemonic(mnemonicRaw) }, generated: false };
  }
  if (useSeed) {
    if (!seedRaw) {
      throw new Error("VELIOS_WALLET_SEED is required with --use-seed");
    }
    return { secret: { kind: "seed", value: parseHexSeed(seedRaw) }, generated: false };
  }
  if (seedRaw && mnemonicRaw) {
    throw new Error("Set only one of VELIOS_WALLET_SEED or VELIOS_WALLET_MNEMONIC, or pass --use-mnemonic");
  }
  if (fresh) {
    return { secret: { kind: "seed", value: parseHexSeed(generateSeed()) }, generated: true };
  }
  if (seedRaw) {
    return { secret: { kind: "seed", value: parseHexSeed(seedRaw) }, generated: false };
  }
  if (mnemonicRaw) {
    return { secret: { kind: "mnemonic", value: parseMnemonic(mnemonicRaw) }, generated: false };
  }
  throw new Error("Set VELIOS_WALLET_SEED, VELIOS_WALLET_MNEMONIC, or pass --fresh");
}

export function loadEnvFile(filePath: string, env: NodeJS.ProcessEnv = process.env): void {
  if (!existsSync(filePath)) return;
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
}
