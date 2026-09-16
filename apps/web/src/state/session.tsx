import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  agentIdFromLabel,
  memberIdFromLabel,
  newActionId,
  organizationIdFromName,
  roleLabelToBytes,
  vendorIdFromRecipient,
} from "@velios/midnight/ids";
import type { PublicLedgerView } from "@velios/midnight/ledger-view";
import { getNetworkConfig, type NetworkConfig } from "@velios/midnight/network";
import { publishedDeploymentFor, type PublishedDeployment } from "@velios/midnight/published";
import { explainCaughtError } from "@velios/midnight/status";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { connectBrowserWallet, listWallets, type BrowserWalletSnapshot } from "@velios/midnight/browser";
import {
  currentAuthorizationWindow,
  previewAuthorize,
  randomBytes32,
  windowIsSafeToSubmit,
  type AuthorizationWindow,
} from "@velios/policy-engine";
import type {
  ActionOperation,
  Hex32,
  OperatorMatch,
  PaymentIntent,
  PublicAction,
  PublicAgent,
  PublicMember,
  PublicOrganization,
  VeliosPrivateState,
  WorkspaceMode,
} from "@velios/shared-types";
import { asHex32, bytesToHex32 } from "@velios/shared-types";
import { matchOperatorToLedger } from "../lib/commitment-match.js";
import { expectedSpendAfterAuthorization } from "../lib/expected-spend.js";
import { paymentIntentCommitment } from "../lib/intent.js";
import { deriveCurrentTask, type CurrentTask, type ReadinessItem } from "../lib/journey.js";
import {
  emptyJournal,
  journalToOperations,
  removeJournalEntry,
  upsertJournalEntry,
  type OperationJournal,
} from "../lib/operation-journal.js";
import {
  decryptOperatorVaultBundle,
  downloadEncryptedVault,
  encryptOperatorVault,
  isEncryptedVault,
  listVaultContracts,
  PENDING_VAULT_ADDRESS,
  readEncryptedVault,
  writeEncryptedVault,
} from "../lib/operator-vault.js";
import { reconcileJournal } from "../lib/reconcile-journal.js";
import { selectedAgent, selectedMember } from "../lib/session-entities.js";
import { readWorkspaceSelection, writeWorkspaceSelection } from "../lib/workspace.js";

const AUTO_LOCK_MS = 15 * 60 * 1000;

export const DEMO_ORG_NAME = "ACME AUTONOMOUS SYSTEMS";
export const DEMO_AGENT_LABEL = "TREASURY-01";
export const DEMO_RECIPIENT = "supplier-8271";
export const DEMO_MEMBER_LABEL = "FOUNDING-MEMBER";
export const DEMO_AGENT_ROLE = "Treasury Operator";
const CREDENTIAL_LIFETIME_SECONDS = 30n * 86_400n;

export type PublicStore = {
  organization: PublicOrganization | null;
  organizationName: string;
  members: PublicMember[];
  agents: PublicAgent[];
  actions: PublicAction[];
  contractAddress?: string | undefined;
  ledgerSync: "none" | "pending" | "confirmed";
};

export type OperatorPolicyDraft = {
  perActionLimit: bigint;
  dailyLimit: bigint;
  recipient: string;
};

export type VaultStatus = "missing" | "locked" | "unlocked" | "dev_available";

export type SetupDraft = {
  organizationName: string;
  memberLabel: string;
};

export type PolicyDraft = {
  agentLabel: string;
  perAction: string;
  daily: string;
  recipient: string;
};

export type AuthDraft = {
  recipient: string;
  amount: string;
  reason: string;
};

export type SessionValue = {
  network: NetworkConfig;
  networkLive: boolean | null;
  wallet: BrowserWalletSnapshot | null;
  publicStore: PublicStore;
  published: PublishedDeployment | null;
  workspaceMode: WorkspaceMode;
  selectedContract?: string | undefined;
  selectedMemberId?: string | undefined;
  selectedAgentId?: string | undefined;
  selectEntities: (input: { memberId?: string; agentId?: string }) => void;
  operations: Record<string, ActionOperation>;
  lastIntent: PaymentIntent | null;
  lastWindow: AuthorizationWindow | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  walletError: string | null;
  ledgerError: string | null;
  busyAction: "idle" | "createAgent" | "refresh" | "join" | "policy" | "payment" | "deploy" | "connect" | "vault" | "economy" | "governance" | "procurement" | "auditor";
  midnightProviders: unknown;
  withOperatorPassphrase: <T>(fn: (passphrase: string) => Promise<T>) => Promise<T>;
  dustReady: boolean | null;
  choosePreview: () => void;
  startOwnerSetup: () => void;
  setupDraft: SetupDraft;
  setSetupDraft: (draft: SetupDraft) => void;
  policyDraft: PolicyDraft;
  setPolicyDraft: (draft: PolicyDraft) => void;
  authDraft: AuthDraft;
  setAuthDraft: (draft: AuthDraft) => void;
  vaultStatus: VaultStatus;
  createVault: (passphrase: string) => Promise<void>;
  unlockVault: (passphrase: string) => Promise<void>;
  lockVault: () => void;
  importOperatorState: (file: File, passphrase: string) => Promise<void>;
  exportOperatorState: () => Promise<void>;
  applyPolicyDraft: (input: OperatorPolicyDraft) => Promise<void>;
  previewPayment: (input: { recipient: string; amount: bigint }) => { allowed: boolean; code: string };
  selectWorkspace: (mode: WorkspaceMode, contractAddress?: string) => void;
  joinPublished: () => Promise<void>;
  refreshLedger: () => Promise<void>;
  createOrganization: (name: string, memberLabel: string) => Promise<boolean>;
  createAgent: (label: string) => Promise<boolean>;
  configurePolicy: (input: OperatorPolicyDraft) => Promise<boolean>;
  requestPayment: (input: { recipient: string; amount: bigint; reason: string }) => Promise<Hex32>;
  busy: boolean;
  canOperate: boolean;
  circuitReady: boolean;
  operatorStateReady: boolean;
  operatorMatch: OperatorMatch;
  operatorPolicy: OperatorPolicyDraft;
  currentTask: CurrentTask;
  readiness: ReadinessItem[];
  privateDisplay: {
    roleLabel: string;
    selfModifyAllowed: boolean;
    credentialValidForWindow: boolean;
  };
};

