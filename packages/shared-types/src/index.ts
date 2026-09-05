/**
 * Shared Wave 1 types. Private fields must never appear on URL or public UI types.
 */

export const HEX32_RE = /^[0-9a-f]{64}$/;

export type Hex32 = string & { readonly __hex32: unique symbol };

export type OrganizationStatus = "inactive" | "active";
export type MemberStatus = "inactive" | "active";
export type AgentStatus = "inactive" | "active";
export type ActionType = "payment";
export type ActionResult = "authorized";
export type CredentialClass = "admin" | "treasury" | "procurement" | "auditor" | "agent";
export type ProposalStatus = "open" | "finalized";
export type ProcurementStatus = "open" | "awarded";
export type SettlementStatus = "pending" | "settled" | "failed" | "stale";

export const CREDENTIAL_CLASS_ID: Record<CredentialClass, bigint> = {
  admin: 0n,
  treasury: 1n,
  procurement: 2n,
  auditor: 3n,
  agent: 4n,
};

/** Public ledger projection. No policy integers, secrets, or reasons. */
export type PublicOrganization = {
  organizationId: Hex32;
  status: OrganizationStatus;
  adminCommitment: Hex32;
  contractAddress?: string | undefined;
  /** Ledger `Counter` values. Publicly verifiable; carry no private detail. */
  memberCount?: bigint;
  agentCount?: bigint;
  actionCount?: bigint;
};

/** A member's identity secret stays private; only the commitment is public. */
export type PublicMember = {
  memberId: Hex32;
  organizationId: Hex32;
  status: MemberStatus;
  memberCommitment: Hex32;
};

export type PublicAgent = {
  agentId: Hex32;
  organizationId: Hex32;
  status: AgentStatus;
  /** Member that created the agent — the Wave 1 identity link. */
  memberId: Hex32;
  ownerCommitment: Hex32;
  agentCommitment: Hex32;
  /** Binds the agent's private role label without revealing it. */
  roleCommitment: Hex32;
  policyCommitment: Hex32;
  spendCommitment: Hex32;
};

export type PublicAction = {
  actionId: Hex32;
  agentId: Hex32;
  actionType: ActionType;
  result: ActionResult;
  resultCommitment: Hex32;
  /**
   * Authorization window, in seconds since the UNIX epoch, that the circuit
   * proved contained the block time. This is the public "timestamp".
   */
  periodStart: bigint;
  periodEnd: bigint;
};

/**
 * Local private state. Held only in the official private-state provider
 * or in-process memory. Never put these fields in routes or logs.
 */
export type VeliosPrivateState = {
  ownerSecret: Uint8Array;
  /** Organization membership secret; opens the public member commitment. */
  memberSecret: Uint8Array;
  /** The agent's own key, used only for the self-modify path. */
  agentSecret: Uint8Array;
  /** Private role label (hashed), e.g. "Treasury Operator". */
  agentRole: Uint8Array;
  roleSalt: Uint8Array;
  perActionLimit: bigint;
  dailyLimit: bigint;
  vendorId: Uint8Array;
  credentialOk: boolean;
  /** Credential expiry in seconds since the UNIX epoch. Never disclosed. */
  credentialExpiry: bigint;
  selfModifyAllowed: boolean;
  policySalt: Uint8Array;
  /** Start of the window the committed `dailySpend` belongs to. */
  spendPeriodStart: bigint;
  dailySpend: bigint;
  spendSalt: Uint8Array;
  nextSpendSalt: Uint8Array;
};

export type PaymentIntent = {
  type: "PAYMENT";
  agentId: Hex32;
  recipientLabel: string;
  amount: bigint;
  reason: string;
  actionId: Hex32;
};

export type TxLifecycle =
  | "idle"
  | "pending"
  | "authorized"
  | "rejected"
  | "failed"
  | "timeout"
  | "stale";

export type ProofPhase =
  | "collecting"
  | "witness"
  | "preparing"
  | "awaiting_wallet"
  | "proving"
  | "submitting"
  | "indexing";

export type WorkspaceMode = "unset" | "owner" | "preview";

export type OperatorMatch =
  | "none"
  | "ready_to_create"
  | "verified"
  | "stale_spend"
  | "mismatch";

export type ActionOperationKind =
  | "authorization"
  | "create_agent"
  | "set_policy"
  | "deploy"
  | "settlement"
  | "credential"
  | "proposal"
  | "ballot"
  | "procurement"
  | "disclosure";

/** Public operation record. Never store amount, recipient, reason, or secrets. */
export type ActionOperation = {
  actionId: Hex32;
  kind: ActionOperationKind;
  status: "pending" | "authorized" | "rejected" | "failed" | "timeout" | "interrupted" | "stale";
  phase?: ProofPhase | undefined;
  outcome?: AuthorizationOutcome | undefined;
  circuitSubmitted: boolean;
  previewCode?: string | undefined;
  txId?: string | undefined;
  contractAddress?: string | undefined;
};

export type AuthorizationOutcome =
  | { kind: "idle" }
  | { kind: "pending"; phase: ProofPhase }
  | {
      kind: "authorized";
      actionId: Hex32;
      contractAddress: string;
      txId: string;
    }
  | { kind: "rejected"; code: "proof_rejected" | "policy_violation" }
  | {
      kind: "failed";
      code:
        | "submit_failed"
        | "wallet_rejected"
        | "environment_missing"
        | "wallet_disconnected";
    }
  | { kind: "timeout" }
  | { kind: "stale" }
  | { kind: "interrupted" };

export const MIDNIGHT_SUCCESS_STATUS = "SucceedEntirely" as const;

export function asHex32(value: string): Hex32 {
  const normalized = value.toLowerCase().replace(/^0x/, "");
  if (!HEX32_RE.test(normalized)) {
    throw new Error("invalid public identifier");
  }
  return normalized as Hex32;
}

export function bytesToHex32(bytes: Uint8Array): Hex32 {
  if (bytes.length !== 32) {
    throw new Error("invalid public identifier");
  }
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("") as Hex32;
}

export function hex32ToBytes(hex: Hex32): Uint8Array {
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
