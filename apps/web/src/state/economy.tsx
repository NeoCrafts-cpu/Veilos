import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createAuditorPreviewPrivateState,
  createEconomyPreviewPrivateState,
  createGovernancePreviewPrivateState,
  createProcurementPreviewPrivateState,
} from "@velios/contracts";
import { credentialCommitment, holderCommitment, revocationNullifier } from "@velios/credentials";
import { addressCommitment, bidCommitment, disclosureScopeCommitment, settlementDisclosureCopy, voteNullifier } from "@velios/economy";
import { currentAuthorizationWindow, randomBytes32, reasonDigest } from "@velios/policy-engine";
import {
  CREDENTIAL_CLASS_ID,
  asHex32,
  bytesToHex32,
  hex32ToBytes,
  type CredentialClass,
} from "@velios/shared-types";
import { publishedEconomyDeploymentFor } from "@velios/midnight/published";
import { newActionId, organizationIdFromName } from "@velios/midnight/ids";
import { explainCaughtError } from "@velios/midnight/status";
import type { AuditorLedgerView, EconomyLedgerView, GovernanceLedgerView, ProcurementLedgerView } from "@velios/midnight/economy-ledger";
import { compactUserAddress, parseUserAddressBytes } from "@velios/midnight/user-address";
import { DEMO_ORG_NAME, useSession } from "./session.js";
import {
  decryptWave2Vault,
  emptyWave2Vault,
  encryptWave2Vault,
  readEncryptedWave2Vault,
  type StoredBallotRecord,
  type StoredBidRecord,
  type StoredCredentialRecord,
  type StoredMembershipRecord,
  type StoredPaymentRecord,
  type Wave2VaultPayload,
} from "../lib/wave2-vault.js";
import { readWave2Contracts, writeWave2Contracts, type Wave2ContractSelection } from "../lib/wave2-contracts.js";

const COMPILED_ASSETS = ".";

export type Wave2Status = "idle" | "working" | "confirmed" | "refused" | "stale" | "failed";

export type Wave2CallResult = {
  status: Wave2Status;
  txId?: string;
  message?: string;
};

type LooseProviders = {
  publicDataProvider?: { queryContractState: (address: string) => Promise<unknown> };
  privateStateProvider?: { setContractAddress?: (address: string) => void; set?: (id: string, state: unknown) => Promise<void> };
};

function isVitestRuntime(): boolean {
  const env = (import.meta as { env?: { VITEST?: unknown; MODE?: string } }).env;
  return Boolean(env?.VITEST) || env?.MODE === "test";
}

function publicError(error: unknown, fallback: string): string {
  return explainCaughtError(error, fallback);
}

function secretHex(): string {
  return bytesToHex32(randomBytes32());
}

function classId(name: CredentialClass): bigint {
  return CREDENTIAL_CLASS_ID[name];
}

export type EconomyValue = {
  selection: { settlementActionId?: string; acknowledgedLeakage: boolean };
  acknowledgeLeakage: () => void;
  selectSettlement: (actionId: string) => void;
  disclosure: ReturnType<typeof settlementDisclosureCopy>;
  contracts: Wave2ContractSelection;
  economy: EconomyLedgerView | null;
  governance: GovernanceLedgerView | null;
  procurement: ProcurementLedgerView | null;
  auditor: AuditorLedgerView | null;
  ledgerError: string | null;
  lastResult: Wave2CallResult;
  vault: Wave2VaultPayload;
  vaultReady: boolean;
  busy: boolean;
  refreshLedgers: () => Promise<void>;
  deployEconomy: () => Promise<Wave2CallResult>;
  deployGovernance: () => Promise<Wave2CallResult>;
  deployProcurement: () => Promise<Wave2CallResult>;
  deployAuditor: () => Promise<Wave2CallResult>;
  issueCredential: (input: { className: CredentialClass; expiryDays: number }) => Promise<Wave2CallResult>;
  revokeCredential: (commitment: string) => Promise<Wave2CallResult>;
  authorizeTreasuryPayment: (input: {
    amount: bigint;
    recipient: string;
    reason: string;
    perActionLimit: bigint;
    dailyLimit: bigint;
  }) => Promise<Wave2CallResult>;
  depositNight: (amount: bigint) => Promise<Wave2CallResult>;
  settlePayment: (actionId: string) => Promise<Wave2CallResult>;
  registerVoter: () => Promise<Wave2CallResult>;
  createProposal: (input: { durationSeconds: number }) => Promise<Wave2CallResult>;
  castBallot: (input: { proposalId: string; choice: 0n | 1n }) => Promise<Wave2CallResult>;
  finalizeProposal: (proposalId: string) => Promise<Wave2CallResult>;
  registerBidder: () => Promise<Wave2CallResult>;
  createProcurement: (input: { durationSeconds: number }) => Promise<Wave2CallResult>;
  submitBid: (input: { procurementId: string; amount: bigint }) => Promise<Wave2CallResult>;
  awardProcurement: (input: { procurementId: string; treasuryActionId: string }) => Promise<Wave2CallResult>;
  recordDisclosure: (input: { auditorLabel: string; expiresHours: number }) => Promise<Wave2CallResult>;
};

