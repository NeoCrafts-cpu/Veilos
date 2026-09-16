/**
 * Read the official Level private-state store from the Preview deploy
 * and write a gitignored export for the local browser join path.
 * Does not print the payload.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { PRIVATE_STATE_ID, getNetworkConfig } from "@velios/midnight";
import { decodePrivateState } from "@velios/midnight";
import { PREVIEW_DEPLOYMENT } from "@velios/midnight";
import { zkConfigPath } from "@velios/contracts/node";
import { findRepoRoot } from "./paths.js";
import { writePrivateStateExport } from "./private-state-export.js";
import { buildCliProviders } from "./providers.js";
import { loadEnvFile, resolveWalletSecret } from "./secret.js";
import { MidnightWalletProvider } from "./wallet.js";

async function main(): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnvFile(path.join(repoRoot, ".env"));
  const config = getNetworkConfig("preview");
  setNetworkId(config.networkId);
  const { secret } = resolveWalletSecret(process.env, [], () => {
    throw new Error("VELIOS_WALLET_SEED is required to open the Level store");
  });
  const wallet = await MidnightWalletProvider.build(config, secret);
  const providers = buildCliProviders(wallet, zkConfigPath, config);
  const deployPath = path.join(repoRoot, "deployment.json");
  const contractAddress = existsSync(deployPath)
    ? (JSON.parse(readFileSync(deployPath, "utf8")) as { contractAddress?: string }).contractAddress
    : PREVIEW_DEPLOYMENT.contractAddress;
  if (!contractAddress) {
    throw new Error("deployment.json is missing a contract address");
  }
  providers.privateStateProvider.setContractAddress(contractAddress);
  const stored = await providers.privateStateProvider.get(PRIVATE_STATE_ID);
  if (!stored) {
    throw new Error("private state missing from the official Level store");
  }
  const state =
    stored && typeof stored === "object" && "ownerSecret" in stored
      ? (stored as Parameters<typeof writePrivateStateExport>[1])
      : decodePrivateState(stored);
  writePrivateStateExport(repoRoot, state);
  console.log("Operator private state exported to gitignored .private-state/preview.json");
}

if (process.argv[1]?.includes("export-private-state")) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : "export failed";
    console.error(message);
    process.exitCode = 1;
  });
}