const SessionContext = createContext<SessionValue | null>(null);

function generatePrivateState(): VeliosPrivateState {
  const window = currentAuthorizationWindow();
  return {
    ownerSecret: randomBytes32(),
    memberSecret: randomBytes32(),
    agentSecret: randomBytes32(),
    agentRole: roleLabelToBytes(DEMO_AGENT_ROLE),
    roleSalt: randomBytes32(),
    perActionLimit: 0n,
    dailyLimit: 0n,
    vendorId: vendorIdFromRecipient(""),
    credentialOk: true,
    credentialExpiry: window.periodEnd + CREDENTIAL_LIFETIME_SECONDS,
    selfModifyAllowed: false,
    policySalt: randomBytes32(),
    spendPeriodStart: window.periodStart,
    dailySpend: 0n,
    spendSalt: randomBytes32(),
    nextSpendSalt: randomBytes32(),
  };
}

function emptyStore(organizationName: string): PublicStore {
  return {
    organization: null,
    organizationName,
    members: [],
    agents: [],
    actions: [],
    ledgerSync: "none",
  };
}

function applyLedgerView(
  prev: PublicStore,
  view: {
    organization: PublicOrganization;
    members: PublicMember[];
    agents: PublicAgent[];
    actions: PublicAction[];
  },
): PublicStore {
  return {
    ...prev,
    organizationName: prev.organizationName,
    organization: view.organization,
    members: view.members,
    agents: view.agents,
    actions: view.actions,
    contractAddress: view.organization.contractAddress ?? prev.contractAddress,
    ledgerSync: "confirmed",
  };
}

function publicErrorMessage(error: unknown, fallback: string): string {
  return explainCaughtError(error, fallback);
}

function isVitestRuntime(): boolean {
  const env = (import.meta as { env?: { VITEST?: unknown; MODE?: string } }).env;
  return Boolean(env?.VITEST) || env?.MODE === "test";
}

function isDevRuntime(): boolean {
  return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
}

type LooseProviders = {
  publicDataProvider?: { queryContractState: (address: string) => Promise<unknown> };
  privateStateProvider?: { setContractAddress?: (address: string) => void; set?: (id: string, state: unknown) => Promise<void> };
};

async function loadPublicLedger(
  network: NetworkConfig,
  contractAddress: string,
  providers?: unknown,
): Promise<PublicLedgerView> {
  const { publicIndexerProvider, readPublicLedger } = await import("@velios/midnight");
  const active = providers as LooseProviders | undefined;
  return readPublicLedger(
    {
      publicDataProvider: active?.publicDataProvider ?? publicIndexerProvider(network),
    },
    contractAddress,
  );
}

async function primePrivateState(providers: unknown, contractAddress: string, privateState: VeliosPrivateState) {
  const { writeJoinedPrivateState } = await import("@velios/midnight");
  await writeJoinedPrivateState(providers as LooseProviders, contractAddress, privateState);
}

