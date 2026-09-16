/**
 * Public ledger projection for Wave 2 Preview contracts.
 * Only commitments, ids, counters, and unshielded settlement facts.
 * Never copy witnesses, ballot choices, bid amounts, or credential bodies.
 */

import { bytesToHex32, type Hex32 } from "@velios/shared-types";
import { contractStateValue } from "./ledger-view.js";

export type EconomyAuthorizationPublic = {
  actionId: Hex32;
  agentId: Hex32;
  intentCommitment: Hex32;
  periodStart: bigint;
  periodEnd: bigint;
};

export type EconomySettlementPublic = {
  actionId: Hex32;
  amount: bigint;
  recipientCommitment: Hex32;
  periodStart: bigint;
};

export type EconomyLedgerView = {
  kind: "economy-preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationStatus: "inactive" | "active";
  adminCommitment: Hex32;
  credentialCommitments: Hex32[];
  revokedNullifiers: Hex32[];
  credentialCount: bigint;
  usedActionIds: Hex32[];
  authorizations: EconomyAuthorizationPublic[];
  actionCount: bigint;
  settlementNullifiers: Hex32[];
  settlements: EconomySettlementPublic[];
  settlementCount: bigint;
};

export type GovernanceProposalPublic = {
  proposalId: Hex32;
  actionCommitment: Hex32;
  voteStart: bigint;
  voteEnd: bigint;
  quorumCommitment: Hex32;
  status: "open" | "finalized";
  yesCount: bigint;
  noCount: bigint;
};

export type GovernanceLedgerView = {
  kind: "governance-preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationStatus: "inactive" | "active";
  adminCommitment: Hex32;
  voterCommitments: Hex32[];
  revokedVoters: Hex32[];
  voterCount: bigint;
  proposals: GovernanceProposalPublic[];
  voteNullifiers: Hex32[];
  ballotCommitments: Hex32[];
  proposalCount: bigint;
};

export type ProcurementLotPublic = {
  procurementId: Hex32;
  windowStart: bigint;
  windowEnd: bigint;
  eligibility: Hex32;
  status: "open" | "awarded";
  awardCommitment: Hex32;
  winnerBidCommitment: Hex32;
  treasuryActionId: Hex32;
};

export type ProcurementLedgerView = {
  kind: "procurement-preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationStatus: "inactive" | "active";
  adminCommitment: Hex32;
  bidderCommitments: Hex32[];
  revokedBidders: Hex32[];
  bidderCount: bigint;
  lots: ProcurementLotPublic[];
  bidCommitments: Hex32[];
  procurementCount: bigint;
};

export type AuditorDisclosurePublic = {
  disclosureId: Hex32;
  auditorId: Hex32;
  scopeCommitment: Hex32;
  expires: bigint;
};

export type AuditorLedgerView = {
  kind: "auditor-preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationStatus: "inactive" | "active";
  adminCommitment: Hex32;
  disclosures: AuditorDisclosurePublic[];
  disclosureCount: bigint;
};

type CompactMap<K, V> = Iterable<[K, V]> & { size(): bigint };
type CompactSet<T> = Iterable<T> & { size(): bigint };

function activeStatus(value: number): "inactive" | "active" {
  return value === 1 ? "active" : "inactive";
}

function hexKeys(items: Iterable<Uint8Array>): Hex32[] {
  const out: Hex32[] = [];
  for (const item of items) out.push(bytesToHex32(item));
  return out;
}

function hexMapKeys(items: Iterable<[Uint8Array, unknown]>): Hex32[] {
  const out: Hex32[] = [];
  for (const [key] of items) out.push(bytesToHex32(key));
  return out;
}

export type CompactEconomyLedger = {
  organizationId: Uint8Array;
  organizationStatus: number;
  adminCommitment: Uint8Array;
  credentials: CompactMap<Uint8Array, boolean>;
  revokedNullifiers: CompactSet<Uint8Array>;
  credentialCount: bigint;
  usedActionIds: CompactSet<Uint8Array>;
  authorizations: CompactMap<
    Uint8Array,
    { agentId: Uint8Array; result: number; intentCommitment: Uint8Array; periodStart: bigint; periodEnd: bigint }
  >;
  actionCount: bigint;
  settlementNullifiers: CompactSet<Uint8Array>;
  settlements: CompactMap<
    Uint8Array,
    { actionId: Uint8Array; amount: bigint; recipient: Uint8Array; periodStart: bigint }
  >;
  settlementCount: bigint;
};

export function projectEconomyLedger(ledger: CompactEconomyLedger, contractAddress: string): EconomyLedgerView {
  const authorizations: EconomyAuthorizationPublic[] = [];
  for (const [actionId, row] of ledger.authorizations) {
    authorizations.push({
      actionId: bytesToHex32(actionId),
      agentId: bytesToHex32(row.agentId),
      intentCommitment: bytesToHex32(row.intentCommitment),
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
    });
  }
  const settlements: EconomySettlementPublic[] = [];
  for (const [actionId, row] of ledger.settlements) {
    settlements.push({
      actionId: bytesToHex32(actionId),
      amount: row.amount,
      recipientCommitment: bytesToHex32(row.recipient),
      periodStart: row.periodStart,
    });
  }
  return {
    kind: "economy-preview",
    contractAddress,
    organizationId: bytesToHex32(ledger.organizationId),
    organizationStatus: activeStatus(ledger.organizationStatus),
    adminCommitment: bytesToHex32(ledger.adminCommitment),
    credentialCommitments: hexMapKeys(ledger.credentials),
    revokedNullifiers: hexKeys(ledger.revokedNullifiers),
    credentialCount: ledger.credentialCount,
    usedActionIds: hexKeys(ledger.usedActionIds),
    authorizations,
    actionCount: ledger.actionCount,
    settlementNullifiers: hexKeys(ledger.settlementNullifiers),
    settlements,
    settlementCount: ledger.settlementCount,
  };
}