const EconomyContext = createContext<EconomyValue | null>(null);

export function EconomyProvider({ children }: { children: ReactNode }) {
  const {
    network,
    midnightProviders,
    withOperatorPassphrase,
    publicStore,
    vaultStatus,
  } = useSession();
  const publishedEconomy = useMemo(() => publishedEconomyDeploymentFor(network.networkId), [network.networkId]);
  const [contracts, setContracts] = useState<Wave2ContractSelection>({ networkId: network.networkId });
  const [economy, setEconomy] = useState<EconomyLedgerView | null>(null);
  const [governance, setGovernance] = useState<GovernanceLedgerView | null>(null);
  const [procurement, setProcurement] = useState<ProcurementLedgerView | null>(null);
  const [auditor, setAuditor] = useState<AuditorLedgerView | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Wave2CallResult>({ status: "idle" });
  const [vault, setVault] = useState<Wave2VaultPayload>(emptyWave2Vault);
  const [vaultReady, setVaultReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState<{ settlementActionId?: string; acknowledgedLeakage: boolean }>({
    acknowledgedLeakage: false,
  });
  const vaultRef = useRef(vault);
  vaultRef.current = vault;

  const economyAddress = contracts.economy ?? publishedEconomy?.contractAddress;
  const organizationName = publicStore.organizationName || publishedEconomy?.organizationName || DEMO_ORG_NAME;

  const persistVault = useCallback(
    async (next: Wave2VaultPayload) => {
      setVault(next);
      vaultRef.current = next;
      await withOperatorPassphrase(async (passphrase) => {
        await encryptWave2Vault(next, passphrase, network.networkId);
      });
    },
    [network.networkId, withOperatorPassphrase],
  );

  useEffect(() => {
    const stored = readWave2Contracts();
    if (stored && stored.networkId === network.networkId) {
      setContracts({
        ...stored,
        economy: stored.economy ?? publishedEconomy?.contractAddress,
      });
      return;
    }
    setContracts({
      networkId: network.networkId,
      economy: publishedEconomy?.contractAddress,
    });
  }, [network.networkId, publishedEconomy?.contractAddress]);

  useEffect(() => {
    if (isVitestRuntime()) return;
    writeWave2Contracts(contracts);
  }, [contracts]);

  useEffect(() => {
    if (isVitestRuntime()) {
      setVaultReady(true);
      return;
    }
    if (vaultStatus !== "unlocked") {
      setVaultReady(false);
      return;
    }
    const encrypted = readEncryptedWave2Vault(network.networkId);
    if (!encrypted) {
      setVault(emptyWave2Vault());
      setVaultReady(true);
      return;
    }
    void withOperatorPassphrase(async (passphrase) => {
      try {
        setVault(await decryptWave2Vault(encrypted, passphrase));
        setVaultReady(true);
      } catch {
        setVault(emptyWave2Vault());
        setVaultReady(false);
      }
    }).catch(() => {
      setVaultReady(false);
    });
  }, [network.networkId, vaultStatus, withOperatorPassphrase]);

  const indexerProviders = useCallback(async (): Promise<LooseProviders> => {
    const active = midnightProviders as LooseProviders | null;
    if (active?.publicDataProvider) return active;
    const { publicIndexerProvider } = await import("@velios/midnight");
    return { publicDataProvider: publicIndexerProvider(network) };
  }, [midnightProviders, network]);

  const refreshLedgers = useCallback(async () => {
    if (isVitestRuntime()) return;
    const providers = await indexerProviders();
    try {
      if (economyAddress) {
        const { readEconomyLedger } = await import("@velios/midnight/economy-client");
        setEconomy(await readEconomyLedger(providers, economyAddress));
      }
      if (contracts.governance) {
        const { readGovernanceLedger } = await import("@velios/midnight/companion-client");
        setGovernance(await readGovernanceLedger(providers, contracts.governance));
      }
      if (contracts.procurement) {
        const { readProcurementLedger } = await import("@velios/midnight/companion-client");
        setProcurement(await readProcurementLedger(providers, contracts.procurement));
      }
      if (contracts.auditor) {
        const { readAuditorLedger } = await import("@velios/midnight/companion-client");
        setAuditor(await readAuditorLedger(providers, contracts.auditor));
      }
      setLedgerError(null);
    } catch (error) {
      setLedgerError(publicError(error, "indexer read failed"));
    }
  }, [contracts.auditor, contracts.governance, contracts.procurement, economyAddress, indexerProviders]);

  useEffect(() => {
    void refreshLedgers();
  }, [refreshLedgers]);

  const requireProviders = useCallback(() => {
    if (!midnightProviders) throw new Error("Connect a Midnight wallet first.");
    return midnightProviders;
  }, [midnightProviders]);

  const runCall = useCallback(async (work: () => Promise<Wave2CallResult>): Promise<Wave2CallResult> => {
    setBusy(true);
    setLastResult({ status: "working" });
    try {
      const result = await work();
      setLastResult(result);
      return result;
    } catch (error) {
      const result: Wave2CallResult = { status: "refused", message: publicError(error, "REFUSED") };
      setLastResult(result);
      return result;
    } finally {
      setBusy(false);
    }
  }, []);

  const ensureOwnerSecret = useCallback(
    async (field: "economyOwnerSecret" | "governanceOwnerSecret" | "procurementOwnerSecret" | "auditorOwnerSecret") => {
      const current = vaultRef.current[field];
      if (current) return hex32ToBytes(asHex32(current));
      const nextSecret = secretHex();
      await persistVault({ ...vaultRef.current, [field]: nextSecret });
      return hex32ToBytes(asHex32(nextSecret));
    },
    [persistVault],
  );

  const value = useMemo<EconomyValue>(
    () => ({
      selection,
      acknowledgeLeakage: () => setSelection((prev) => ({ ...prev, acknowledgedLeakage: true })),
      selectSettlement: (actionId) => setSelection((prev) => ({ ...prev, settlementActionId: actionId })),
      disclosure: settlementDisclosureCopy(),
      contracts: { ...contracts, economy: economyAddress },
      economy,
      governance,
      procurement,
      auditor,
      ledgerError,
      lastResult,
      vault,
      vaultReady,
      busy,
      refreshLedgers,
      deployEconomy: () =>
        runCall(async () => {
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const privateState = createEconomyPreviewPrivateState({ ownerSecret });
          const { deployEconomyOrganization, writeEconomyPrivateState } = await import("@velios/midnight/economy-client");
          const deployed = await deployEconomyOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          await writeEconomyPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, networkId: network.networkId, economy: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, economyOwnerSecret: bytesToHex32(ownerSecret) });
          await refreshLedgers();
          return { status: "confirmed", txId: deployed.txId, message: deployed.contractAddress };
        }),
      deployGovernance: () =>
        runCall(async () => {
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("governanceOwnerSecret");
          const privateState = createGovernancePreviewPrivateState({ ownerSecret });
          const { deployGovernanceOrganization, writeGovernancePrivateState } = await import(
            "@velios/midnight/companion-client"
          );
          const deployed = await deployGovernanceOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          await writeGovernancePrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, governance: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, governanceOwnerSecret: bytesToHex32(ownerSecret) });
          await refreshLedgers();
          return { status: "confirmed", txId: deployed.txId, message: deployed.contractAddress };
        }),
      deployProcurement: () =>
        runCall(async () => {
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("procurementOwnerSecret");
          const privateState = createProcurementPreviewPrivateState({ ownerSecret });
          const { deployProcurementOrganization, writeProcurementPrivateState } = await import(
            "@velios/midnight/companion-client"
          );
          const deployed = await deployProcurementOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          await writeProcurementPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, procurement: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, procurementOwnerSecret: bytesToHex32(ownerSecret) });
          await refreshLedgers();
          return { status: "confirmed", txId: deployed.txId, message: deployed.contractAddress };
        }),
      deployAuditor: () =>
        runCall(async () => {
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("auditorOwnerSecret");
          const privateState = createAuditorPreviewPrivateState({ ownerSecret });
          const { deployAuditorOrganization, writeAuditorPrivateState } = await import(
            "@velios/midnight/companion-client"
          );
          const deployed = await deployAuditorOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          await writeAuditorPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, auditor: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, auditorOwnerSecret: bytesToHex32(ownerSecret) });
          await refreshLedgers();
          return { status: "confirmed", txId: deployed.txId, message: deployed.contractAddress };
        }),
      issueCredential: (input) =>
        runCall(async () => {
          if (!economyAddress) throw new Error("Deploy or join an economy-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const holderSecret = randomBytes32();
          const salt = randomBytes32();
          const revocationSecret = randomBytes32();
          const orgId = economy?.organizationId
            ? hex32ToBytes(economy.organizationId)
            : hex32ToBytes(organizationIdFromName(organizationName));
          const window = currentAuthorizationWindow();
          const expiry = window.periodEnd + BigInt(input.expiryDays) * 86_400n;
          const commitment = credentialCommitment({
            holderSecret,
            organizationId: orgId,
            className: input.className,
            expiry,
            salt,
          });
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret,
            credentialClass: classId(input.className),
            credentialExpiry: expiry,
            credentialSalt: salt,
            revocationSecret,
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, economyAddress, privateState);
          const submitted = await callEconomyCircuit(providers, economyAddress, "issueCredential", [commitment], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) {
            return { status: "refused", txId: submitted.txId, message: submitted.status };
          }
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: economyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, economyAddress),
            present: (view) => view.credentialCommitments.includes(bytesToHex32(commitment)),
          });
          if (confirmed.kind !== "confirmed") {
            return { status: confirmed.kind === "stale" ? "stale" : "failed", txId: submitted.txId };
          }
          const record: StoredCredentialRecord = {
            commitment: bytesToHex32(commitment),
            className: input.className,
            expiry: expiry.toString(),
            holderSecret: bytesToHex32(holderSecret),
            salt: bytesToHex32(salt),
            revocationSecret: bytesToHex32(revocationSecret),
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, credentials: [...vaultRef.current.credentials, record] });
          if (confirmed.view) setEconomy(confirmed.view);
          return { status: "confirmed", txId: submitted.txId };
        }),
      revokeCredential: (commitmentHex) =>
        runCall(async () => {
          if (!economyAddress) throw new Error("economy contract missing");
          const providers = requireProviders();
          const record = vaultRef.current.credentials.find((item) => item.commitment === commitmentHex);
          if (!record) throw new Error("Unlock the operator vault that issued this credential.");
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const commitment = hex32ToBytes(asHex32(record.commitment));
          const nullifier = revocationNullifier(commitment, hex32ToBytes(asHex32(record.revocationSecret)));
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret: hex32ToBytes(asHex32(record.holderSecret)),
            credentialSalt: hex32ToBytes(asHex32(record.salt)),
            revocationSecret: hex32ToBytes(asHex32(record.revocationSecret)),
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, economyAddress, privateState);
          const submitted = await callEconomyCircuit(providers, economyAddress, "revokeCredential", [nullifier], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: economyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, economyAddress),
            present: (view) => view.revokedNullifiers.includes(bytesToHex32(nullifier)),
          });
          if (confirmed.view) setEconomy(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      authorizeTreasuryPayment: (input) =>
        runCall(async () => {
          if (!economyAddress) throw new Error("economy contract missing");
          const treasury = vaultRef.current.credentials.find((item) => item.className === "treasury");
          if (!treasury) throw new Error("Issue a treasury credential first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const recipientBytes = parseUserAddressBytes(input.recipient, network.networkId);
          const vendor = addressCommitment(recipientBytes);
          const window = currentAuthorizationWindow();
          const actionId = newActionId();
          const agentId = publicStore.agents[0]?.agentId ?? asHex32("11".repeat(32));
          const intentSalt = randomBytes32();
          const reason = reasonDigest(input.reason);
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret: hex32ToBytes(asHex32(treasury.holderSecret)),
            credentialClass: classId("treasury"),
            credentialExpiry: BigInt(treasury.expiry),
            credentialSalt: hex32ToBytes(asHex32(treasury.salt)),
            revocationSecret: hex32ToBytes(asHex32(treasury.revocationSecret)),
            intentSalt,
            reasonDigest: reason,
            vendorId: vendor,
            perActionLimit: input.perActionLimit,
            dailyLimit: input.dailyLimit,
            spendPeriodStart: window.periodStart,
            spendDaily: 0n,
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, economyAddress, privateState);
          const submitted = await callEconomyCircuit(
            providers,
            economyAddress,
            "authorizePayment",
            [hex32ToBytes(agentId), hex32ToBytes(actionId), input.amount, vendor, window.periodStart, window.periodEnd],
            { compiledAssetsPath: COMPILED_ASSETS, preview: true },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: economyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, economyAddress),
            present: (view) => view.authorizations.some((row) => row.actionId === actionId),
          });
          if (confirmed.kind !== "confirmed") {
            return { status: confirmed.kind === "stale" ? "stale" : "failed", txId: submitted.txId };
          }
          const payment: StoredPaymentRecord = {
            actionId,
            agentId,
            amount: input.amount.toString(),
            recipient: input.recipient.trim(),
            recipientBytes: bytesToHex32(recipientBytes),
            vendorCommitment: bytesToHex32(vendor),
            intentSalt: bytesToHex32(intentSalt),
            reasonDigest: bytesToHex32(reason),
            periodStart: window.periodStart.toString(),
            periodEnd: window.periodEnd.toString(),
            perActionLimit: input.perActionLimit.toString(),
            dailyLimit: input.dailyLimit.toString(),
            spendPeriodStart: window.periodStart.toString(),
            spendDaily: "0",
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, payments: [...vaultRef.current.payments, payment] });
          setSelection((prev) => ({ ...prev, settlementActionId: actionId }));
          if (confirmed.view) setEconomy(confirmed.view);
          return { status: "confirmed", txId: submitted.txId, message: actionId };
        }),
      depositNight: (amount) =>
        runCall(async () => {
          if (!economyAddress) throw new Error("economy contract missing");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const privateState = createEconomyPreviewPrivateState({ ownerSecret });
          const { callEconomyCircuit, writeEconomyPrivateState } = await import("@velios/midnight/economy-client");
          await writeEconomyPrivateState(providers as LooseProviders, economyAddress, privateState);
          const submitted = await callEconomyCircuit(providers, economyAddress, "depositNight", [amount], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          await refreshLedgers();
          return { status: "confirmed", txId: submitted.txId };
        }),
      settlePayment: (actionId) =>
        runCall(async () => {
          if (!economyAddress) throw new Error("economy contract missing");
          if (!selection.acknowledgedLeakage) throw new Error("Acknowledge unshielded leakage first.");
          const payment = vaultRef.current.payments.find((item) => item.actionId === actionId);
          if (!payment) throw new Error("This tab does not hold the private intent for that authorization.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("economyOwnerSecret");
          const treasury = vaultRef.current.credentials.find((item) => item.className === "treasury");
          const recipientBytes = hex32ToBytes(asHex32(payment.recipientBytes));
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret: treasury ? hex32ToBytes(asHex32(treasury.holderSecret)) : new Uint8Array(32),
            intentSalt: hex32ToBytes(asHex32(payment.intentSalt)),
            reasonDigest: hex32ToBytes(asHex32(payment.reasonDigest)),
            vendorId: hex32ToBytes(asHex32(payment.vendorCommitment)),
          });
          const { callEconomyCircuit, confirmEconomySettlement, readEconomyLedger, writeEconomyPrivateState } =
            await import("@velios/midnight/economy-client");
          await writeEconomyPrivateState(providers as LooseProviders, economyAddress, privateState);
          const submitted = await callEconomyCircuit(
            providers,
            economyAddress,
            "settleAuthorizedPayment",
            [hex32ToBytes(asHex32(actionId)), BigInt(payment.amount), compactUserAddress(recipientBytes)],
            { compiledAssetsPath: COMPILED_ASSETS, preview: true },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmEconomySettlement({
            status: submitted.status,
            txId: submitted.txId,
            actionId,
            contractAddress: economyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, economyAddress),
          });
          await refreshLedgers();
          return {
            status: confirmed.kind === "settled" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      registerVoter: () =>
        runCall(async () => {
          if (!contracts.governance) throw new Error("Deploy the governance-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("governanceOwnerSecret");
          const holderSecret = randomBytes32();
          const revocationSecret = randomBytes32();
          const commitment = holderCommitment(holderSecret);
          const privateState = createGovernancePreviewPrivateState({ ownerSecret, holderSecret, revocationSecret });
          const { callGovernanceCircuit, confirmCompanionField, readGovernanceLedger, writeGovernancePrivateState } =
            await import("@velios/midnight/companion-client");
          await writeGovernancePrivateState(providers as LooseProviders, contracts.governance, privateState);
          const submitted = await callGovernanceCircuit(
            providers,
            contracts.governance,
            "registerVoter",
            [commitment],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.governance,
            readLedger: () => readGovernanceLedger(providers as LooseProviders, contracts.governance!),
            present: (view) => view.voterCommitments.includes(bytesToHex32(commitment)),
          });
          const record: StoredMembershipRecord = {
            holderCommitment: bytesToHex32(commitment),
            holderSecret: bytesToHex32(holderSecret),
            revocationSecret: bytesToHex32(revocationSecret),
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, voters: [...vaultRef.current.voters, record] });
          if (confirmed.view) setGovernance(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      createProposal: (input) =>
        runCall(async () => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("governanceOwnerSecret");
          const proposalId = newActionId();
          const now = currentAuthorizationWindow().periodStart;
          const voteEnd = now + BigInt(input.durationSeconds);
          const privateState = createGovernancePreviewPrivateState({ ownerSecret });
          const { callGovernanceCircuit, confirmCompanionField, readGovernanceLedger, writeGovernancePrivateState } =
            await import("@velios/midnight/companion-client");
          await writeGovernancePrivateState(providers as LooseProviders, contracts.governance, privateState);
          const submitted = await callGovernanceCircuit(
            providers,
            contracts.governance,
            "createProposal",
            [hex32ToBytes(proposalId), randomBytes32(), now, voteEnd, randomBytes32()],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.governance,
            readLedger: () => readGovernanceLedger(providers as LooseProviders, contracts.governance!),
            present: (view) => view.proposals.some((row) => row.proposalId === proposalId),
          });
          if (confirmed.view) setGovernance(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
            message: proposalId,
          };
        }),
      castBallot: (input) =>
        runCall(async () => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const voter = vaultRef.current.voters.at(-1);
          if (!voter) throw new Error("Register a voter in this vault first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("governanceOwnerSecret");
          const salt = randomBytes32();
          const holderSecret = hex32ToBytes(asHex32(voter.holderSecret));
          const privateState = createGovernancePreviewPrivateState({
            ownerSecret,
            holderSecret,
            revocationSecret: hex32ToBytes(asHex32(voter.revocationSecret)),
            ballotChoice: input.choice,
            ballotSalt: salt,
          });
          const { callGovernanceCircuit, confirmCompanionField, readGovernanceLedger, writeGovernancePrivateState } =
            await import("@velios/midnight/companion-client");
          await writeGovernancePrivateState(providers as LooseProviders, contracts.governance, privateState);
          const submitted = await callGovernanceCircuit(
            providers,
            contracts.governance,
            "castBallot",
            [hex32ToBytes(asHex32(input.proposalId))],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const nullifier = voteNullifier(hex32ToBytes(asHex32(input.proposalId)), holderCommitment(holderSecret));
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.governance,
            readLedger: () => readGovernanceLedger(providers as LooseProviders, contracts.governance!),
            present: (view) => view.voteNullifiers.includes(bytesToHex32(nullifier)),
          });
          const ballot: StoredBallotRecord = {
            proposalId: input.proposalId,
            choice: input.choice === 1n ? "1" : "0",
            salt: bytesToHex32(salt),
            holderSecret: voter.holderSecret,
            revocationSecret: voter.revocationSecret,
            nullifier: bytesToHex32(nullifier),
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, ballots: [...vaultRef.current.ballots, ballot] });
          if (confirmed.view) setGovernance(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      finalizeProposal: (proposalId) =>
        runCall(async () => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("governanceOwnerSecret");
          const openings = vaultRef.current.ballots.filter((item) => item.proposalId === proposalId);
          const yes = BigInt(openings.filter((item) => item.choice === "1").length);
          const no = BigInt(openings.filter((item) => item.choice === "0").length);
          const privateState = createGovernancePreviewPrivateState({
            ownerSecret,
            tallyYes: yes,
            tallyNo: no,
          });
          const { callGovernanceCircuit, confirmCompanionField, readGovernanceLedger, writeGovernancePrivateState } =
            await import("@velios/midnight/companion-client");
          await writeGovernancePrivateState(providers as LooseProviders, contracts.governance, privateState);
          const submitted = await callGovernanceCircuit(
            providers,
            contracts.governance,
            "finalizeProposal",
            [hex32ToBytes(asHex32(proposalId))],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.governance,
            readLedger: () => readGovernanceLedger(providers as LooseProviders, contracts.governance!),
            present: (view) => view.proposals.some((row) => row.proposalId === proposalId && row.status === "finalized"),
          });
          if (confirmed.view) setGovernance(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      registerBidder: () =>
        runCall(async () => {
          if (!contracts.procurement) throw new Error("Deploy the procurement-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("procurementOwnerSecret");
          const holderSecret = randomBytes32();
          const revocationSecret = randomBytes32();
          const commitment = holderCommitment(holderSecret);
          const privateState = createProcurementPreviewPrivateState({ ownerSecret, holderSecret, revocationSecret });
          const { callProcurementCircuit, confirmCompanionField, readProcurementLedger, writeProcurementPrivateState } =
            await import("@velios/midnight/companion-client");
          await writeProcurementPrivateState(providers as LooseProviders, contracts.procurement, privateState);
          const submitted = await callProcurementCircuit(
            providers,
            contracts.procurement,
            "registerBidder",
            [commitment],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.procurement,
            readLedger: () => readProcurementLedger(providers as LooseProviders, contracts.procurement!),
            present: (view) => view.bidderCommitments.includes(bytesToHex32(commitment)),
          });
          await persistVault({
            ...vaultRef.current,
            bidders: [
              ...vaultRef.current.bidders,
              {
                holderCommitment: bytesToHex32(commitment),
                holderSecret: bytesToHex32(holderSecret),
                revocationSecret: bytesToHex32(revocationSecret),
                txId: submitted.txId,
              },
            ],
          });
          if (confirmed.view) setProcurement(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      createProcurement: (input) =>
        runCall(async () => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("procurementOwnerSecret");
          const procurementId = newActionId();
          const now = currentAuthorizationWindow().periodStart;
          const privateState = createProcurementPreviewPrivateState({ ownerSecret });
          const { callProcurementCircuit, confirmCompanionField, readProcurementLedger, writeProcurementPrivateState } =
            await import("@velios/midnight/companion-client");
          await writeProcurementPrivateState(providers as LooseProviders, contracts.procurement, privateState);
          const submitted = await callProcurementCircuit(
            providers,
            contracts.procurement,
            "createProcurement",
            [hex32ToBytes(procurementId), now, now + BigInt(input.durationSeconds), randomBytes32()],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.procurement,
            readLedger: () => readProcurementLedger(providers as LooseProviders, contracts.procurement!),
            present: (view) => view.lots.some((row) => row.procurementId === procurementId),
          });
          if (confirmed.view) setProcurement(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
            message: procurementId,
          };
        }),
      submitBid: (input) =>
        runCall(async () => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          const bidder = vaultRef.current.bidders.at(-1);
          if (!bidder) throw new Error("Register a bidder in this vault first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("procurementOwnerSecret");
          const salt = randomBytes32();
          const holderSecret = hex32ToBytes(asHex32(bidder.holderSecret));
          const privateState = createProcurementPreviewPrivateState({
            ownerSecret,
            holderSecret,
            revocationSecret: hex32ToBytes(asHex32(bidder.revocationSecret)),
            bidAmount: input.amount,
            bidSalt: salt,
          });
          const { callProcurementCircuit, confirmCompanionField, readProcurementLedger, writeProcurementPrivateState } =
            await import("@velios/midnight/companion-client");
          await writeProcurementPrivateState(providers as LooseProviders, contracts.procurement, privateState);
          const submitted = await callProcurementCircuit(
            providers,
            contracts.procurement,
            "submitBid",
            [hex32ToBytes(asHex32(input.procurementId))],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const commitment = bidCommitment({
            procurementId: hex32ToBytes(asHex32(input.procurementId)),
            holder: holderCommitment(holderSecret),
            amount: input.amount,
            salt,
          });
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.procurement,
            readLedger: () => readProcurementLedger(providers as LooseProviders, contracts.procurement!),
            present: (view) => view.bidCommitments.length > 0,
          });
          const bid: StoredBidRecord = {
            procurementId: input.procurementId,
            amount: input.amount.toString(),
            salt: bytesToHex32(salt),
            holderSecret: bidder.holderSecret,
            revocationSecret: bidder.revocationSecret,
            bidCommitment: bytesToHex32(commitment),
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, bids: [...vaultRef.current.bids, bid] });
          if (confirmed.view) setProcurement(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      awardProcurement: (input) =>
        runCall(async () => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          if (!economyAddress) throw new Error("economy contract missing");
          const authorized = economy?.authorizations.some((row) => row.actionId === input.treasuryActionId);
          if (!authorized) throw new Error("Treasury authorization missing on economy-preview.");
          const winner = vaultRef.current.bids.find((item) => item.procurementId === input.procurementId);
          if (!winner) throw new Error("This vault has no sealed bid opening for the award proof.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("procurementOwnerSecret");
          const awardSalt = randomBytes32();
          const privateState = createProcurementPreviewPrivateState({
            ownerSecret,
            awardSalt,
          });
          const { callProcurementCircuit, confirmCompanionField, readProcurementLedger, writeProcurementPrivateState } =
            await import("@velios/midnight/companion-client");
          await writeProcurementPrivateState(providers as LooseProviders, contracts.procurement, privateState);
          const submitted = await callProcurementCircuit(
            providers,
            contracts.procurement,
            "awardProcurement",
            [
              hex32ToBytes(asHex32(input.procurementId)),
              hex32ToBytes(asHex32(winner.bidCommitment)),
              hex32ToBytes(asHex32(input.treasuryActionId)),
            ],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.procurement,
            readLedger: () => readProcurementLedger(providers as LooseProviders, contracts.procurement!),
            present: (view) =>
              view.lots.some((row) => row.procurementId === input.procurementId && row.status === "awarded"),
          });
          if (confirmed.view) setProcurement(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      recordDisclosure: (input) =>
        runCall(async () => {
          if (!contracts.auditor) throw new Error("Deploy the auditor-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = await ensureOwnerSecret("auditorOwnerSecret");
          const disclosureId = newActionId();
          const auditorId = randomBytes32();
          const nonce = randomBytes32();
          const window = currentAuthorizationWindow();
          const expires = window.periodEnd + BigInt(input.expiresHours) * 3600n;
          const scope = disclosureScopeCommitment({
            auditorId,
            claims: new TextEncoder().encode(input.auditorLabel.padEnd(32, "\0")).slice(0, 32),
            nonce,
          });
          const privateState = createAuditorPreviewPrivateState({ ownerSecret });
          const { callAuditorCircuit, confirmCompanionField, readAuditorLedger, writeAuditorPrivateState } = await import(
            "@velios/midnight/companion-client"
          );
          await writeAuditorPrivateState(providers as LooseProviders, contracts.auditor, privateState);
          const submitted = await callAuditorCircuit(
            providers,
            contracts.auditor,
            "recordDisclosure",
            [hex32ToBytes(disclosureId), auditorId, scope, expires],
            { compiledAssetsPath: COMPILED_ASSETS },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          const confirmed = await confirmCompanionField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: contracts.auditor,
            readLedger: () => readAuditorLedger(providers as LooseProviders, contracts.auditor!),
            present: (view) => view.disclosures.some((row) => row.disclosureId === disclosureId),
          });
          if (confirmed.view) setAuditor(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
            message: disclosureId,
          };
        }),
    }),
    [
      auditor,
      busy,
      contracts,
      economy,
      economyAddress,
      ensureOwnerSecret,
      governance,
      lastResult,
      ledgerError,
      network.networkId,
      organizationName,
      persistVault,
      procurement,
      publicStore.agents,
      refreshLedgers,
      requireProviders,
      runCall,
      selection,
      vault,
      vaultReady,
    ],
  );

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy(): EconomyValue {
  const value = useContext(EconomyContext);
  if (!value) throw new Error("economy session missing");
  return value;
}
