/**
 * Create a Preview hex seed and unshielded address without starting sync.
 * Writes VELIOS_WALLET_SEED to local .env only. Does not print the seed.
 */

import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { WebSocket } from "ws";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import { generateRandomSeed } from "@midnight-ntwrk/wallet-sdk";
import { PREVIEW_CONFIG } from "@velios/midnight";
import { publicUnshieldedAddress } from "./dust.js";
import { findRepoRoot } from "./paths.js";
import { loadEnvFile } from "./secret.js";
import { MidnightWalletProvider } from "./wallet.js";

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket = WebSocket;

export async function preparePreviewWallet(): Promise<{ address: string; created: boolean }> {
  const repoRoot = findRepoRoot();
  const envPath = path.join(repoRoot, ".env");
  loadEnvFile(envPath);

  let created = false;
  let seed = process.env["VELIOS_WALLET_SEED"]?.trim();
  if (!seed) {
    seed = toHex(generateRandomSeed());
    appendFileSync(envPath, `\nVELIOS_WALLET_SEED=${seed}\n`);
    process.env["VELIOS_WALLET_SEED"] = seed;
    created = true;
  }

  setNetworkId("preview");
  const wallet = await MidnightWalletProvider.build(PREVIEW_CONFIG, { kind: "seed", value: seed });
  try {
    return { address: publicUnshieldedAddress(wallet.unshieldedKeystore), created };
  } finally {
    await wallet.stop().catch(() => undefined);
  }
}

if ((process.argv[1] ?? "").includes("prepare-wallet")) {
  preparePreviewWallet()
    .then(({ address, created }) => {
      console.log(created ? "Created Preview wallet seed in local .env" : "Reusing VELIOS_WALLET_SEED from local .env");
      console.log(`Unshielded address: ${address}`);
      console.log("Faucet: https://faucet.preview.midnight.network");
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : "prepare wallet failed");
      process.exitCode = 1;
    });
}
