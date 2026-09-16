import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createAuditorPreviewPrivateState,
  createEconomyPreviewPrivateState,
  createGovernancePreviewPrivateState,
  createProcurementPreviewPrivateState,
} from "@velios/contracts";
import { credentialCommitment, holderCommitment, revocationNullifier } from "@velios/credentials";
import { addressCommitment, bidCommitment, disclosureScopeCommitment, settlementDisclosureCopy, voteNullifier } from "@velios/economy";
import {
  currentAuthorizationWindow,
  randomBytes32,
  reasonDigest,
  spendBucketMayOpen,
} from "@velios/policy-engine";
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
import { contractRole, stripPublishedWriteAddress, type ContractRole } from "../lib/wave2-ownership.js";
import { readWave2Contracts, writeWave2Contracts, type Wave2ContractSelection } from "../lib/wave2-contracts.js";

const COMPILED_ASSETS = ".";

export type Wave2Status =
  | "idle"
  | "wallet"
  | "proving"
  | "submitted"
  | "indexing"
  | "working"
  | "confirmed"
  | "refused"
  | "stale"
  | "failed";

export type Wave2VaultStatus = "missing" | "locked" | "ready" | "mismatch";

export type Wave2Ownership = {
  economy: ContractRole;
  governance: ContractRole;
  procurement: ContractRole;
  auditor: ContractRole;
};