function upsertOperation(
  prev: Record<string, ActionOperation>,
  next: ActionOperation,
): Record<string, ActionOperation> {
  return { ...prev, [next.actionId]: next };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const networkName =
    (import.meta as { env?: { VITE_VELIOS_NETWORK?: string } }).env?.VITE_VELIOS_NETWORK ?? "preview";
  const network = useMemo(() => getNetworkConfig(networkName), [networkName]);
  const published = useMemo(() => publishedDeploymentFor(network.networkId), [network.networkId]);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("unset");
  const [selectedContract, setSelectedContract] = useState<string | undefined>();
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [wallet, setWallet] = useState<BrowserWalletSnapshot | null>(null);
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null);
  const [dustReady, setDustReady] = useState<boolean | null>(null);
  const [providers, setProviders] = useState<unknown>(null);
  const [networkLive, setNetworkLive] = useState<boolean | null>(null);
  const [privateState, setPrivateState] = useState<VeliosPrivateState | null>(isVitestRuntime() ? generatePrivateState() : null);
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>(isVitestRuntime() ? "unlocked" : "missing");
  const [publicStore, setPublicStore] = useState<PublicStore>(() => emptyStore("Organization"));
  const [operations, setOperations] = useState<Record<string, ActionOperation>>({});
  const [lastIntent, setLastIntent] = useState<PaymentIntent | null>(null);
  const [lastWindow, setLastWindow] = useState<AuthorizationWindow | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<SessionValue["busyAction"]>("idle");
  const [setupDraft, setSetupDraft] = useState<SetupDraft>({ organizationName: "", memberLabel: "" });
  const [policyDraft, setPolicyDraft] = useState<PolicyDraft>({
    agentLabel: "",
    perAction: "",
    daily: "",
    recipient: "",
  });
  const [authDraft, setAuthDraft] = useState<AuthDraft>({ recipient: "", amount: "", reason: "" });
  const [recipientLabel, setRecipientLabel] = useState("");
  const [journal, setJournal] = useState<OperationJournal>(emptyJournal);
  const passphraseRef = useRef<string | null>(null);
  const privateStateRef = useRef(privateState);
  const journalRef = useRef(journal);
  const generationRef = useRef(0);
  const workspaceHydrated = useRef(isVitestRuntime());
  privateStateRef.current = privateState;
  journalRef.current = journal;

  const activeContract =
    selectedContract ??
    (workspaceMode === "preview" ? published?.contractAddress : undefined) ??
    publicStore.contractAddress;

  useEffect(() => {
    if (isVitestRuntime()) {
      workspaceHydrated.current = true;
      return;
    }
    const stored = readWorkspaceSelection();
    if (stored && stored.networkId === network.networkId) {
      setWorkspaceMode(stored.mode);
      if (stored.contractAddress) setSelectedContract(stored.contractAddress);
      if (stored.selectedMemberId) setSelectedMemberId(stored.selectedMemberId);
      if (stored.selectedAgentId) setSelectedAgentId(stored.selectedAgentId);
    }
    workspaceHydrated.current = true;
  }, [network.networkId]);

  useEffect(() => {
    if (isVitestRuntime() || !workspaceHydrated.current) return;
    writeWorkspaceSelection({
      mode: workspaceMode,
      networkId: network.networkId,
      contractAddress: selectedContract,
      selectedMemberId,
      selectedAgentId,
    });
  }, [workspaceMode, selectedContract, selectedMemberId, selectedAgentId, network.networkId]);

  useEffect(() => {
    const address = activeContract;
    if (isVitestRuntime() || !address) return;
    setPublicStore((prev) => ({
      ...prev,
      contractAddress: address,
      organizationName:
        address === published?.contractAddress ? published.organizationName : prev.organizationName,
      ledgerSync: prev.ledgerSync === "confirmed" && prev.contractAddress === address ? "confirmed" : "pending",
    }));
    void (async () => {
      try {
        const view = await loadPublicLedger(network, address);
        setPublicStore((prev) =>
          applyLedgerView(
            {
              ...prev,
              organizationName:
                address === published?.contractAddress ? published.organizationName : prev.organizationName,
            },
            view,
          ),
        );
        setLedgerError(null);
      } catch (error) {
        setLedgerError(publicErrorMessage(error, "indexer read failed"));
        setPublicStore((prev) => ({
          ...prev,
          contractAddress: address,
          ledgerSync: prev.organization ? "confirmed" : "none",
        }));
      }
    })();
  }, [activeContract, network, published]);

  useEffect(() => {
    if (isVitestRuntime()) return;
    const address = activeContract;
    if (privateStateRef.current && passphraseRef.current) {
      setVaultStatus("unlocked");
      return;
    }
    const storedAddress = address ?? PENDING_VAULT_ADDRESS;
    if (readEncryptedVault(network.networkId, storedAddress)) {
      setVaultStatus("locked");
      return;
    }
    if (import.meta.env.DEV && isDevRuntime() && address === published?.contractAddress) {
      void import("../lib/operator-state-dev.js")
        .then(({ getDevOperatorState }) => getDevOperatorState())
        .then((response) => {
          setVaultStatus(response.ok ? "dev_available" : "missing");
        })
        .catch(() => {
          setVaultStatus("missing");
        });
      return;
    }
    setVaultStatus("missing");
  }, [activeContract, network.networkId, published]);

  useEffect(() => {
    if (isVitestRuntime() || !providers || !published || !privateState || workspaceMode === "unset") return;
    const address = activeContract;
    if (!address) return;
    void (async () => {
      try {
        const { joinDeployedOrganization } = await import("@velios/midnight");
        await primePrivateState(providers, address, privateState);
        const view = await joinDeployedOrganization(providers, address, privateState);
        setPublicStore((prev) => applyLedgerView(prev, view));
        setLedgerError(null);
      } catch (error) {
        setLedgerError(publicErrorMessage(error, "join failed"));
      }
    })();
  }, [privateState, providers, published, activeContract, workspaceMode]);

  const persistVault = async (
    state: VeliosPrivateState,
    contractAddress: string,
    nextJournal: OperationJournal = journalRef.current,
  ) => {
    const passphrase = passphraseRef.current;
    if (!passphrase) return;
    const vault = await encryptOperatorVault({
      state,
      journal: nextJournal,
      passphrase,
      networkId: network.networkId,
      contractAddress,
    });
    writeEncryptedVault(vault);
  };

  useEffect(() => {
    if (isVitestRuntime() || vaultStatus !== "unlocked") return;
    const lockNow = () => {
      generationRef.current += 1;
      passphraseRef.current = null;
      setPrivateState(null);
      setJournal(emptyJournal());
      const address = activeContract ?? PENDING_VAULT_ADDRESS;
      setVaultStatus(readEncryptedVault(network.networkId, address) ? "locked" : "missing");
    };
    let timer = window.setTimeout(lockNow, AUTO_LOCK_MS);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lockNow, AUTO_LOCK_MS);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    for (const event of events) window.addEventListener(event, bump);
    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, bump);
    };
  }, [vaultStatus, activeContract, network.networkId]);

  useEffect(() => {
    if (isVitestRuntime() || !privateState || journal.entries.length === 0) return;
    const reconciled = reconcileJournal({
      journal,
      privateState,
      actions: publicStore.actions,
    });
    if (reconciled.authorizedIds.length === 0) return;
    setPrivateState(reconciled.privateState);
    setJournal(reconciled.journal);
    setOperations((prev) => ({
      ...prev,
      ...Object.fromEntries(
        reconciled.authorizedIds.map((actionId) => [
          actionId,
          {
            ...(prev[actionId] ?? journalToOperations(journal)[actionId]),
            actionId,
            kind: "authorization",
            status: "authorized",
            circuitSubmitted: true,
            contractAddress: activeContract,
          },
        ]),
      ),
    }));
    if (activeContract) void persistVault(reconciled.privateState, activeContract, reconciled.journal);
  }, [publicStore.actions, privateState, journal, activeContract]);

  useEffect(() => {
    if (isVitestRuntime() || !walletApi || !passphraseRef.current) return;
    void (async () => {
      const { buildBrowserProviders } = await import("@velios/midnight/browser-providers");
      const built = await buildBrowserProviders(
        walletApi,
        network,
        passphraseRef.current ? { privateStorePassword: passphraseRef.current } : {},
      );
      setProviders(built);
    })();
  }, [walletApi, vaultStatus, network]);

  const value = useMemo<SessionValue>(() => {
    const contractAddress = activeContract;
    const agent = selectedAgent(publicStore.agents, selectedAgentId);
    const member = selectedMember(publicStore.members, selectedMemberId);
    const operatorMatch = matchOperatorToLedger({
      privateState,
      agent,
      members: publicStore.members,
    });
    const operatorStateReady = Boolean(privateState);
    const circuitReady = Boolean(
      providers &&
        privateState &&
        contractAddress &&
        (operatorMatch === "verified" || operatorMatch === "ready_to_create" || operatorMatch === "stale_spend"),
    );
    const pendingActionId = Object.values(operations).find((item) => item.status === "pending")?.actionId;

    const refreshFromChain = async (activeProviders: unknown | undefined, address: string) => {
      const view = await loadPublicLedger(network, address, activeProviders);
      setPublicStore((prev) => applyLedgerView(prev, view));
      setLedgerError(null);
    };

    const applyPolicyToState = (state: VeliosPrivateState, input: OperatorPolicyDraft): VeliosPrivateState => ({
      ...state,
      perActionLimit: input.perActionLimit,
      dailyLimit: input.dailyLimit,
      vendorId: vendorIdFromRecipient(input.recipient),
      policySalt: randomBytes32(),
    });

    const readiness: ReadinessItem[] = [
      {
        id: "network",
        label: "Preview network",
        ok: true,
        detail: `Midnight ${network.networkId} is the Wave 1 target.`,
      },
      {
        id: "indexer",
        label: "Public indexer",
        ok: publicStore.ledgerSync === "confirmed" ? true : publicStore.ledgerSync === "pending" ? null : false,
        detail:
          publicStore.ledgerSync === "confirmed"
            ? "Public organization data is available."
            : "Public data is read from the official Midnight indexer.",
        repair: { label: "Retry public data", action: "retry" },
      },
      {
        id: "wallet",
        label: "Midnight wallet",
        ok: Boolean(wallet),
        detail: wallet ? "Wallet connected." : "Connect 1AM or Lace on Preview. Veilos never asks for a recovery phrase.",
        repair: { label: "Connect wallet", action: "connect" },
      },
      {
        id: "dust",
        label: "Spendable DUST",
        ok: dustReady,
        detail:
          dustReady === false
            ? "This wallet has no spendable DUST yet."
            : "Proving spends DUST. tNIGHT alone is not enough.",
      },
      {
        id: "proof",
        label: "Proof server",
        ok: networkLive,
        detail:
          networkLive === false
            ? "The local proof server is unavailable."
            : "Browser proving uses the local proof server, not a hosted prover.",
      },
      {
        id: "vault",
        label: "Operator vault",
        ok: vaultStatus === "unlocked",
        detail:
          vaultStatus === "unlocked"
            ? "Operator access is unlocked in this tab."
            : vaultStatus === "locked"
              ? "An encrypted vault exists for this organization."
              : vaultStatus === "dev_available"
                ? "A local development export is available. Protect it with a passphrase."
                : "Create an encrypted vault before deploying or authorizing.",
        repair: { label: "Open operator access", to: "/app/org" },
      },
    ];

    return {
      network,
      networkLive,
      wallet,
      publicStore,
      published,
      workspaceMode,
      selectedContract: contractAddress,
      selectedMemberId: member?.memberId ?? selectedMemberId,
      selectedAgentId: agent?.agentId ?? selectedAgentId,
      selectEntities: (input) => {
        if (input.memberId) setSelectedMemberId(input.memberId);
        if (input.agentId) setSelectedAgentId(input.agentId);
      },
      operations,
      lastIntent,
      lastWindow,
      walletError,
      ledgerError,
      busy,
      busyAction,
      midnightProviders: providers,
      withOperatorPassphrase: async (fn) => {
        const passphrase = passphraseRef.current;
        if (!passphrase) throw new Error("Unlock the operator vault first.");
        return fn(passphrase);
      },
      dustReady,
      setupDraft,
      setSetupDraft,
      policyDraft,
      setPolicyDraft,
      authDraft,
      setAuthDraft,
      vaultStatus,
      canOperate: operatorMatch === "verified",
      circuitReady,
      operatorStateReady,
      operatorMatch,
      operatorPolicy: {
        perActionLimit: privateState?.perActionLimit ?? 0n,
        dailyLimit: privateState?.dailyLimit ?? 0n,
        recipient: recipientLabel,
      },
      currentTask: deriveCurrentTask({
        mode: workspaceMode,
        wallet: Boolean(wallet),
        agent,
        match: operatorMatch,
        vault: vaultStatus,
        pendingActionId,
        actions: publicStore.actions,
      }),
      readiness,
      privateDisplay: {
        roleLabel: DEMO_AGENT_ROLE,
        selfModifyAllowed: privateState?.selfModifyAllowed ?? false,
        credentialValidForWindow: Boolean(
          privateState?.credentialOk &&
            privateState.credentialExpiry >= currentAuthorizationWindow().periodEnd,
        ),
      },
      choosePreview: () => {
        setWorkspaceMode("preview");
        setSelectedContract(published?.contractAddress);
        setPublicStore(emptyStore(published?.organizationName ?? DEMO_ORG_NAME));
      },
      startOwnerSetup: () => {
        setWorkspaceMode("owner");
        const owned = listVaultContracts(network.networkId).find(
          (item) => item !== published?.contractAddress && item !== PENDING_VAULT_ADDRESS,
        );
        if (owned) setSelectedContract(owned);
      },
      selectWorkspace: (mode, contract) => {
        setWorkspaceMode(mode);
        if (mode === "preview") {
          setSelectedContract(published?.contractAddress);
          setPublicStore(emptyStore(published?.organizationName ?? DEMO_ORG_NAME));
          return;
        }
        if (contract) setSelectedContract(contract);
      },
      connectWallet: async () => {
        setWalletError(null);
        setBusyAction("connect");
        try {
          const { snapshot, api } = await connectBrowserWallet(network);
          const { buildBrowserProviders } = await import("@velios/midnight/browser-providers");
          const built = await buildBrowserProviders(
            api as ConnectedAPI,
            network,
            passphraseRef.current ? { privateStorePassword: passphraseRef.current } : {},
          );
          setWallet(snapshot);
          setWalletApi(api as ConnectedAPI);
          setProviders(built);
          try {
            const dust = await (api as ConnectedAPI).getDustBalance();
            setDustReady(dust.balance > 0n);
          } catch {
            setDustReady(null);
          }
          const { proofServerReachable } = await import("@velios/midnight/network");
          const { resolveProofHealthUrl } = await import("@velios/midnight/browser-providers");
          const walletConfig = await (api as ConnectedAPI).getConfiguration();
          const healthUrl = resolveProofHealthUrl(walletConfig.proverServerUri, network);
          setNetworkLive(await proofServerReachable(healthUrl, 2500));
        } catch (error) {
          setWallet(null);
          setWalletApi(null);
          setDustReady(null);
          setProviders(null);
          setWalletError(publicErrorMessage(error, "wallet connect failed"));
        } finally {
          setBusyAction((current) => (current === "connect" ? "idle" : current));
        }
      },
      disconnectWallet: () => {
        generationRef.current += 1;
        setWallet(null);
        setWalletApi(null);
        setDustReady(null);
        setProviders(null);
        setWalletError(null);
        setNetworkLive(null);
      },
      createVault: async (passphrase: string) => {
        const state = privateState ?? generatePrivateState();
        passphraseRef.current = passphrase;
        setPrivateState(state);
        const address = contractAddress ?? PENDING_VAULT_ADDRESS;
        await persistVault(state, address);
        setVaultStatus("unlocked");
      },
      lockVault: () => {
        generationRef.current += 1;
        passphraseRef.current = null;
        setPrivateState(null);
        setJournal(emptyJournal());
        const address = contractAddress ?? PENDING_VAULT_ADDRESS;
        setVaultStatus(readEncryptedVault(network.networkId, address) ? "locked" : "missing");
      },
      unlockVault: async (passphrase: string) => {
        const address = contractAddress ?? PENDING_VAULT_ADDRESS;
        const stored = readEncryptedVault(network.networkId, address);
        if (stored) {
          const bundle = await decryptOperatorVaultBundle(stored, passphrase);
          const reconciled = reconcileJournal({
            journal: bundle.journal,
            privateState: bundle.state,
            actions: publicStore.actions,
          });
          passphraseRef.current = passphrase;
          setPrivateState(reconciled.privateState);
          setJournal(reconciled.journal);
          setOperations((prev) => ({ ...prev, ...journalToOperations(reconciled.journal) }));
          setVaultStatus("unlocked");
          await persistVault(reconciled.privateState, address, reconciled.journal);
          return;
        }
        if (import.meta.env.DEV && vaultStatus === "dev_available" && contractAddress) {
          const { getDevOperatorState } = await import("../lib/operator-state-dev.js");
          const response = await getDevOperatorState();
          if (!response.ok) throw new Error("Development export is not available.");
          const { decodePrivateState } = await import("@velios/midnight");
          const next = decodePrivateState(await response.json());
          passphraseRef.current = passphrase;
          setPrivateState(next);
          setJournal(emptyJournal());
          await persistVault(next, contractAddress, emptyJournal());
          setVaultStatus("unlocked");
          return;
        }
        throw new Error("No operator vault exists for this organization.");
      },
      importOperatorState: async (file: File, passphrase: string) => {
        const parsed = JSON.parse(await file.text()) as unknown;
        let next: VeliosPrivateState;
        let nextJournal = emptyJournal();
        let vaultContract = contractAddress;
        if (isEncryptedVault(parsed)) {
          const bundle = await decryptOperatorVaultBundle(parsed, passphrase);
          next = bundle.state;
          nextJournal = bundle.journal;
          vaultContract = parsed.contractAddress;
          writeEncryptedVault(parsed);
        } else {
          const { decodePrivateState } = await import("@velios/midnight");
          next = decodePrivateState(parsed);
        }
        if (!vaultContract) throw new Error("This backup is not tied to an organization.");
        passphraseRef.current = passphrase;
        setSelectedContract(vaultContract);
        setWorkspaceMode("owner");
        setPrivateState(next);
        setJournal(nextJournal);
        setOperations((prev) => ({ ...prev, ...journalToOperations(nextJournal) }));
        await persistVault(next, vaultContract, nextJournal);
        setVaultStatus("unlocked");
        setWalletError(null);
      },
      exportOperatorState: async () => {
        if (!privateState || !contractAddress || !passphraseRef.current) {
          throw new Error("Unlock the operator vault before downloading a backup.");
        }
        const vault = await encryptOperatorVault({
          state: privateState,
          journal: journalRef.current,
          passphrase: passphraseRef.current,
          networkId: network.networkId,
          contractAddress,
        });
        downloadEncryptedVault(vault);
      },
      applyPolicyDraft: async (input) => {
        if (!privateState) throw new Error("Unlock the operator vault first.");
        const next = applyPolicyToState(privateState, input);
        setPrivateState(next);
        setRecipientLabel(input.recipient);
        await persistVault(next, contractAddress ?? PENDING_VAULT_ADDRESS);
      },
      previewPayment: (input) => {
        if (!privateState) return { allowed: false, code: "preview_deny_inactive" };
        const preview = previewAuthorize({
          amount: input.amount,
          vendorId: vendorIdFromRecipient(input.recipient),
          privateState,
          window: currentAuthorizationWindow(),
          agentActive: agent?.status === "active",
          organizationActive: publicStore.organization?.status !== "inactive",
          memberActive: member?.status !== "inactive",
        });
        return { allowed: preview.allowed, code: preview.code };
      },
      joinPublished: async () => {
        if (!providers || !contractAddress || !privateState) {
          setWalletError("Unlock operator access and connect a wallet first.");
          return;
        }
        setBusy(true);
        setBusyAction("join");
        try {
          const { joinDeployedOrganization } = await import("@velios/midnight");
          await primePrivateState(providers, contractAddress, privateState);
          const view = await joinDeployedOrganization(providers, contractAddress, privateState);
          setPublicStore((prev) => applyLedgerView(prev, view));
          setLedgerError(null);
        } catch (error) {
          setWalletError(publicErrorMessage(error, "reconnect failed"));
        } finally {
          setBusy(false);
          setBusyAction("idle");
        }
      },
      refreshLedger: async () => {
        if (!contractAddress) return;
        setBusy(true);
        setBusyAction("refresh");
        try {
          await refreshFromChain(providers ?? undefined, contractAddress);
        } catch (error) {
          setLedgerError(publicErrorMessage(error, "indexer read failed"));
        } finally {
          setBusy(false);
          setBusyAction("idle");
        }
      },
      createOrganization: async (name: string, memberLabel: string) => {
        if (!providers || !privateState) {
          setWalletError("Connect a wallet and create an operator vault first.");
          return false;
        }
        setBusy(true);
        setBusyAction("deploy");
        setWalletError(null);
        setPublicStore((prev) => ({ ...prev, organizationName: name, ledgerSync: "pending" }));
        try {
          const { callCircuit, deployOrganization } = await import("@velios/midnight/client");
          const { hex32ToBytes } = await import("@velios/shared-types");
          const deployed = await deployOrganization(providers, name, privateState);
          setSelectedContract(deployed.contractAddress);
          setWorkspaceMode("owner");
          await persistVault(privateState, deployed.contractAddress);
          const registration = await callCircuit(
            providers,
            deployed.contractAddress,
            "registerMember",
            [hex32ToBytes(memberIdFromLabel(memberLabel))],
          );
          if (registration.status !== "SucceedEntirely") {
            throw new Error("registerMember failed");
          }
          await refreshFromChain(providers, deployed.contractAddress);
          return true;
        } catch (error) {
          setPublicStore((prev) => ({
            ...prev,
            ledgerSync: prev.organization ? "confirmed" : "none",
          }));
          setWalletError(publicErrorMessage(error, "deploy failed"));
          return false;
        } finally {
          setBusy(false);
          setBusyAction("idle");
        }
      },
      createAgent: async (label: string) => {
        if (!contractAddress || !providers || !privateState) {
          setWalletError("Connect the wallet and unlock operator access first.");
          return false;
        }
        if (operatorMatch === "mismatch") {
          setWalletError("This vault does not open the on-chain organization. Import the correct backup.");
          return false;
        }
        const memberId =
          member?.memberId ??
          selectedMemberId ??
          memberIdFromLabel(setupDraft.memberLabel || DEMO_MEMBER_LABEL);
        setSelectedMemberId(memberId);
        let state = privateState;
        if (policyDraft.perAction && policyDraft.daily && policyDraft.recipient) {
          const perActionLimit = BigInt(policyDraft.perAction);
          const dailyLimit = BigInt(policyDraft.daily);
          state = applyPolicyToState(privateState, {
            perActionLimit,
            dailyLimit,
            recipient: policyDraft.recipient,
          });
          setPrivateState(state);
          setRecipientLabel(policyDraft.recipient);
          await persistVault(state, contractAddress);
        }
        setBusy(true);
        setBusyAction("createAgent");
        setWalletError(null);
        try {
          const { proofServerReachable } = await import("@velios/midnight/network");
          const { resolveProofHealthUrl } = await import("@velios/midnight/browser-providers");
          const walletConfig = walletApi ? await walletApi.getConfiguration() : undefined;
          const healthUrl = resolveProofHealthUrl(walletConfig?.proverServerUri, network);
          if (!(await proofServerReachable(healthUrl, 2500))) {
            throw new Error("Proof server is unavailable. Keep midnightntwrk/proof-server on port 6300.");
          }
          if (walletApi) {
            const dust = await walletApi.getDustBalance();
            setDustReady(dust.balance > 0n);
            if (dust.balance <= 0n) throw new Error("Wallet has no spendable DUST yet.");
          }
          const { callCircuit } = await import("@velios/midnight/client");
          const { hex32ToBytes } = await import("@velios/shared-types");
          await primePrivateState(providers, contractAddress, state);
          const result = await callCircuit(
            providers,
            contractAddress,
            "createAgent",
            [hex32ToBytes(agentIdFromLabel(label)), hex32ToBytes(asHex32(memberId))],
          );
          if (result.status !== "SucceedEntirely") {
            setWalletError("createAgent did not return SucceedEntirely.");
            return false;
          }
          await persistVault(state, contractAddress);
          setSelectedAgentId(agentIdFromLabel(label));
          await refreshFromChain(providers, contractAddress);
          return true;
        } catch (error) {
          setWalletError(publicErrorMessage(error, "createAgent failed"));
          return false;
        } finally {
          setBusy(false);
          setBusyAction("idle");
        }
      },
      configurePolicy: async (input) => {
        if (!contractAddress || !providers || !privateState || !agent) return false;
        if (operatorMatch === "mismatch") {
          setWalletError("This vault does not open the on-chain agent.");
          return false;
        }
        const next: VeliosPrivateState = {
          ...privateState,
          perActionLimit: input.perActionLimit,
          dailyLimit: input.dailyLimit,
          vendorId: vendorIdFromRecipient(input.recipient),
          policySalt: randomBytes32(),
        };
        setBusy(true);
        setBusyAction("policy");
        setWalletError(null);
        try {
          const { callCircuit } = await import("@velios/midnight/client");
          const { hex32ToBytes } = await import("@velios/shared-types");
          await primePrivateState(providers, contractAddress, next);
          const result = await callCircuit(
            providers,
            contractAddress,
            "setAgentPolicy",
            [hex32ToBytes(agent.agentId)],
          );
          if (result.status !== "SucceedEntirely") {
            await primePrivateState(providers, contractAddress, privateState);
            setWalletError("setAgentPolicy did not return SucceedEntirely.");
            return false;
          }
          setPrivateState(next);
          setRecipientLabel(input.recipient);
          await persistVault(next, contractAddress);
          await refreshFromChain(providers, contractAddress);
          return true;
        } catch (error) {
          await primePrivateState(providers, contractAddress, privateState).catch(() => undefined);
          setWalletError(publicErrorMessage(error, "setAgentPolicy failed"));
          return false;
        } finally {
          setBusy(false);
          setBusyAction("idle");
        }
      },
      requestPayment: async (input) => {
        const organizationId =
          publicStore.organization?.organizationId ??
          published?.organizationId ??
          organizationIdFromName(publicStore.organizationName);
        const agentId = agent?.agentId ?? (selectedAgentId ? asHex32(selectedAgentId) : agentIdFromLabel(DEMO_AGENT_LABEL));
        const intent: PaymentIntent = {
          type: "PAYMENT",
          agentId,
          recipientLabel: input.recipient,
          amount: input.amount,
          reason: input.reason,
          actionId: newActionId(),
        };
        setLastIntent(intent);
        setRecipientLabel(input.recipient);
        const operation: ActionOperation = {
          actionId: intent.actionId,
          kind: "authorization",
          status: "pending",
          phase: "preparing",
          circuitSubmitted: false,
          contractAddress,
        };
        setOperations((prev) => upsertOperation(prev, operation));
        if (!contractAddress || !providers || !privateState || !agent || operatorMatch !== "verified") {
          setOperations((prev) =>
            upsertOperation(prev, {
              ...operation,
              status: "failed",
              outcome: { kind: "failed", code: "environment_missing" },
            }),
          );
          return intent.actionId;
        }
        setBusy(true);
        setBusyAction("payment");
        void (async () => {
          const generation = generationRef.current;
          const stillOpen = () => generationRef.current === generation && Boolean(passphraseRef.current);
          const update = (patch: Partial<ActionOperation>) => {
            if (!stillOpen()) return;
            setOperations((prev) => upsertOperation(prev, { ...operation, ...prev[intent.actionId], ...patch }));
          };
          try {
            const { authorizePayment } = await import("@velios/midnight/client");
            const { authorizationWindowFromLedger, fetchIndexerNowSeconds, resolveIndexerHttpUrl } =
              await import("@velios/midnight");
            const { randomBytes32 } = await import("@velios/policy-engine");
            update({ phase: "awaiting_wallet" });
            const now = await fetchIndexerNowSeconds(resolveIndexerHttpUrl(network));
            const window = authorizationWindowFromLedger(now);
            if (stillOpen()) setLastWindow(window);
            if (!windowIsSafeToSubmit(window, now)) {
              update({ status: "timeout", outcome: { kind: "timeout" } });
              return;
            }
            const vendorId = vendorIdFromRecipient(input.recipient);
            const preview = previewAuthorize({
              amount: input.amount,
              vendorId,
              privateState,
              window,
            });
            if (!preview.allowed) {
              update({
                status: "rejected",
                previewCode: preview.code,
                circuitSubmitted: false,
                outcome: { kind: "rejected", code: "policy_violation" },
              });
              return;
            }
            const nextSpendSalt = randomBytes32();
            const expected = expectedSpendAfterAuthorization(
              privateState,
              input.amount,
              window.periodStart,
              nextSpendSalt,
            );
            const intentCommitment = paymentIntentCommitment({
              intent,
              organizationId,
              vendorId,
              periodStart: window.periodStart,
              periodEnd: window.periodEnd,
              salt: nextSpendSalt,
            });
            const pendingJournal = upsertJournalEntry(journalRef.current, {
              actionId: intent.actionId,
              kind: "authorization",
              status: "pending",
              phase: "proving",
              circuitSubmitted: true,
              contractAddress,
              intentCommitment,
              expectedPeriodStart: expected.expectedPeriodStart,
              expectedDailySpend: expected.expectedDailySpend,
              expectedSpendSalt: expected.expectedSpendSalt,
              expectedNextSpendSalt: expected.expectedNextSpendSalt,
              submittedAt: new Date().toISOString(),
            });
            if (stillOpen()) {
              setJournal(pendingJournal);
              await persistVault(privateState, contractAddress, pendingJournal);
            }
            update({ phase: "proving", previewCode: preview.code, circuitSubmitted: true });
            const { outcome, nextPrivateState, txId, submitted } = await authorizePayment({
              providers,
              contractAddress,
              organizationId,
              intent,
              privateState,
              vendorId,
              nowSeconds: now,
              window,
              nextSpendSalt,
            });
            if (!stillOpen()) return;
            setLastWindow(window);
            if (submitted) {
              setPrivateState(nextPrivateState);
              const prior = pendingJournal.entries.find((entry) => entry.actionId === intent.actionId)!;
              const afterSubmit = upsertJournalEntry(pendingJournal, {
                ...prior,
                status: outcome.kind === "authorized" ? "authorized" : outcome.kind === "stale" ? "stale" : "pending",
                phase: "indexing",
                ...(txId ? { txId } : {}),
              });
              if (outcome.kind === "authorized") {
                const cleared = removeJournalEntry(afterSubmit, intent.actionId);
                setJournal(cleared);
                await persistVault(nextPrivateState, contractAddress, cleared);
                await refreshFromChain(providers, contractAddress);
                update({
                  status: "authorized",
                  phase: "indexing",
                  outcome,
                  txId: outcome.txId,
                  circuitSubmitted: true,
                  previewCode: preview.code,
                });
              } else {
                setJournal(afterSubmit);
                await persistVault(nextPrivateState, contractAddress, afterSubmit);
                update({
                  status: outcome.kind === "stale" ? "stale" : outcome.kind === "rejected" ? "rejected" : outcome.kind === "timeout" ? "timeout" : "failed",
                  outcome,
                  txId,
                  circuitSubmitted: true,
                  previewCode: preview.code,
                });
              }
            } else {
              const discarded = removeJournalEntry(pendingJournal, intent.actionId);
              setJournal(discarded);
              await persistVault(privateState, contractAddress, discarded);
              update({
                status: outcome.kind === "rejected" ? "rejected" : outcome.kind === "timeout" ? "timeout" : "failed",
                outcome,
                circuitSubmitted: true,
                previewCode: preview.code,
              });
            }
          } catch (error) {
            const { outcomeFromCaughtError } = await import("@velios/midnight/status");
            const outcome = outcomeFromCaughtError(error);
            update({
              status: outcome.kind === "rejected" ? "rejected" : "failed",
              outcome,
              circuitSubmitted: true,
            });
          } finally {
            if (stillOpen()) {
              setBusy(false);
              setBusyAction("idle");
            }
          }
        })();
        return intent.actionId;
      },
    };
  }, [
    network,
    networkLive,
    wallet,
    providers,
    publicStore,
    published,
    workspaceMode,
    activeContract,
    selectedMemberId,
    selectedAgentId,
    operations,
    lastIntent,
    lastWindow,
    walletError,
    ledgerError,
    privateState,
    recipientLabel,
    vaultStatus,
    setupDraft,
    policyDraft,
    authDraft,
    busy,
    busyAction,
    dustReady,
    walletApi,
  ]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("session missing");
  return value;
}

export function walletsAvailable(): number {
  return listWallets().length;
}

export function publicSlice(store: PublicStore): Record<string, unknown> {
  return {
    organizationId: store.organization?.organizationId,
    organizationStatus: store.organization?.status,
    agentIds: store.agents.map((agent) => agent.agentId),
    memberIds: store.members.map((member) => member.memberId),
    actionIds: store.actions.map((action) => action.actionId),
    contractAddress: store.contractAddress,
    ledgerSync: store.ledgerSync,
  };
}

export function operationForAction(
  operations: Record<string, ActionOperation>,
  actionId: string | undefined,
): ActionOperation | undefined {
  if (!actionId) return undefined;
  return operations[actionId as Hex32];
}

export type { Hex32 };
export { bytesToHex32 };
