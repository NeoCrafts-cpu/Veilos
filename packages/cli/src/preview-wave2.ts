/**
 * Official Preview Wave 2 circuits. MidnightJS deployContract / submitCallTx.
 * Never logs seeds, owner secrets, or witnesses. Success requires
 * SucceedEntirely plus exact indexer read-back (depositNight is
 * SucceedEntirely only — Compact has no unique deposit row).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { WebSocket } from "ws";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { unshieldedToken } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import { generateRandomSeed } from "@midnight-ntwrk/wallet-sdk";
import {
  createAuditorPreviewPrivateState,
  createEconomyPreviewPrivateState,
  createGovernancePreviewPrivateState,
  createProcurementPreviewPrivateState,
} from "@velios/contracts";
import {
  compiledAuditorPreviewArtifactsPresent,
  compiledEconomyPreviewArtifactsPresent,
  compiledGovernancePreviewArtifactsPresent,
  compiledProcurementPreviewArtifactsPresent,
  auditorPreviewZkConfigPath,
  economyPreviewZkConfigPath,
  governancePreviewZkConfigPath,
  procurementPreviewZkConfigPath,
} from "@velios/contracts/node";
import { credentialCommitment, holderCommitment, revocationNullifier } from "@velios/credentials";
import { addressCommitment, bidCommitment, disclosureScopeCommitment, voteNullifier } from "@velios/economy";
import {
  agentIdFromLabel,
  compactUserAddress,
  fetchIndexerNowSeconds,
  getNetworkConfig,
  newActionId,
  organizationIdFromName,
  parseUserAddressBytes,
  proofServerReachable,
  resolveIndexerHttpUrl,
} from "@velios/midnight";
import {
  callAuditorCircuit,
  callGovernanceCircuit,
  callProcurementCircuit,
  confirmCompanionField,
  deployAuditorOrganization,
  deployGovernanceOrganization,
  deployProcurementOrganization,
  readAuditorLedger,
  readGovernanceLedger,
  readProcurementLedger,
  writeAuditorPrivateState,
  writeGovernancePrivateState,
  writeProcurementPrivateState,
} from "@velios/midnight/companion-client";
import {
  callEconomyCircuit,
  confirmEconomyField,
  confirmEconomySettlement,
  deployEconomyOrganization,
  readEconomyLedger,
  writeEconomyPrivateState,
} from "@velios/midnight/economy-client";
import { currentAuthorizationWindow, randomBytes32, reasonDigest } from "@velios/policy-engine";
import {
  CREDENTIAL_CLASS_ID,
  MIDNIGHT_SUCCESS_STATUS,
  asHex32,
  bytesToHex32,
  hex32ToBytes,
} from "@velios/shared-types";
import {
  formatDust,
  formatNight,
  publicUnshieldedAddress,
  registerNightForDustWithRetry,
  readCurrentWalletState,
  waitForDustReady,
  waitForNightBalance,
  waitForSpendableFunds,
  waitForSyncedState,
} from "./dust.js";
import { findRepoRoot } from "./paths.js";
import { buildCliProviders } from "./providers.js";
import { resolvePrivateStorePassword } from "./private-store-password.js";
import { loadEnvFile, resolveWalletSecret } from "./secret.js";
import { writeGeneratedSeedFile } from "./secure-seed.js";
import { MidnightWalletProvider } from "./wallet.js";

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket = WebSocket;

const ORG_NAME = "ACME AUTONOMOUS SYSTEMS";
const CONFIRM_MS = 180_000;
const POLL_MS = 3_000;

export type PublicWave2Evidence = {
  network: string;
  createdAt: string;
  economy?: { contractAddress: string; organizationId: string; deployTxId?: string };
  governance?: { contractAddress: string; organizationId: string; deployTxId?: string };
  procurement?: { contractAddress: string; organizationId: string; deployTxId?: string };
  auditor?: { contractAddress: string; organizationId: string; deployTxId?: string };
  circuits: Array<{
    contract: string;
    circuit: string;
    status: string;
    txId?: string;
    publicId?: string;
    confirmed: boolean;
  }>;
};

function nightBalance(state: unknown): bigint {
  const token = unshieldedToken();
  const record = state as { unshielded?: { balances?: Record<PropertyKey, bigint | undefined> } };
  return record.unshielded?.balances?.[token.raw as PropertyKey] ?? 0n;
}

function dustSnapshot(state: unknown): { available: bigint; coins: number } {
  const dust = (state as { dust: { availableCoins: { length: number }; balance: (now: Date) => bigint } }).dust;
  return { available: dust.balance(new Date()), coins: dust.availableCoins.length };
}

function requireHex32(value: unknown, label: string): Uint8Array {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error(`invalid private-state field: ${label}`);
  }
  return hex32ToBytes(asHex32(value));
}

function writePublicEvidence(repoRoot: string, evidence: PublicWave2Evidence): void {
  writeFileSync(path.join(repoRoot, "deployment.wave2.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

function writePrivateWave2(repoRoot: string, payload: Record<string, string>): void {
  const directory = path.join(repoRoot, ".private-state");
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "preview-wave2.json"), `${JSON.stringify(payload, null, 2)}\n`);
}

function recordCircuit(
  evidence: PublicWave2Evidence,
  row: PublicWave2Evidence["circuits"][number],
): void {
  evidence.circuits.push(row);
}

async function waitUntilLedgerSeconds(indexerHttp: string, target: bigint, timeoutMs = 240_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() <= deadline) {
    const now = await fetchIndexerNowSeconds(indexerHttp);
    if (now > target) return;
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  throw new Error("ledger clock did not pass the companion window");
}

export async function runPreviewWave2(argv = process.argv.slice(2)): Promise<PublicWave2Evidence> {
  const repoRoot = findRepoRoot();
  loadEnvFile(path.join(repoRoot, ".env"));
  resolvePrivateStorePassword(process.env, "preview-wave2");
  const config = getNetworkConfig(argv.includes("--preprod") ? "preprod" : "preview");
  setNetworkId(config.networkId);
  if (!compiledEconomyPreviewArtifactsPresent() || !compiledGovernancePreviewArtifactsPresent()) {
    throw new Error("environment missing: compile economy-preview and companion artifacts");
  }
  if (!compiledProcurementPreviewArtifactsPresent() || !compiledAuditorPreviewArtifactsPresent()) {
    throw new Error("environment missing: compile procurement-preview and auditor-preview artifacts");
  }
  if (!(await proofServerReachable(config.proofServer, 2500))) {
    throw new Error("environment missing: proof server not reachable at port 6300");
  }

  const deployOnly = argv.includes("--deploy-only");
  const { secret, generated } = resolveWalletSecret(process.env, argv, () => toHex(generateRandomSeed()));
  if (generated) {
    const seedPath = writeGeneratedSeedFile(repoRoot, secret.value);
    console.log("Generated a new Preview wallet seed and wrote it with mode 0600.");
    console.log(`Seed file: ${seedPath}`);
  }

  const wallet = await MidnightWalletProvider.build(config, secret);
  await wallet.start();
  const evidence: PublicWave2Evidence = {
    network: config.networkId,
    createdAt: new Date().toISOString(),
    circuits: [],
  };
  const secrets: Record<string, string> = {};

  try {
    const syncTimeoutMs = Number(
      process.env["MIDNIGHT_SYNC_TIMEOUT_MS"] ?? (deployOnly ? 3 * 60 * 60_000 : 20 * 60_000),
    );
    console.log("Syncing wallet with the official indexer...");
    const heartbeat = setInterval(() => console.log("Still syncing with the official indexer..."), 30_000);
    let synced: unknown;
    try {
      synced = await Promise.race([
        waitForSpendableFunds(wallet.wallet, nightBalance, syncTimeoutMs),
        waitForSyncedState(wallet.wallet),
      ]);
    } catch (error) {
      synced = await readCurrentWalletState(wallet.wallet);
      const dust = dustSnapshot(synced);
      if (dust.available <= 0n) {
        throw error;
      }
      console.log("Strict wallet sync timed out; continuing because this wallet already holds spendable funds.");
    } finally {
      clearInterval(heartbeat);
    }
    let night = nightBalance(synced);
    if (night === 0n) {
      night = await waitForNightBalance(wallet.wallet, nightBalance, Number(process.env["VELIOS_NIGHT_TIMEOUT_MS"] ?? 30 * 60_000));
    }
    console.log(`tNIGHT: ${formatNight(night)}`);
    const peekDust = dustSnapshot(synced);
    if (peekDust.available > 0n) {
      console.log(`DUST already spendable: ${formatDust(peekDust.available)} (${peekDust.coins} coin(s))`);
    } else if (night > 0n) {
      console.log("tNIGHT is present. Waiting for spendable DUST without a full merkle catch-up...");
    } else {
    const registration = await registerNightForDustWithRetry(wallet.wallet, wallet.unshieldedKeystore, {
      onRetry: (message) => console.log(message),
    });
    if (registration === "already") {
      console.log("NIGHT already registered for DUST, or DUST is already spendable.");
    }
    }
    const alreadyDust = dustSnapshot(await readCurrentWalletState(wallet.wallet));
    if (alreadyDust.available <= 0n) {
      await waitForDustReady(wallet.wallet, Number(process.env["VELIOS_DUST_TIMEOUT_MS"] ?? 15 * 60_000));
    }
    const dust = dustSnapshot(await readCurrentWalletState(wallet.wallet));
    console.log(`DUST: ${formatDust(dust.available)} (${dust.coins} coin(s))`);
    if (dust.available <= 0n) throw new Error("Wallet has no spendable DUST yet.");

    const unshielded = publicUnshieldedAddress(wallet.unshieldedKeystore);
    const recipientBytes = parseUserAddressBytes(unshielded, config.networkId);
    const vendor = addressCommitment(recipientBytes);
    const orgId = organizationIdFromName(ORG_NAME);
    const indexerHttp = resolveIndexerHttpUrl(config);

    const economyProviders = buildCliProviders(wallet, economyPreviewZkConfigPath, config, {
      privateStateStoreName: "velios-economy-preview",
    });
    const economyPath = path.join(repoRoot, "deployment.economy.json");
    const economyStatePath = path.join(repoRoot, ".private-state", "preview-economy.json");
    let economyAddress: string;
    let economyOwner: Uint8Array;
    if (existsSync(economyPath) && existsSync(economyStatePath)) {
      const record = JSON.parse(readFileSync(economyPath, "utf8")) as { contractAddress: string };
      const encoded = JSON.parse(readFileSync(economyStatePath, "utf8")) as { ownerSecret?: string };
      economyAddress = record.contractAddress;
      economyOwner = requireHex32(encoded.ownerSecret, "economyOwner");
      console.log(`Reusing economy-preview: ${economyAddress}`);
      evidence.economy = { contractAddress: economyAddress, organizationId: orgId };
    } else {
      economyOwner = randomBytes32();
      const privateState = createEconomyPreviewPrivateState({ ownerSecret: economyOwner });
      const deployed = await deployEconomyOrganization(economyProviders, ORG_NAME, privateState, {
        compiledAssetsPath: economyPreviewZkConfigPath,
        preview: true,
      });
      if (deployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("economy deploy failed");
      await writeEconomyPrivateState(economyProviders, deployed.contractAddress, privateState);
      economyAddress = deployed.contractAddress;
      evidence.economy = {
        contractAddress: deployed.contractAddress,
        organizationId: deployed.organizationId,
        deployTxId: deployed.txId,
      };
      console.log(`economy deploy: ${deployed.status}`);
      console.log(`Economy contract address: ${deployed.contractAddress}`);
    }
    secrets.economyOwnerSecret = bytesToHex32(economyOwner);
    writePrivateWave2(repoRoot, secrets);
    writePublicEvidence(repoRoot, evidence);

    if (deployOnly) {
      const govProviders = buildCliProviders(wallet, governancePreviewZkConfigPath, config, {
        privateStateStoreName: "velios-governance-preview",
      });
      const govOwner = randomBytes32();
      const govState = createGovernancePreviewPrivateState({ ownerSecret: govOwner });
      const govDeployed = await deployGovernanceOrganization(govProviders, ORG_NAME, govState, {
        compiledAssetsPath: governancePreviewZkConfigPath,
      });
      if (govDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("governance deploy failed");
      await writeGovernancePrivateState(govProviders, govDeployed.contractAddress, govState);
      evidence.governance = {
        contractAddress: govDeployed.contractAddress,
        organizationId: govDeployed.organizationId,
        deployTxId: govDeployed.txId,
      };
      secrets.governanceOwnerSecret = bytesToHex32(govOwner);
      writePrivateWave2(repoRoot, secrets);
      writePublicEvidence(repoRoot, evidence);
      console.log(`governance deploy: ${govDeployed.status}`);
      console.log(`Governance contract address: ${govDeployed.contractAddress}`);

      const procProviders = buildCliProviders(wallet, procurementPreviewZkConfigPath, config, {
        privateStateStoreName: "velios-procurement-preview",
      });
      const procOwner = randomBytes32();
      const procState = createProcurementPreviewPrivateState({ ownerSecret: procOwner });
      const procDeployed = await deployProcurementOrganization(procProviders, ORG_NAME, procState, {
        compiledAssetsPath: procurementPreviewZkConfigPath,
      });
      if (procDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("procurement deploy failed");
      await writeProcurementPrivateState(procProviders, procDeployed.contractAddress, procState);
      evidence.procurement = {
        contractAddress: procDeployed.contractAddress,
        organizationId: procDeployed.organizationId,
        deployTxId: procDeployed.txId,
      };
      secrets.procurementOwnerSecret = bytesToHex32(procOwner);
      writePrivateWave2(repoRoot, secrets);
      writePublicEvidence(repoRoot, evidence);
      console.log(`procurement deploy: ${procDeployed.status}`);
      console.log(`Procurement contract address: ${procDeployed.contractAddress}`);

      const auditorProviders = buildCliProviders(wallet, auditorPreviewZkConfigPath, config, {
        privateStateStoreName: "velios-auditor-preview",
      });
      const auditorOwner = randomBytes32();
      const auditorState = createAuditorPreviewPrivateState({ ownerSecret: auditorOwner });
      const auditorDeployed = await deployAuditorOrganization(auditorProviders, ORG_NAME, auditorState, {
        compiledAssetsPath: auditorPreviewZkConfigPath,
      });
      if (auditorDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("auditor deploy failed");
      await writeAuditorPrivateState(auditorProviders, auditorDeployed.contractAddress, auditorState);
      evidence.auditor = {
        contractAddress: auditorDeployed.contractAddress,
        organizationId: auditorDeployed.organizationId,
        deployTxId: auditorDeployed.txId,
      };
      secrets.auditorOwnerSecret = bytesToHex32(auditorOwner);
      writePrivateWave2(repoRoot, secrets);
      writePublicEvidence(repoRoot, evidence);
      console.log(`auditor deploy: ${auditorDeployed.status}`);
      console.log(`Auditor contract address: ${auditorDeployed.contractAddress}`);
      return evidence;
    }

    const confirmEconomy = async (
      circuit: string,
      submitted: { status: string; txId: string; submitted: boolean },
      present: (view: Awaited<ReturnType<typeof readEconomyLedger>>) => boolean,
      publicId?: string,
    ) => {
      if (!submitted.submitted || submitted.status !== MIDNIGHT_SUCCESS_STATUS) {
        throw new Error(`${circuit} failed`);
      }
      const confirmed = await confirmEconomyField({
        status: submitted.status,
        txId: submitted.txId,
        contractAddress: economyAddress,
        readLedger: () => readEconomyLedger(economyProviders, economyAddress),
        present,
        timeoutMs: CONFIRM_MS,
        pollMs: POLL_MS,
      });
      recordCircuit(evidence, {
        contract: economyAddress,
        circuit,
        status: submitted.status,
        txId: submitted.txId,
        ...(publicId ? { publicId } : {}),
        confirmed: confirmed.kind === "confirmed",
      });
      writePublicEvidence(repoRoot, evidence);
      if (confirmed.kind !== "confirmed") throw new Error(`${circuit} indexer read-back stale`);
      console.log(`${circuit}: ${submitted.status}`);
      if (submitted.txId) console.log(`tx: ${submitted.txId}`);
    };

    const window = currentAuthorizationWindow();
    const expiry = window.periodEnd + 30n * 86_400n;
    const holderSecret = randomBytes32();
    const salt = randomBytes32();
    const revocationSecret = randomBytes32();
    const treasuryCommitment = credentialCommitment({
      holderSecret,
      organizationId: hex32ToBytes(orgId),
      className: "treasury",
      expiry,
      salt,
      vendorId: vendor,
      perActionLimit: 25_000n,
      dailyLimit: 25_000n,
    });
    await writeEconomyPrivateState(
      economyProviders,
      economyAddress,
      createEconomyPreviewPrivateState({
        ownerSecret: economyOwner,
        holderSecret,
        credentialClass: CREDENTIAL_CLASS_ID.treasury,
        credentialExpiry: expiry,
        credentialSalt: salt,
        revocationSecret,
        vendorId: vendor,
        perActionLimit: 25_000n,
        dailyLimit: 25_000n,
      }),
    );
    const issued = await callEconomyCircuit(economyProviders, economyAddress, "issueCredential", [treasuryCommitment], {
      compiledAssetsPath: economyPreviewZkConfigPath,
      preview: true,
    });
    await confirmEconomy(
      "issueCredential",
      issued,
      (view) => view.credentialCommitments.includes(bytesToHex32(treasuryCommitment)),
      bytesToHex32(treasuryCommitment),
    );
    secrets.treasuryCommitment = bytesToHex32(treasuryCommitment);
    secrets.treasuryHolderSecret = bytesToHex32(holderSecret);
    secrets.treasurySalt = bytesToHex32(salt);
    secrets.treasuryRevocationSecret = bytesToHex32(revocationSecret);
    writePrivateWave2(repoRoot, secrets);

    const revokeHolder = randomBytes32();
    const revokeSalt = randomBytes32();
    const revokeSecret = randomBytes32();
    const revokeCommitment = credentialCommitment({
      holderSecret: revokeHolder,
      organizationId: hex32ToBytes(orgId),
      className: "agent",
      expiry,
      salt: revokeSalt,
    });
    await writeEconomyPrivateState(
      economyProviders,
      economyAddress,
      createEconomyPreviewPrivateState({
        ownerSecret: economyOwner,
        holderSecret: revokeHolder,
        credentialClass: CREDENTIAL_CLASS_ID.agent,
        credentialExpiry: expiry,
        credentialSalt: revokeSalt,
        revocationSecret: revokeSecret,
      }),
    );
    const issuedRevoke = await callEconomyCircuit(economyProviders, economyAddress, "issueCredential", [revokeCommitment], {
      compiledAssetsPath: economyPreviewZkConfigPath,
      preview: true,
    });
    await confirmEconomy(
      "issueCredential",
      issuedRevoke,
      (view) => view.credentialCommitments.includes(bytesToHex32(revokeCommitment)),
      bytesToHex32(revokeCommitment),
    );
    const nullifier = revocationNullifier(revokeCommitment);
    await writeEconomyPrivateState(
      economyProviders,
      economyAddress,
      createEconomyPreviewPrivateState({
        ownerSecret: economyOwner,
        holderSecret: revokeHolder,
        credentialSalt: revokeSalt,
        revocationSecret: revokeSecret,
      }),
    );
    const revoked = await callEconomyCircuit(economyProviders, economyAddress, "revokeCredential", [nullifier], {
      compiledAssetsPath: economyPreviewZkConfigPath,
      preview: true,
    });
    await confirmEconomy(
      "revokeCredential",
      revoked,
      (view) => view.revokedNullifiers.includes(bytesToHex32(nullifier)),
      bytesToHex32(nullifier),
    );

    await writeEconomyPrivateState(economyProviders, economyAddress, createEconomyPreviewPrivateState({ ownerSecret: economyOwner }));
    const deposited = await callEconomyCircuit(economyProviders, economyAddress, "depositNight", [10n], {
      compiledAssetsPath: economyPreviewZkConfigPath,
      preview: true,
    });
    if (!deposited.submitted || deposited.status !== MIDNIGHT_SUCCESS_STATUS) {
      throw new Error("depositNight failed");
    }
    recordCircuit(evidence, {
      contract: economyAddress,
      circuit: "depositNight",
      status: deposited.status,
      txId: deposited.txId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`depositNight: ${deposited.status}`);
    if (deposited.txId) console.log(`tx: ${deposited.txId}`);

    const actionId = newActionId();
    const agentId = agentIdFromLabel("TREASURY-01");
    const intentSalt = randomBytes32();
    const nextSpendSalt = randomBytes32();
    const reason = reasonDigest("preview-wave2-authorize");
    const authWindow = currentAuthorizationWindow();
    await writeEconomyPrivateState(
      economyProviders,
      economyAddress,
      createEconomyPreviewPrivateState({
        ownerSecret: economyOwner,
        holderSecret,
        credentialClass: CREDENTIAL_CLASS_ID.treasury,
        credentialExpiry: expiry,
        credentialSalt: salt,
        revocationSecret,
        intentSalt,
        reasonDigest: reason,
        vendorId: vendor,
        perActionLimit: 25_000n,
        dailyLimit: 25_000n,
        spendPeriodStart: 0n,
        spendDaily: 0n,
        spendSalt: new Uint8Array(32),
        nextSpendSalt,
      }),
    );
    const authorized = await callEconomyCircuit(
      economyProviders,
      economyAddress,
      "authorizePayment",
      [hex32ToBytes(agentId), hex32ToBytes(actionId), 10n, vendor, authWindow.periodStart, authWindow.periodEnd],
      { compiledAssetsPath: economyPreviewZkConfigPath, preview: true },
    );
    await confirmEconomy(
      "authorizePayment",
      authorized,
      (view) => view.authorizations.some((row) => row.actionId === actionId),
      actionId,
    );
    secrets.treasuryActionId = actionId;
    secrets.intentSalt = bytesToHex32(intentSalt);
    secrets.reasonDigest = bytesToHex32(reason);
    writePrivateWave2(repoRoot, secrets);

    await writeEconomyPrivateState(
      economyProviders,
      economyAddress,
      createEconomyPreviewPrivateState({
        ownerSecret: economyOwner,
        holderSecret,
        intentSalt,
        reasonDigest: reason,
        vendorId: vendor,
      }),
    );
    const settled = await callEconomyCircuit(
      economyProviders,
      economyAddress,
      "settleAuthorizedPayment",
      [hex32ToBytes(actionId), 10n, compactUserAddress(recipientBytes)],
      { compiledAssetsPath: economyPreviewZkConfigPath, preview: true },
    );
    if (!settled.submitted || settled.status !== MIDNIGHT_SUCCESS_STATUS) {
      throw new Error("settleAuthorizedPayment failed");
    }
    const settlement = await confirmEconomySettlement({
      status: settled.status,
      txId: settled.txId,
      actionId,
      contractAddress: economyAddress,
      readLedger: () => readEconomyLedger(economyProviders, economyAddress),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    recordCircuit(evidence, {
      contract: economyAddress,
      circuit: "settleAuthorizedPayment",
      status: settled.status,
      txId: settled.txId,
      publicId: actionId,
      confirmed: settlement.kind === "settled",
    });
    writePublicEvidence(repoRoot, evidence);
    if (settlement.kind !== "settled") throw new Error("settleAuthorizedPayment indexer read-back stale");
    console.log(`settleAuthorizedPayment: ${settled.status}`);
    if (settled.txId) console.log(`tx: ${settled.txId}`);

    const govProviders = buildCliProviders(wallet, governancePreviewZkConfigPath, config, {
      privateStateStoreName: "velios-governance-preview",
    });
    const govOwner = randomBytes32();
    const govState = createGovernancePreviewPrivateState({ ownerSecret: govOwner });
    const govDeployed = await deployGovernanceOrganization(govProviders, ORG_NAME, govState, {
      compiledAssetsPath: governancePreviewZkConfigPath,
    });
    if (govDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("governance deploy failed");
    await writeGovernancePrivateState(govProviders, govDeployed.contractAddress, govState);
    const govConfirm = await confirmCompanionField({
      status: govDeployed.status,
      txId: govDeployed.txId,
      contractAddress: govDeployed.contractAddress,
      readLedger: () => readGovernanceLedger(govProviders, govDeployed.contractAddress),
      present: (view) => view.contractAddress === govDeployed.contractAddress,
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (govConfirm.kind !== "confirmed") throw new Error("governance deploy indexer read-back stale");
    evidence.governance = {
      contractAddress: govDeployed.contractAddress,
      organizationId: govDeployed.organizationId,
      deployTxId: govDeployed.txId,
    };
    secrets.governanceOwnerSecret = bytesToHex32(govOwner);
    writePrivateWave2(repoRoot, secrets);
    writePublicEvidence(repoRoot, evidence);
    console.log(`governance deploy: ${govDeployed.status}`);
    console.log(`Governance contract address: ${govDeployed.contractAddress}`);

    const voterSecret = randomBytes32();
    const voterRevocation = randomBytes32();
    const voter = holderCommitment(voterSecret);
    await writeGovernancePrivateState(
      govProviders,
      govDeployed.contractAddress,
      createGovernancePreviewPrivateState({ ownerSecret: govOwner, holderSecret: voterSecret, revocationSecret: voterRevocation }),
    );
    const registeredVoter = await callGovernanceCircuit(govProviders, govDeployed.contractAddress, "registerVoter", [voter], {
      compiledAssetsPath: governancePreviewZkConfigPath,
    });
    if (!registeredVoter.submitted || registeredVoter.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("registerVoter failed");
    const voterConfirmed = await confirmCompanionField({
      status: registeredVoter.status,
      txId: registeredVoter.txId,
      contractAddress: govDeployed.contractAddress,
      readLedger: () => readGovernanceLedger(govProviders, govDeployed.contractAddress),
      present: (view) => view.voterCommitments.includes(bytesToHex32(voter)),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (voterConfirmed.kind !== "confirmed") throw new Error("registerVoter indexer read-back stale");
    recordCircuit(evidence, {
      contract: govDeployed.contractAddress,
      circuit: "registerVoter",
      status: registeredVoter.status,
      txId: registeredVoter.txId,
      publicId: bytesToHex32(voter),
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`registerVoter: ${registeredVoter.status}`);

    const nowSeconds = await fetchIndexerNowSeconds(indexerHttp);
    const proposalId = newActionId();
    const voteStart = nowSeconds - 10n;
    const voteEnd = nowSeconds + 180n;
    await writeGovernancePrivateState(
      govProviders,
      govDeployed.contractAddress,
      createGovernancePreviewPrivateState({ ownerSecret: govOwner }),
    );
    const createdProposal = await callGovernanceCircuit(
      govProviders,
      govDeployed.contractAddress,
      "createProposal",
      [hex32ToBytes(proposalId), randomBytes32(), voteStart, voteEnd, randomBytes32()],
      { compiledAssetsPath: governancePreviewZkConfigPath },
    );
    if (!createdProposal.submitted || createdProposal.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("createProposal failed");
    const proposalConfirmed = await confirmCompanionField({
      status: createdProposal.status,
      txId: createdProposal.txId,
      contractAddress: govDeployed.contractAddress,
      readLedger: () => readGovernanceLedger(govProviders, govDeployed.contractAddress),
      present: (view) => view.proposals.some((row) => row.proposalId === proposalId),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (proposalConfirmed.kind !== "confirmed") throw new Error("createProposal indexer read-back stale");
    recordCircuit(evidence, {
      contract: govDeployed.contractAddress,
      circuit: "createProposal",
      status: createdProposal.status,
      txId: createdProposal.txId,
      publicId: proposalId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`createProposal: ${createdProposal.status}`);

    const ballotSalt = randomBytes32();
    await writeGovernancePrivateState(
      govProviders,
      govDeployed.contractAddress,
      createGovernancePreviewPrivateState({
        ownerSecret: govOwner,
        holderSecret: voterSecret,
        revocationSecret: voterRevocation,
        ballotChoice: 1n,
        ballotSalt,
      }),
    );
    const ballot = await callGovernanceCircuit(
      govProviders,
      govDeployed.contractAddress,
      "castBallot",
      [hex32ToBytes(proposalId)],
      { compiledAssetsPath: governancePreviewZkConfigPath },
    );
    if (!ballot.submitted || ballot.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("castBallot failed");
    const ballotNullifier = voteNullifier(hex32ToBytes(proposalId), holderCommitment(voterSecret));
    const ballotConfirmed = await confirmCompanionField({
      status: ballot.status,
      txId: ballot.txId,
      contractAddress: govDeployed.contractAddress,
      readLedger: () => readGovernanceLedger(govProviders, govDeployed.contractAddress),
      present: (view) => view.voteNullifiers.includes(bytesToHex32(ballotNullifier)),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (ballotConfirmed.kind !== "confirmed") throw new Error("castBallot indexer read-back stale");
    recordCircuit(evidence, {
      contract: govDeployed.contractAddress,
      circuit: "castBallot",
      status: ballot.status,
      txId: ballot.txId,
      publicId: bytesToHex32(ballotNullifier),
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`castBallot: ${ballot.status}`);

    await waitUntilLedgerSeconds(indexerHttp, voteEnd);
    await writeGovernancePrivateState(
      govProviders,
      govDeployed.contractAddress,
      createGovernancePreviewPrivateState({ ownerSecret: govOwner, tallyYes: 1n, tallyNo: 0n }),
    );
    const finalized = await callGovernanceCircuit(
      govProviders,
      govDeployed.contractAddress,
      "finalizeProposal",
      [hex32ToBytes(proposalId)],
      { compiledAssetsPath: governancePreviewZkConfigPath },
    );
    if (!finalized.submitted || finalized.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("finalizeProposal failed");
    const finalizedConfirmed = await confirmCompanionField({
      status: finalized.status,
      txId: finalized.txId,
      contractAddress: govDeployed.contractAddress,
      readLedger: () => readGovernanceLedger(govProviders, govDeployed.contractAddress),
      present: (view) => view.proposals.some((row) => row.proposalId === proposalId && row.status === "finalized"),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (finalizedConfirmed.kind !== "confirmed") throw new Error("finalizeProposal indexer read-back stale");
    recordCircuit(evidence, {
      contract: govDeployed.contractAddress,
      circuit: "finalizeProposal",
      status: finalized.status,
      txId: finalized.txId,
      publicId: proposalId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`finalizeProposal: ${finalized.status}`);

    const procProviders = buildCliProviders(wallet, procurementPreviewZkConfigPath, config, {
      privateStateStoreName: "velios-procurement-preview",
    });
    const procOwner = randomBytes32();
    const procState = createProcurementPreviewPrivateState({ ownerSecret: procOwner });
    const procDeployed = await deployProcurementOrganization(procProviders, ORG_NAME, procState, {
      compiledAssetsPath: procurementPreviewZkConfigPath,
    });
    if (procDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("procurement deploy failed");
    await writeProcurementPrivateState(procProviders, procDeployed.contractAddress, procState);
    const procConfirm = await confirmCompanionField({
      status: procDeployed.status,
      txId: procDeployed.txId,
      contractAddress: procDeployed.contractAddress,
      readLedger: () => readProcurementLedger(procProviders, procDeployed.contractAddress),
      present: (view) => view.contractAddress === procDeployed.contractAddress,
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (procConfirm.kind !== "confirmed") throw new Error("procurement deploy indexer read-back stale");
    evidence.procurement = {
      contractAddress: procDeployed.contractAddress,
      organizationId: procDeployed.organizationId,
      deployTxId: procDeployed.txId,
    };
    secrets.procurementOwnerSecret = bytesToHex32(procOwner);
    writePrivateWave2(repoRoot, secrets);
    writePublicEvidence(repoRoot, evidence);
    console.log(`procurement deploy: ${procDeployed.status}`);
    console.log(`Procurement contract address: ${procDeployed.contractAddress}`);

    const bidderSecret = randomBytes32();
    const bidderRevocation = randomBytes32();
    const bidder = holderCommitment(bidderSecret);
    await writeProcurementPrivateState(
      procProviders,
      procDeployed.contractAddress,
      createProcurementPreviewPrivateState({ ownerSecret: procOwner, holderSecret: bidderSecret, revocationSecret: bidderRevocation }),
    );
    const registeredBidder = await callProcurementCircuit(
      procProviders,
      procDeployed.contractAddress,
      "registerBidder",
      [bidder],
      { compiledAssetsPath: procurementPreviewZkConfigPath },
    );
    if (!registeredBidder.submitted || registeredBidder.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("registerBidder failed");
    const bidderConfirmed = await confirmCompanionField({
      status: registeredBidder.status,
      txId: registeredBidder.txId,
      contractAddress: procDeployed.contractAddress,
      readLedger: () => readProcurementLedger(procProviders, procDeployed.contractAddress),
      present: (view) => view.bidderCommitments.includes(bytesToHex32(bidder)),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (bidderConfirmed.kind !== "confirmed") throw new Error("registerBidder indexer read-back stale");
    recordCircuit(evidence, {
      contract: procDeployed.contractAddress,
      circuit: "registerBidder",
      status: registeredBidder.status,
      txId: registeredBidder.txId,
      publicId: bytesToHex32(bidder),
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`registerBidder: ${registeredBidder.status}`);

    const procurementNow = await fetchIndexerNowSeconds(indexerHttp);
    const procurementId = newActionId();
    await writeProcurementPrivateState(
      procProviders,
      procDeployed.contractAddress,
      createProcurementPreviewPrivateState({ ownerSecret: procOwner }),
    );
    const createdLot = await callProcurementCircuit(
      procProviders,
      procDeployed.contractAddress,
      "createProcurement",
      [hex32ToBytes(procurementId), procurementNow - 10n, procurementNow + 1_200n, randomBytes32()],
      { compiledAssetsPath: procurementPreviewZkConfigPath },
    );
    if (!createdLot.submitted || createdLot.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("createProcurement failed");
    const lotConfirmed = await confirmCompanionField({
      status: createdLot.status,
      txId: createdLot.txId,
      contractAddress: procDeployed.contractAddress,
      readLedger: () => readProcurementLedger(procProviders, procDeployed.contractAddress),
      present: (view) => view.lots.some((row) => row.procurementId === procurementId),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (lotConfirmed.kind !== "confirmed") throw new Error("createProcurement indexer read-back stale");
    recordCircuit(evidence, {
      contract: procDeployed.contractAddress,
      circuit: "createProcurement",
      status: createdLot.status,
      txId: createdLot.txId,
      publicId: procurementId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`createProcurement: ${createdLot.status}`);

    const bidSalt = randomBytes32();
    const bidAmount = 10n;
    await writeProcurementPrivateState(
      procProviders,
      procDeployed.contractAddress,
      createProcurementPreviewPrivateState({
        ownerSecret: procOwner,
        holderSecret: bidderSecret,
        revocationSecret: bidderRevocation,
        bidAmount,
        bidSalt,
      }),
    );
    const submittedBid = await callProcurementCircuit(
      procProviders,
      procDeployed.contractAddress,
      "submitBid",
      [hex32ToBytes(procurementId)],
      { compiledAssetsPath: procurementPreviewZkConfigPath },
    );
    if (!submittedBid.submitted || submittedBid.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("submitBid failed");
    const bidC = bidCommitment({
      procurementId: hex32ToBytes(procurementId),
      holder: holderCommitment(bidderSecret),
      amount: bidAmount,
      salt: bidSalt,
    });
    const bidConfirmed = await confirmCompanionField({
      status: submittedBid.status,
      txId: submittedBid.txId,
      contractAddress: procDeployed.contractAddress,
      readLedger: () => readProcurementLedger(procProviders, procDeployed.contractAddress),
      present: (view) =>
        view.lots.some((row) => row.procurementId === procurementId) && view.bidCommitments.length > 0,
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (bidConfirmed.kind !== "confirmed") throw new Error("submitBid indexer read-back stale");
    recordCircuit(evidence, {
      contract: procDeployed.contractAddress,
      circuit: "submitBid",
      status: submittedBid.status,
      txId: submittedBid.txId,
      publicId: bytesToHex32(bidC),
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`submitBid: ${submittedBid.status}`);

    const awardSalt = randomBytes32();
    await writeProcurementPrivateState(
      procProviders,
      procDeployed.contractAddress,
      createProcurementPreviewPrivateState({
        ownerSecret: procOwner,
        awardSalt,
        winnerHolder: holderCommitment(bidderSecret),
      }),
    );
    const awarded = await callProcurementCircuit(
      procProviders,
      procDeployed.contractAddress,
      "awardProcurement",
      [hex32ToBytes(procurementId), bidC, hex32ToBytes(actionId)],
      { compiledAssetsPath: procurementPreviewZkConfigPath },
    );
    if (!awarded.submitted || awarded.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("awardProcurement failed");
    const awardConfirmed = await confirmCompanionField({
      status: awarded.status,
      txId: awarded.txId,
      contractAddress: procDeployed.contractAddress,
      readLedger: () => readProcurementLedger(procProviders, procDeployed.contractAddress),
      present: (view) => view.lots.some((row) => row.procurementId === procurementId && row.status === "awarded"),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (awardConfirmed.kind !== "confirmed") throw new Error("awardProcurement indexer read-back stale");
    recordCircuit(evidence, {
      contract: procDeployed.contractAddress,
      circuit: "awardProcurement",
      status: awarded.status,
      txId: awarded.txId,
      publicId: procurementId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`awardProcurement: ${awarded.status}`);

    const auditorProviders = buildCliProviders(wallet, auditorPreviewZkConfigPath, config, {
      privateStateStoreName: "velios-auditor-preview",
    });
    const auditorOwner = randomBytes32();
    const auditorState = createAuditorPreviewPrivateState({ ownerSecret: auditorOwner });
    const auditorDeployed = await deployAuditorOrganization(auditorProviders, ORG_NAME, auditorState, {
      compiledAssetsPath: auditorPreviewZkConfigPath,
    });
    if (auditorDeployed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("auditor deploy failed");
    await writeAuditorPrivateState(auditorProviders, auditorDeployed.contractAddress, auditorState);
    const auditorConfirm = await confirmCompanionField({
      status: auditorDeployed.status,
      txId: auditorDeployed.txId,
      contractAddress: auditorDeployed.contractAddress,
      readLedger: () => readAuditorLedger(auditorProviders, auditorDeployed.contractAddress),
      present: (view) => view.contractAddress === auditorDeployed.contractAddress,
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (auditorConfirm.kind !== "confirmed") throw new Error("auditor deploy indexer read-back stale");
    evidence.auditor = {
      contractAddress: auditorDeployed.contractAddress,
      organizationId: auditorDeployed.organizationId,
      deployTxId: auditorDeployed.txId,
    };
    secrets.auditorOwnerSecret = bytesToHex32(auditorOwner);
    writePrivateWave2(repoRoot, secrets);
    writePublicEvidence(repoRoot, evidence);
    console.log(`auditor deploy: ${auditorDeployed.status}`);
    console.log(`Auditor contract address: ${auditorDeployed.contractAddress}`);

    const disclosureId = newActionId();
    const auditorId = randomBytes32();
    const nonce = randomBytes32();
    const scope = disclosureScopeCommitment({
      auditorId,
      claims: new TextEncoder().encode("preview-auditor".padEnd(32, "\0")).slice(0, 32),
      nonce,
    });
    await writeAuditorPrivateState(auditorProviders, auditorDeployed.contractAddress, auditorState);
    const disclosed = await callAuditorCircuit(
      auditorProviders,
      auditorDeployed.contractAddress,
      "recordDisclosure",
      [hex32ToBytes(disclosureId), auditorId, scope, authWindow.periodEnd + 3_600n],
      { compiledAssetsPath: auditorPreviewZkConfigPath },
    );
    if (!disclosed.submitted || disclosed.status !== MIDNIGHT_SUCCESS_STATUS) throw new Error("recordDisclosure failed");
    const disclosureConfirmed = await confirmCompanionField({
      status: disclosed.status,
      txId: disclosed.txId,
      contractAddress: auditorDeployed.contractAddress,
      readLedger: () => readAuditorLedger(auditorProviders, auditorDeployed.contractAddress),
      present: (view) => view.disclosures.some((row) => row.disclosureId === disclosureId),
      timeoutMs: CONFIRM_MS,
      pollMs: POLL_MS,
    });
    if (disclosureConfirmed.kind !== "confirmed") throw new Error("recordDisclosure indexer read-back stale");
    recordCircuit(evidence, {
      contract: auditorDeployed.contractAddress,
      circuit: "recordDisclosure",
      status: disclosed.status,
      txId: disclosed.txId,
      publicId: disclosureId,
      confirmed: true,
    });
    writePublicEvidence(repoRoot, evidence);
    console.log(`recordDisclosure: ${disclosed.status}`);
    evidence.createdAt = new Date().toISOString();
    writePublicEvidence(repoRoot, evidence);
    return evidence;
  } finally {
    await Promise.race([
      wallet.stop().catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 15_000)),
    ]);
  }
}

function isMain(): boolean {
  const entry = process.argv[1] ?? "";
  return entry.includes("preview-wave2");
}

if (isMain()) {
  runPreviewWave2().catch((error) => {
    const message = error instanceof Error ? error.message : "wave2 failed";
    console.error(message);
    process.exitCode = 1;
  });
}