type Wave2Progress = (status: Wave2Status, extra?: Partial<Wave2CallResult>) => void;

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
  publishedEconomy: ReturnType<typeof publishedEconomyDeploymentFor>;
  ownership: Wave2Ownership;
  economy: EconomyLedgerView | null;
  governance: GovernanceLedgerView | null;
  procurement: ProcurementLedgerView | null;
  auditor: AuditorLedgerView | null;
  ledgerError: string | null;
  lastResult: Wave2CallResult;
  vault: Wave2VaultPayload;
  vaultReady: boolean;
  wave2VaultStatus: Wave2VaultStatus;
  createWave2Vault: () => Promise<void>;
  unlockWave2Vault: (passphrase: string) => Promise<void>;
  busy: boolean;
  refreshLedgers: () => Promise<void>;
  deployEconomy: () => Promise<Wave2CallResult>;
  deployGovernance: () => Promise<Wave2CallResult>;
  deployProcurement: () => Promise<Wave2CallResult>;
  deployAuditor: () => Promise<Wave2CallResult>;
  issueCredential: (input: {
    className: CredentialClass;
    expiryDays: number;
    recipient?: string;
    perActionLimit?: bigint;
    dailyLimit?: bigint;
  }) => Promise<Wave2CallResult>;
  revokeCredential: (commitment: string) => Promise<Wave2CallResult>;
  authorizeTreasuryPayment: (input: {
    amount: bigint;
    recipient: string;
    reason: string;
  }) => Promise<Wave2CallResult>;
  depositNight: (amount: bigint) => Promise<Wave2CallResult>;
  settlePayment: (actionId: string) => Promise<Wave2CallResult>;
  registerVoter: () => Promise<Wave2CallResult>;
  createProposal: (input: { durationSeconds: number }) => Promise<Wave2CallResult>;
  castBallot: (input: {
    proposalId: string;
    choice: 0n | 1n;
    voterCommitment?: string;
  }) => Promise<Wave2CallResult>;
  finalizeProposal: (proposalId: string) => Promise<Wave2CallResult>;
  registerBidder: () => Promise<Wave2CallResult>;
  createProcurement: (input: { durationSeconds: number }) => Promise<Wave2CallResult>;
  submitBid: (input: {
    procurementId: string;
    amount: bigint;
    bidderCommitment?: string;
  }) => Promise<Wave2CallResult>;
  awardProcurement: (input: {
    procurementId: string;
    treasuryActionId: string;
    winnerBidCommitment?: string;
  }) => Promise<Wave2CallResult>;
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
  const [wave2VaultStatus, setWave2VaultStatus] = useState<Wave2VaultStatus>(isVitestRuntime() ? "ready" : "missing");
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState<{ settlementActionId?: string; acknowledgedLeakage: boolean }>({
    acknowledgedLeakage: false,
  });
  const vaultRef = useRef(vault);
  const callBusyRef = useRef(false);
  vaultRef.current = vault;

  const writeEconomyAddress = contracts.economy;
  const economyReadAddress = writeEconomyAddress ?? publishedEconomy?.contractAddress;
  const organizationName = publicStore.organizationName || publishedEconomy?.organizationName || DEMO_ORG_NAME;
  const ownership = useMemo<Wave2Ownership>(
    () => ({
      economy: contractRole({
        address: writeEconomyAddress ?? publishedEconomy?.contractAddress,
        ownerSecret: vault.economyOwnerSecret,
        publishedAddress: publishedEconomy?.contractAddress,
      }),
      governance: contractRole({ address: contracts.governance, ownerSecret: vault.governanceOwnerSecret }),
      procurement: contractRole({ address: contracts.procurement, ownerSecret: vault.procurementOwnerSecret }),
      auditor: contractRole({ address: contracts.auditor, ownerSecret: vault.auditorOwnerSecret }),
    }),
    [
      contracts.auditor,
      contracts.governance,
      contracts.procurement,
      publishedEconomy?.contractAddress,
      vault.auditorOwnerSecret,
      vault.economyOwnerSecret,
      vault.governanceOwnerSecret,
      vault.procurementOwnerSecret,
      writeEconomyAddress,
    ],
  );

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
        economy: stripPublishedWriteAddress(
          stored.economy,
          publishedEconomy?.contractAddress,
          vaultRef.current.economyOwnerSecret,
        ),
      });
      return;
    }
    setContracts({
      networkId: network.networkId,
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
      setWave2VaultStatus(readEncryptedWave2Vault(network.networkId) ? "locked" : "missing");
      return;
    }
    const encrypted = readEncryptedWave2Vault(network.networkId);
    if (!encrypted) {
      setVault(emptyWave2Vault());
      setVaultReady(false);
      setWave2VaultStatus("missing");
      return;
    }
    void withOperatorPassphrase(async (passphrase) => {
      try {
        setVault(await decryptWave2Vault(encrypted, passphrase));
        setVaultReady(true);
        setWave2VaultStatus("ready");
      } catch {
        setVault(emptyWave2Vault());
        setVaultReady(false);
        setWave2VaultStatus("mismatch");
      }
    }).catch(() => {
      setVaultReady(false);
      setWave2VaultStatus("locked");
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
      if (economyReadAddress) {
        const { readEconomyLedger } = await import("@velios/midnight/economy-client");
        setEconomy(await readEconomyLedger(providers, economyReadAddress));
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
  }, [contracts.auditor, contracts.governance, contracts.procurement, economyReadAddress, indexerProviders]);

  useEffect(() => {
    void refreshLedgers();
  }, [refreshLedgers]);

  const requireProviders = useCallback(() => {
    if (!midnightProviders) throw new Error("Connect a Midnight wallet first.");
    return midnightProviders;
  }, [midnightProviders]);

  const runCall = useCallback(async (work: (progress: Wave2Progress) => Promise<Wave2CallResult>): Promise<Wave2CallResult> => {
    if (callBusyRef.current) {
      return { status: "refused", message: "Another Wave 2 transaction is already in progress." };
    }
    callBusyRef.current = true;
    setBusy(true);
    const progress: Wave2Progress = (status, extra) => setLastResult({ status, ...extra });
    progress("wallet");
    try {
      const result = await work(progress);
      setLastResult(result);
      return result;
    } catch (error) {
      const result: Wave2CallResult = { status: "refused", message: publicError(error, "REFUSED") };
      setLastResult(result);
      return result;
    } finally {
      callBusyRef.current = false;
      setBusy(false);
    }
  }, []);

  const requireOwnerSecret = useCallback(
    (field: "economyOwnerSecret" | "governanceOwnerSecret" | "procurementOwnerSecret" | "auditorOwnerSecret") => {
      const current = vaultRef.current[field];
      if (!current) {
        throw new Error("This vault did not deploy that contract. Deploy your own Preview contract to operate write circuits.");
      }
      return hex32ToBytes(asHex32(current));
    },
    [],
  );

  const mintOwnerSecret = useCallback(
    async (field: "economyOwnerSecret" | "governanceOwnerSecret" | "procurementOwnerSecret" | "auditorOwnerSecret") => {
      const nextSecret = secretHex();
      await persistVault({ ...vaultRef.current, [field]: nextSecret });
      return hex32ToBytes(asHex32(nextSecret));
    },
    [persistVault],
  );

  const createWave2Vault = useCallback(async () => {
    await persistVault(emptyWave2Vault());
    setVaultReady(true);
    setWave2VaultStatus("ready");
  }, [persistVault]);

  const unlockWave2Vault = useCallback(
    async (passphrase: string) => {
      const encrypted = readEncryptedWave2Vault(network.networkId);
      if (!encrypted) {
        await encryptWave2Vault(emptyWave2Vault(), passphrase, network.networkId);
        setVault(emptyWave2Vault());
        setVaultReady(true);
        setWave2VaultStatus("ready");
        return;
      }
      const opened = await decryptWave2Vault(encrypted, passphrase);
      setVault(opened);
      vaultRef.current = opened;
      setVaultReady(true);
      setWave2VaultStatus("ready");
      try {
        await persistVault(opened);
      } catch {
        await encryptWave2Vault(opened, passphrase, network.networkId);
      }
    },
    [network.networkId, persistVault],
  );

  const value = useMemo<EconomyValue>(
    () => ({
      selection,
      acknowledgeLeakage: () => setSelection((prev) => ({ ...prev, acknowledgedLeakage: true })),
      selectSettlement: (actionId) => setSelection((prev) => ({ ...prev, settlementActionId: actionId })),
      disclosure: settlementDisclosureCopy(),
      contracts,
      publishedEconomy,
      ownership,
      economy,
      governance,
      procurement,
      auditor,
      ledgerError,
      lastResult,
      vault,
      vaultReady,
      wave2VaultStatus,
      createWave2Vault,
      unlockWave2Vault,
      busy,
      refreshLedgers,
      deployEconomy: () =>
        runCall(async (progress) => {
          const providers = requireProviders();
          progress("proving");
          const ownerSecret = await mintOwnerSecret("economyOwnerSecret");
          const privateState = createEconomyPreviewPrivateState({ ownerSecret });
          const { deployEconomyOrganization, writeEconomyPrivateState, confirmEconomyField, readEconomyLedger } =
            await import("@velios/midnight/economy-client");
          const deployed = await deployEconomyOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          progress("submitted", { txId: deployed.txId });
          await writeEconomyPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, networkId: network.networkId, economy: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, economyOwnerSecret: bytesToHex32(ownerSecret) });
          progress("indexing", { txId: deployed.txId });
          const confirmed = await confirmEconomyField({
            status: deployed.status,
            txId: deployed.txId,
            contractAddress: deployed.contractAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, deployed.contractAddress),
            present: (view) => view.contractAddress === deployed.contractAddress,
          });
          if (confirmed.view) setEconomy(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: deployed.txId,
            message: deployed.contractAddress,
          };
        }),
      deployGovernance: () =>
        runCall(async (progress) => {
          const providers = requireProviders();
          progress("proving");
          const ownerSecret = await mintOwnerSecret("governanceOwnerSecret");
          const privateState = createGovernancePreviewPrivateState({ ownerSecret });
          const { deployGovernanceOrganization, writeGovernancePrivateState, confirmCompanionField, readGovernanceLedger } =
            await import("@velios/midnight/companion-client");
          const deployed = await deployGovernanceOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          progress("submitted", { txId: deployed.txId });
          await writeGovernancePrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, governance: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, governanceOwnerSecret: bytesToHex32(ownerSecret) });
          progress("indexing", { txId: deployed.txId });
          const confirmed = await confirmCompanionField({
            status: deployed.status,
            txId: deployed.txId,
            contractAddress: deployed.contractAddress,
            readLedger: () => readGovernanceLedger(providers as LooseProviders, deployed.contractAddress),
            present: (view) => view.contractAddress === deployed.contractAddress,
          });
          if (confirmed.view) setGovernance(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: deployed.txId,
            message: deployed.contractAddress,
          };
        }),
      deployProcurement: () =>
        runCall(async (progress) => {
          const providers = requireProviders();
          progress("proving");
          const ownerSecret = await mintOwnerSecret("procurementOwnerSecret");
          const privateState = createProcurementPreviewPrivateState({ ownerSecret });
          const {
            deployProcurementOrganization,
            writeProcurementPrivateState,
            confirmCompanionField,
            readProcurementLedger,
          } = await import("@velios/midnight/companion-client");
          const deployed = await deployProcurementOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          progress("submitted", { txId: deployed.txId });
          await writeProcurementPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, procurement: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, procurementOwnerSecret: bytesToHex32(ownerSecret) });
          progress("indexing", { txId: deployed.txId });
          const confirmed = await confirmCompanionField({
            status: deployed.status,
            txId: deployed.txId,
            contractAddress: deployed.contractAddress,
            readLedger: () => readProcurementLedger(providers as LooseProviders, deployed.contractAddress),
            present: (view) => view.contractAddress === deployed.contractAddress,
          });
          if (confirmed.view) setProcurement(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: deployed.txId,
            message: deployed.contractAddress,
          };
        }),
      deployAuditor: () =>
        runCall(async (progress) => {
          const providers = requireProviders();
          progress("proving");
          const ownerSecret = await mintOwnerSecret("auditorOwnerSecret");
          const privateState = createAuditorPreviewPrivateState({ ownerSecret });
          const { deployAuditorOrganization, writeAuditorPrivateState, confirmCompanionField, readAuditorLedger } =
            await import("@velios/midnight/companion-client");
          const deployed = await deployAuditorOrganization(providers, organizationName, privateState, {
            compiledAssetsPath: COMPILED_ASSETS,
          });
          progress("submitted", { txId: deployed.txId });
          await writeAuditorPrivateState(providers as LooseProviders, deployed.contractAddress, privateState);
          setContracts((prev) => ({ ...prev, auditor: deployed.contractAddress }));
          await persistVault({ ...vaultRef.current, auditorOwnerSecret: bytesToHex32(ownerSecret) });
          progress("indexing", { txId: deployed.txId });
          const confirmed = await confirmCompanionField({
            status: deployed.status,
            txId: deployed.txId,
            contractAddress: deployed.contractAddress,
            readLedger: () => readAuditorLedger(providers as LooseProviders, deployed.contractAddress),
            present: (view) => view.contractAddress === deployed.contractAddress,
          });
          if (confirmed.view) setAuditor(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: deployed.txId,
            message: deployed.contractAddress,
          };
        }),
      issueCredential: (input) =>
        runCall(async (progress) => {
          if (!writeEconomyAddress) throw new Error("Deploy or join an economy-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("economyOwnerSecret");
          const holderSecret = randomBytes32();
          const salt = randomBytes32();
          const revocationSecret = randomBytes32();
          const orgId = economy?.organizationId
            ? hex32ToBytes(economy.organizationId)
            : hex32ToBytes(organizationIdFromName(organizationName));
          const window = currentAuthorizationWindow();
          const expiry = window.periodEnd + BigInt(input.expiryDays) * 86_400n;
          const vendor =
            input.className === "treasury"
              ? addressCommitment(parseUserAddressBytes(input.recipient ?? "", network.networkId))
              : new Uint8Array(32);
          const perActionLimit = input.className === "treasury" ? (input.perActionLimit ?? 0n) : 0n;
          const dailyLimit = input.className === "treasury" ? (input.dailyLimit ?? 0n) : 0n;
          if (input.className === "treasury" && (perActionLimit <= 0n || dailyLimit <= 0n)) {
            throw new Error("Treasury credentials must commit a per-action limit and daily cap.");
          }
          const commitment = credentialCommitment({
            holderSecret,
            organizationId: orgId,
            className: input.className,
            expiry,
            salt,
            vendorId: vendor,
            perActionLimit,
            dailyLimit,
          });
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret,
            credentialClass: classId(input.className),
            credentialExpiry: expiry,
            credentialSalt: salt,
            revocationSecret,
            vendorId: vendor,
            perActionLimit,
            dailyLimit,
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, writeEconomyAddress, privateState);
          const submitted = await callEconomyCircuit(providers, writeEconomyAddress, "issueCredential", [commitment], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) {
            return { status: "refused", txId: submitted.txId, message: submitted.status };
          }
          progress("indexing", { txId: submitted.txId });
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: writeEconomyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, writeEconomyAddress),
            present: (view) => view.credentialCommitments.includes(bytesToHex32(commitment)),
          });
          const record: StoredCredentialRecord = {
            commitment: bytesToHex32(commitment),
            className: input.className,
            expiry: expiry.toString(),
            holderSecret: bytesToHex32(holderSecret),
            salt: bytesToHex32(salt),
            revocationSecret: bytesToHex32(revocationSecret),
            vendorCommitment: bytesToHex32(vendor),
            perActionLimit: perActionLimit.toString(),
            dailyLimit: dailyLimit.toString(),
            txId: submitted.txId,
          };
          await persistVault({ ...vaultRef.current, credentials: [...vaultRef.current.credentials, record] });
          if (confirmed.view) setEconomy(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      revokeCredential: (commitmentHex) =>
        runCall(async (progress) => {
          if (!writeEconomyAddress) throw new Error("economy contract missing");
          const providers = requireProviders();
          const record = vaultRef.current.credentials.find((item) => item.commitment === commitmentHex);
          if (!record) throw new Error("Unlock the operator vault that issued this credential.");
          const ownerSecret = requireOwnerSecret("economyOwnerSecret");
          const commitment = hex32ToBytes(asHex32(record.commitment));
          const nullifier = revocationNullifier(commitment);
          const privateState = createEconomyPreviewPrivateState({
            ownerSecret,
            holderSecret: hex32ToBytes(asHex32(record.holderSecret)),
            credentialSalt: hex32ToBytes(asHex32(record.salt)),
            revocationSecret: hex32ToBytes(asHex32(record.revocationSecret)),
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, writeEconomyAddress, privateState);
          const submitted = await callEconomyCircuit(providers, writeEconomyAddress, "revokeCredential", [nullifier], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          progress("indexing", { txId: submitted.txId });
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: writeEconomyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, writeEconomyAddress),
            present: (view) => view.revokedNullifiers.includes(bytesToHex32(nullifier)),
          });
          if (confirmed.view) setEconomy(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      authorizeTreasuryPayment: (input) =>
        runCall(async (progress) => {
          if (!writeEconomyAddress) throw new Error("economy contract missing");
          const treasury = vaultRef.current.credentials.find((item) => item.className === "treasury");
          if (!treasury) throw new Error("Issue a treasury credential first.");
          if (!treasury.vendorCommitment || !treasury.perActionLimit || !treasury.dailyLimit) {
            throw new Error("Re-issue the treasury credential so vendor and limits are bound into the commitment.");
          }
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("economyOwnerSecret");
          const recipientBytes = parseUserAddressBytes(input.recipient, network.networkId);
          const vendor = addressCommitment(recipientBytes);
          if (bytesToHex32(vendor) !== treasury.vendorCommitment) {
            throw new Error("Recipient does not match the vendor bound into the treasury credential.");
          }
          const window = currentAuthorizationWindow();
          const now = window.periodStart + 1n;
          const spend = vaultRef.current.treasurySpend;
          const spendPeriodStart = spend ? BigInt(spend.periodStart) : 0n;
          const spendDaily = spend ? BigInt(spend.dailySpend) : 0n;
          const spendSalt = spend ? hex32ToBytes(asHex32(spend.spendSalt)) : new Uint8Array(32);
          if (!spendBucketMayOpen(spendPeriodStart, window, now)) {
            throw new Error("The committed daily spend window has not elapsed.");
          }
          const perActionLimit = BigInt(treasury.perActionLimit);
          const dailyLimit = BigInt(treasury.dailyLimit);
          const carried = spendPeriodStart === window.periodStart ? spendDaily : 0n;
          const nextSpend = carried + input.amount;
          if (input.amount > perActionLimit || nextSpend > dailyLimit) {
            throw new Error("Amount exceeds the limits bound into the treasury credential.");
          }
          const actionId = newActionId();
          const agentId = publicStore.agents[0]?.agentId ?? asHex32("11".repeat(32));
          const intentSalt = randomBytes32();
          const nextSpendSalt = randomBytes32();
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
            perActionLimit,
            dailyLimit,
            spendPeriodStart,
            spendDaily,
            spendSalt,
            nextSpendSalt,
          });
          const { callEconomyCircuit, confirmEconomyField, readEconomyLedger, writeEconomyPrivateState } = await import(
            "@velios/midnight/economy-client"
          );
          await writeEconomyPrivateState(providers as LooseProviders, writeEconomyAddress, privateState);
          const submitted = await callEconomyCircuit(
            providers,
            writeEconomyAddress,
            "authorizePayment",
            [hex32ToBytes(agentId), hex32ToBytes(actionId), input.amount, vendor, window.periodStart, window.periodEnd],
            { compiledAssetsPath: COMPILED_ASSETS, preview: true },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          progress("indexing", { txId: submitted.txId });
          const confirmed = await confirmEconomyField({
            status: submitted.status,
            txId: submitted.txId,
            contractAddress: writeEconomyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, writeEconomyAddress),
            present: (view) => view.authorizations.some((row) => row.actionId === actionId),
          });
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
            perActionLimit: perActionLimit.toString(),
            dailyLimit: dailyLimit.toString(),
            spendPeriodStart: window.periodStart.toString(),
            spendDaily: nextSpend.toString(),
            txId: submitted.txId,
          };
          await persistVault({
            ...vaultRef.current,
            payments: [...vaultRef.current.payments, payment],
            treasurySpend: {
              periodStart: window.periodStart.toString(),
              dailySpend: nextSpend.toString(),
              spendSalt: bytesToHex32(nextSpendSalt),
            },
          });
          setSelection((prev) => ({ ...prev, settlementActionId: actionId }));
          if (confirmed.view) setEconomy(confirmed.view);
          return {
            status: confirmed.kind === "confirmed" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
            message: actionId,
          };
        }),
      depositNight: (amount) =>
        runCall(async (progress) => {
          if (!writeEconomyAddress) throw new Error("economy contract missing");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("economyOwnerSecret");
          const privateState = createEconomyPreviewPrivateState({ ownerSecret });
          const { callEconomyCircuit, writeEconomyPrivateState } = await import("@velios/midnight/economy-client");
          await writeEconomyPrivateState(providers as LooseProviders, writeEconomyAddress, privateState);
          progress("proving");
          const submitted = await callEconomyCircuit(providers, writeEconomyAddress, "depositNight", [amount], {
            compiledAssetsPath: COMPILED_ASSETS,
            preview: true,
          });
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          progress("indexing", { txId: submitted.txId });
          await refreshLedgers();
          return {
            status: "submitted",
            txId: submitted.txId,
            message:
              "Unshielded deposit submitted. Compact has no unique public deposit row; confirmation is SucceedEntirely.",
          };
        }),
      settlePayment: (actionId) =>
        runCall(async (progress) => {
          if (!writeEconomyAddress) throw new Error("economy contract missing");
          if (!selection.acknowledgedLeakage) throw new Error("Acknowledge unshielded leakage first.");
          const payment = vaultRef.current.payments.find((item) => item.actionId === actionId);
          if (!payment) throw new Error("This tab does not hold the private intent for that authorization.");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("economyOwnerSecret");
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
          await writeEconomyPrivateState(providers as LooseProviders, writeEconomyAddress, privateState);
          const submitted = await callEconomyCircuit(
            providers,
            writeEconomyAddress,
            "settleAuthorizedPayment",
            [hex32ToBytes(asHex32(actionId)), BigInt(payment.amount), compactUserAddress(recipientBytes)],
            { compiledAssetsPath: COMPILED_ASSETS, preview: true },
          );
          if (!submitted.submitted) return { status: "refused", txId: submitted.txId, message: submitted.status };
          progress("indexing", { txId: submitted.txId });
          const confirmed = await confirmEconomySettlement({
            status: submitted.status,
            txId: submitted.txId,
            actionId,
            contractAddress: writeEconomyAddress,
            readLedger: () => readEconomyLedger(providers as LooseProviders, writeEconomyAddress),
          });
          await refreshLedgers();
          return {
            status: confirmed.kind === "settled" ? "confirmed" : confirmed.kind === "stale" ? "stale" : "failed",
            txId: submitted.txId,
          };
        }),
      registerVoter: () =>
        runCall(async (progress) => {
          if (!contracts.governance) throw new Error("Deploy the governance-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("governanceOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("governanceOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const voter = input.voterCommitment
            ? vaultRef.current.voters.find((item) => item.holderCommitment === input.voterCommitment)
            : vaultRef.current.voters.length === 1
              ? vaultRef.current.voters[0]
              : undefined;
          if (!voter) {
            throw new Error(
              vaultRef.current.voters.length > 1
                ? "Select the voter credential to use for this ballot."
                : "Register a voter in this vault first.",
            );
          }
          if (
            vaultRef.current.ballots.some(
              (item) => item.proposalId === input.proposalId && item.holderSecret === voter.holderSecret,
            )
          ) {
            throw new Error("This voter credential already has a local ballot for that proposal.");
          }
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("governanceOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.governance) throw new Error("governance contract missing");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("governanceOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.procurement) throw new Error("Deploy the procurement-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("procurementOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("procurementOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          const bidder = input.bidderCommitment
            ? vaultRef.current.bidders.find((item) => item.holderCommitment === input.bidderCommitment)
            : vaultRef.current.bidders.length === 1
              ? vaultRef.current.bidders[0]
              : undefined;
          if (!bidder) {
            throw new Error(
              vaultRef.current.bidders.length > 1
                ? "Select the bidder credential to use for this sealed bid."
                : "Register a bidder in this vault first.",
            );
          }
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("procurementOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
            present: (view) => view.bidCommitments.includes(bytesToHex32(commitment)),
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
        runCall(async (progress) => {
          if (!contracts.procurement) throw new Error("procurement contract missing");
          if (!writeEconomyAddress) throw new Error("economy contract missing");
          const authorized = economy?.authorizations.some((row) => row.actionId === input.treasuryActionId);
          if (!authorized) throw new Error("Treasury authorization missing on economy-preview.");
          const matchingBids = vaultRef.current.bids.filter((item) => item.procurementId === input.procurementId);
          const winner = input.winnerBidCommitment
            ? matchingBids.find((item) => item.bidCommitment === input.winnerBidCommitment)
            : matchingBids.length === 1
              ? matchingBids[0]
              : undefined;
          if (!winner) {
            throw new Error(
              matchingBids.length > 1
                ? "Select the winning sealed bid before proving the award."
                : "This vault has no sealed bid opening for the award proof.",
            );
          }
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("procurementOwnerSecret");
          const awardSalt = randomBytes32();
          const privateState = createProcurementPreviewPrivateState({
            ownerSecret,
            awardSalt,
            winnerHolder: holderCommitment(hex32ToBytes(asHex32(winner.holderSecret))),
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
          progress("indexing", { txId: submitted.txId });
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
        runCall(async (progress) => {
          if (!contracts.auditor) throw new Error("Deploy the auditor-preview contract first.");
          const providers = requireProviders();
          const ownerSecret = requireOwnerSecret("auditorOwnerSecret");
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
          progress("indexing", { txId: submitted.txId });
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
      writeEconomyAddress,
      createWave2Vault,
      mintOwnerSecret,
      ownership,
      publishedEconomy,
      requireOwnerSecret,
      unlockWave2Vault,
      wave2VaultStatus,
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
