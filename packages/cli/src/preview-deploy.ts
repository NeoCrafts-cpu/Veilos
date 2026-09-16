/**
 * Official Preview/Preprod deploy path:
 * Wallet SDK sync → register NIGHT for DUST → MidnightJS deployContract.
 *
 * Sources: midnightntwrk/example-hello-world and
 * https://docs.midnight.network/guides/acquire-tokens
 *
 * Never logs seeds, mnemonics, witnesses, or private state.
 * Does not report success unless the returned status is SucceedEntirely
 * and a contract address is present.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { WebSocket } from "ws";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { unshieldedToken } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import { generateRandomSeed } from "@midnight-ntwrk/wallet-sdk";
import { createEconomyPreviewPrivateState, createVeliosPrivateState } from "@velios/contracts";
import {
  compiledArtifactsPresent,
  compiledEconomyPreviewArtifactsPresent,
  economyPreviewZkConfigPath,
  zkConfigPath,
} from "@velios/contracts/node";
import {
  getNetworkConfig,
  memberIdFromLabel,
  proofServerReachable,
  roleLabelToBytes,
  vendorIdFromRecipient,
  type NetworkConfig,
} from "@velios/midnight";
import { callCircuit, deployOrganization } from "@velios/midnight/client";
import { deployEconomyOrganization } from "@velios/midnight/economy-client";
import { currentAuthorizationWindow, randomBytes32 } from "@velios/policy-engine";
import { MIDNIGHT_SUCCESS_STATUS, hex32ToBytes, type VeliosPrivateState } from "@velios/shared-types";
import {
  formatDust,
  formatNight,
  publicUnshieldedAddress,
  registerNightForDustWithRetry,
  waitForDustReady,
  waitForNightBalance,
  waitForSyncedState,
} from "./dust.js";
import { findRepoRoot } from "./paths.js";
import { writePrivateStateExport } from "./private-state-export.js";
import { buildCliProviders } from "./providers.js";
import { writeGeneratedSeedFile } from "./secure-seed.js";
import { loadEnvFile, resolveWalletSecret } from "./secret.js";
import { MidnightWalletProvider, syncWallet } from "./wallet.js";

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket = WebSocket;

const DEFAULT_ORG_NAME = "ACME AUTONOMOUS SYSTEMS";
const DEFAULT_MEMBER_LABEL = "FOUNDING-MEMBER";
const DEFAULT_AGENT_ROLE = "Treasury Operator";
const DEFAULT_RECIPIENT = "supplier-8271";
const CREDENTIAL_LIFETIME_SECONDS = 30n * 86_400n;
const PREVIEW_FAUCET = "https://faucet.preview.midnight.network";

export type PublicDeployment = {
  network: string;
  contractAddress: string;
  organizationId: string;
  organizationName: string;
  memberId: string;
  deployStatus: string;
  registerMemberStatus: string;
  createdAt: string;
};

export type PublicEconomyDeployment = {
  network: string;
  contractKind: "economy";
  contractAddress: string;
  organizationId: string;
  organizationName: string;
  deployStatus: string;
  deployTxId?: string;
  createdAt: string;
};

function createDeployPrivateState(): VeliosPrivateState {
  const window = currentAuthorizationWindow();
  return createVeliosPrivateState({
    ownerSecret: randomBytes32(),
    memberSecret: randomBytes32(),
    agentSecret: randomBytes32(),
    agentRole: roleLabelToBytes(DEFAULT_AGENT_ROLE),
    roleSalt: randomBytes32(),
    perActionLimit: 25_000n,
    dailyLimit: 25_000n,
    vendorId: vendorIdFromRecipient(DEFAULT_RECIPIENT),
    credentialOk: true,
    credentialExpiry: window.periodEnd + CREDENTIAL_LIFETIME_SECONDS,
    selfModifyAllowed: false,
    policySalt: randomBytes32(),
    spendPeriodStart: window.periodStart,
    dailySpend: 0n,
    spendSalt: randomBytes32(),
    nextSpendSalt: randomBytes32(),
  });
}

function nightBalance(state: unknown): bigint {
  const token = unshieldedToken();
  const record = state as { unshielded?: { balances?: Record<PropertyKey, bigint | undefined> } };
  return record.unshielded?.balances?.[token.raw as PropertyKey] ?? 0n;
}

function dustSnapshot(state: unknown): { available: bigint; coins: number } {
  const dust = (state as { dust: { availableCoins: { length: number }; balance: (now: Date) => bigint } }).dust;
  return { available: dust.balance(new Date()), coins: dust.availableCoins.length };
}

async function ensureEnvironment(config: NetworkConfig, economy: boolean): Promise<void> {
  if (economy) {
    if (!compiledEconomyPreviewArtifactsPresent()) {
      throw new Error("environment missing: run pnpm compile:economy-preview");
    }
  } else if (!compiledArtifactsPresent()) {
    throw new Error("environment missing: run pnpm compile:contracts");
  }
  if (!(await proofServerReachable(config.proofServer, 2500))) {
    throw new Error(
      `environment missing: proof server not reachable at ${config.proofServer}. Start midnightntwrk/proof-server:8.1.0 on port 6300.`,
    );
  }
}

function writePublicDeployment(repoRoot: string, record: PublicDeployment): void {
  writeFileSync(path.join(repoRoot, "deployment.json"), `${JSON.stringify(record, null, 2)}\n`);
}

function writePublicEconomyDeployment(repoRoot: string, record: PublicEconomyDeployment): void {
  writeFileSync(path.join(repoRoot, "deployment.economy.json"), `${JSON.stringify(record, null, 2)}\n`);
}

function writeEconomyPrivateState(repoRoot: string, state: ReturnType<typeof createEconomyPreviewPrivateState>): void {
  const directory = path.join(repoRoot, ".private-state");
  mkdirSync(directory, { recursive: true });
  const encoded = Object.fromEntries(
    Object.entries(state).map(([key, value]) => {
      if (value instanceof Uint8Array) return [key, Buffer.from(value).toString("hex")];
      if (typeof value === "bigint") return [key, value.toString()];
      if (key === "credentialPath") return [key, "omitted"];
      return [key, value];
    }),
  );
  writeFileSync(path.join(directory, "preview-economy.json"), `${JSON.stringify(encoded, null, 2)}\n`);
}

export async function runPreviewDeploy(
  argv = process.argv.slice(2),
): Promise<PublicDeployment | PublicEconomyDeployment | { dustOnly: true }> {
  const major = Number(process.versions.node.split(".")[0]);
  if (!Number.isFinite(major) || major < 22) {
    throw new Error("Node 22 or newer is required for the official Wallet SDK Preview deploy");
  }
  const repoRoot = findRepoRoot();
  loadEnvFile(path.join(repoRoot, ".env"));

  const networkName = argv.includes("--preprod") ? "preprod" : "preview";
  const dustOnly = argv.includes("--dust-only");
  const economy = argv.includes("--economy");
  const config = getNetworkConfig(networkName);
  setNetworkId(config.networkId);

  const { secret, generated } = resolveWalletSecret(process.env, argv, () =>
    toHex(generateRandomSeed()),
  );
  if (generated) {
    const seedPath = writeGeneratedSeedFile(repoRoot, secret.value);
    console.log("Generated a new Preview wallet seed and wrote it with mode 0600.");
    console.log(`Seed file: ${seedPath}`);
    console.log("Set VELIOS_WALLET_SEED from that file. Do not commit it.");
    if (argv.includes("--print-seed")) {
      console.log("Refusing --print-seed. The seed is in the 0600 file only.");
    }
  }

  await ensureEnvironment(config, economy);

  console.log("Aligning wallet clock to official indexer block time...");
  const wallet = await MidnightWalletProvider.build(config, secret);
  await wallet.start();

  try {
    const unshielded = publicUnshieldedAddress(wallet.unshieldedKeystore);
    console.log(`Network: ${config.networkId}`);
    console.log(`Unshielded address (send tNIGHT here): ${unshielded}`);
    console.log(`Faucet: ${config.faucet || PREVIEW_FAUCET}`);
    if (config.networkId === "preview") {
      console.log(`Official Preview faucet: ${PREVIEW_FAUCET}`);
    }

    const syncTimeoutMs = Number(process.env["MIDNIGHT_SYNC_TIMEOUT_MS"] ?? (networkName === "preview" || networkName === "preprod" ? 60 * 60_000 : 10 * 60_000));
    console.log("Syncing wallet with the official indexer...");
    const syncHeartbeat = setInterval(() => {
      console.log("Still syncing with the official indexer...");
    }, 30_000);
    try {
      // Full deploy waits for strictly-complete progress. DUST-only uses the
      // official WalletFacade waitForSyncedState() so a second run can see
      // already-registered NIGHT without another half-hour merkle catch-up.
      if (dustOnly || economy) {
        await Promise.race([
          waitForSyncedState(wallet.wallet),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Wallet sync timeout after ${syncTimeoutMs}ms`)), syncTimeoutMs);
          }),
        ]);
      } else {
        await syncWallet(wallet.wallet, syncTimeoutMs);
      }
    } finally {
      clearInterval(syncHeartbeat);
    }

    const synced = await waitForSyncedState(wallet.wallet);
    let night = nightBalance(synced);
    if (night === 0n) {
      console.log("Waiting for tNIGHT. Fund the unshielded address, then keep this process running.");
      night = await waitForNightBalance(wallet.wallet, nightBalance, Number(process.env["VELIOS_NIGHT_TIMEOUT_MS"] ?? 30 * 60_000));
    }
    console.log(`tNIGHT: ${formatNight(night)}`);

    console.log("Registering NIGHT for DUST generation...");
    const registration = await registerNightForDustWithRetry(wallet.wallet, wallet.unshieldedKeystore, {
      onRetry: (message) => console.log(message),
    });
    if (registration === "already") {
      console.log("NIGHT already registered for DUST, or DUST is already spendable.");
    } else {
      console.log("Registration submitted. Waiting for spendable DUST...");
    }
    // Preview DUST accrues after DustInitialUtxo; 180s is often too short.
    const dustTimeoutMs = Number(
      process.env["VELIOS_DUST_TIMEOUT_MS"] ?? (networkName === "preview" || networkName === "preprod" ? 15 * 60_000 : 180_000),
    );
    const dustHeartbeat = setInterval(() => {
      console.log("Still waiting for spendable DUST after NIGHT registration...");
    }, 30_000);
    try {
      await waitForDustReady(wallet.wallet, dustTimeoutMs);
    } finally {
      clearInterval(dustHeartbeat);
    }
    const dust = dustSnapshot(await waitForSyncedState(wallet.wallet));
    console.log(`DUST: ${formatDust(dust.available)} (${dust.coins} coin(s))`);

    if (dustOnly) {
      return { dustOnly: true };
    }

    const organizationName = process.env["VELIOS_ORG_NAME"]?.trim() || DEFAULT_ORG_NAME;
    if (economy) {
      const providers = buildCliProviders(wallet, economyPreviewZkConfigPath, config, {
        privateStateStoreName: "velios-economy-preview",
      });
      const privateState = createEconomyPreviewPrivateState({ ownerSecret: randomBytes32() });
      const deployed = await deployEconomyOrganization(providers, organizationName, privateState, {
        compiledAssetsPath: economyPreviewZkConfigPath,
        preview: true,
      });
      const record: PublicEconomyDeployment = {
        network: config.networkId,
        contractKind: "economy",
        contractAddress: deployed.contractAddress,
        organizationId: deployed.organizationId,
        organizationName,
        deployStatus: deployed.status,
        ...(deployed.txId ? { deployTxId: deployed.txId } : {}),
        createdAt: new Date().toISOString(),
      };
      writePublicEconomyDeployment(repoRoot, record);
      writeEconomyPrivateState(repoRoot, privateState);
      console.log(`Economy contract address: ${record.contractAddress}`);
      console.log(`Organization id: ${record.organizationId}`);
      console.log(`economy deploy: ${record.deployStatus}`);
      return record;
    }
    const providers = buildCliProviders(wallet, zkConfigPath, config);
    const privateState = createDeployPrivateState();
    const deployed = await deployOrganization(providers, organizationName, privateState, {
      compiledAssetsPath: zkConfigPath,
    });

    const memberId = memberIdFromLabel(DEFAULT_MEMBER_LABEL);
    const registrationTx = await callCircuit(
      providers,
      deployed.contractAddress,
      "registerMember",
      [hex32ToBytes(memberId)],
      { compiledAssetsPath: zkConfigPath },
    );
    if (registrationTx.status !== MIDNIGHT_SUCCESS_STATUS) {
      throw new Error("registerMember failed");
    }

    const record: PublicDeployment = {
      network: config.networkId,
      contractAddress: deployed.contractAddress,
      organizationId: deployed.organizationId,
      organizationName,
      memberId,
      deployStatus: MIDNIGHT_SUCCESS_STATUS,
      registerMemberStatus: registrationTx.status,
      createdAt: new Date().toISOString(),
    };
    writePublicDeployment(repoRoot, record);
    writePrivateStateExport(repoRoot, privateState);
    console.log(`Contract address: ${record.contractAddress}`);
    console.log(`Organization id: ${record.organizationId}`);
    console.log(`registerMember: ${record.registerMemberStatus}`);
    return record;
  } finally {
    await wallet.stop().catch(() => undefined);
  }
}

function isMain(): boolean {
  const entry = process.argv[1] ?? "";
  return entry.includes("preview-deploy");
}

if (isMain()) {
  runPreviewDeploy().catch((error) => {
    const message = error instanceof Error ? error.message : "deploy failed";
    console.error(message);
    process.exitCode = 1;
  });
}