export type CompactGovernanceLedger = {
  organizationId: Uint8Array;
  organizationStatus: number;
  adminCommitment: Uint8Array;
  voters: CompactMap<Uint8Array, boolean>;
  revokedVoters: CompactSet<Uint8Array>;
  voterCount: bigint;
  proposals: CompactMap<
    Uint8Array,
    {
      actionCommitment: Uint8Array;
      voteStart: bigint;
      voteEnd: bigint;
      quorumCommitment: Uint8Array;
      status: number;
      yesCount: bigint;
      noCount: bigint;
    }
  >;
  voteNullifiers: CompactSet<Uint8Array>;
  ballotCommitments: CompactMap<Uint8Array, Uint8Array>;
  proposalCount: bigint;
};

export function projectGovernanceLedger(
  ledger: CompactGovernanceLedger,
  contractAddress: string,
): GovernanceLedgerView {
  const proposals: GovernanceProposalPublic[] = [];
  for (const [proposalId, row] of ledger.proposals) {
    proposals.push({
      proposalId: bytesToHex32(proposalId),
      actionCommitment: bytesToHex32(row.actionCommitment),
      voteStart: row.voteStart,
      voteEnd: row.voteEnd,
      quorumCommitment: bytesToHex32(row.quorumCommitment),
      status: row.status === 1 ? "finalized" : "open",
      yesCount: row.yesCount,
      noCount: row.noCount,
    });
  }
  return {
    kind: "governance-preview",
    contractAddress,
    organizationId: bytesToHex32(ledger.organizationId),
    organizationStatus: activeStatus(ledger.organizationStatus),
    adminCommitment: bytesToHex32(ledger.adminCommitment),
    voterCommitments: hexMapKeys(ledger.voters),
    revokedVoters: hexKeys(ledger.revokedVoters),
    voterCount: ledger.voterCount,
    proposals,
    voteNullifiers: hexKeys(ledger.voteNullifiers),
    ballotCommitments: hexMapKeys(ledger.ballotCommitments),
    proposalCount: ledger.proposalCount,
  };
}

export type CompactProcurementLedger = {
  organizationId: Uint8Array;
  organizationStatus: number;
  adminCommitment: Uint8Array;
  bidders: CompactMap<Uint8Array, boolean>;
  revokedBidders: CompactSet<Uint8Array>;
  bidderCount: bigint;
  procurements: CompactMap<
    Uint8Array,
    {
      windowStart: bigint;
      windowEnd: bigint;
      eligibility: Uint8Array;
      status: number;
      awardCommitment: Uint8Array;
      winnerBidCommitment: Uint8Array;
      treasuryActionId: Uint8Array;
    }
  >;
  bidCommitments: CompactMap<Uint8Array, Uint8Array>;
  procurementCount: bigint;
};

export function projectProcurementLedger(
  ledger: CompactProcurementLedger,
  contractAddress: string,
): ProcurementLedgerView {
  const lots: ProcurementLotPublic[] = [];
  for (const [procurementId, row] of ledger.procurements) {
    lots.push({
      procurementId: bytesToHex32(procurementId),
      windowStart: row.windowStart,
      windowEnd: row.windowEnd,
      eligibility: bytesToHex32(row.eligibility),
      status: row.status === 1 ? "awarded" : "open",
      awardCommitment: bytesToHex32(row.awardCommitment),
      winnerBidCommitment: bytesToHex32(row.winnerBidCommitment),
      treasuryActionId: bytesToHex32(row.treasuryActionId),
    });
  }
  return {
    kind: "procurement-preview",
    contractAddress,
    organizationId: bytesToHex32(ledger.organizationId),
    organizationStatus: activeStatus(ledger.organizationStatus),
    adminCommitment: bytesToHex32(ledger.adminCommitment),
    bidderCommitments: hexMapKeys(ledger.bidders),
    revokedBidders: hexKeys(ledger.revokedBidders),
    bidderCount: ledger.bidderCount,
    lots,
    bidCommitments: hexMapKeys(ledger.bidCommitments),
    procurementCount: ledger.procurementCount,
  };
}

export type CompactAuditorLedger = {
  organizationId: Uint8Array;
  organizationStatus: number;
  adminCommitment: Uint8Array;
  disclosures: CompactMap<Uint8Array, { auditorId: Uint8Array; scopeCommitment: Uint8Array; expires: bigint }>;
  disclosureCount: bigint;
};

export function projectAuditorLedger(ledger: CompactAuditorLedger, contractAddress: string): AuditorLedgerView {
  const disclosures: AuditorDisclosurePublic[] = [];
  for (const [disclosureId, row] of ledger.disclosures) {
    disclosures.push({
      disclosureId: bytesToHex32(disclosureId),
      auditorId: bytesToHex32(row.auditorId),
      scopeCommitment: bytesToHex32(row.scopeCommitment),
      expires: row.expires,
    });
  }
  return {
    kind: "auditor-preview",
    contractAddress,
    organizationId: bytesToHex32(ledger.organizationId),
    organizationStatus: activeStatus(ledger.organizationStatus),
    adminCommitment: bytesToHex32(ledger.adminCommitment),
    disclosures,
    disclosureCount: ledger.disclosureCount,
  };
}

export function ledgerStateValue(state: unknown): unknown {
  return contractStateValue(state);
}
