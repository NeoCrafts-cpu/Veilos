import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  credentialClass(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  credentialExpiry(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  credentialSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  credentialPath(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { leaf: Uint8Array,
                                                                               path: { sibling: { field: bigint
                                                                                                },
                                                                                       goes_left: boolean
                                                                                     }[]
                                                                             }];
  revocationSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  intentSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  reasonDigestW(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  vendorId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  perActionLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  dailyLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  spendPeriodStart(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  spendDaily(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  ballotChoice(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  ballotSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  tallyYes(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  tallyNo(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  bidSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  bidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  awardSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  authorizePayment(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   actionId_0: Uint8Array,
                   amount_0: bigint,
                   vendor_0: Uint8Array,
                   periodStart_0: bigint,
                   periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositNight(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settleAuthorizedPayment(context: __compactRuntime.CircuitContext<PS>,
                          actionId_0: Uint8Array,
                          amount_0: bigint,
                          recipient_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 actionCommitment_0: Uint8Array,
                 voteStart_0: bigint,
                 voteEnd_0: bigint,
                 quorumCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProcurement(context: __compactRuntime.CircuitContext<PS>,
                    procurementId_0: Uint8Array,
                    windowStart_0: bigint,
                    windowEnd_0: bigint,
                    eligibility_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            procurementId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  awardProcurement(context: __compactRuntime.CircuitContext<PS>,
                   procurementId_0: Uint8Array,
                   winnerBid_0: Uint8Array,
                   actionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  recordDisclosure(context: __compactRuntime.CircuitContext<PS>,
                   disclosureId_0: Uint8Array,
                   auditorId_0: Uint8Array,
                   scopeCommitment_0: Uint8Array,
                   expires_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  authorizePayment(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   actionId_0: Uint8Array,
                   amount_0: bigint,
                   vendor_0: Uint8Array,
                   periodStart_0: bigint,
                   periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositNight(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settleAuthorizedPayment(context: __compactRuntime.CircuitContext<PS>,
                          actionId_0: Uint8Array,
                          amount_0: bigint,
                          recipient_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 actionCommitment_0: Uint8Array,
                 voteStart_0: bigint,
                 voteEnd_0: bigint,
                 quorumCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProcurement(context: __compactRuntime.CircuitContext<PS>,
                    procurementId_0: Uint8Array,
                    windowStart_0: bigint,
                    windowEnd_0: bigint,
                    eligibility_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            procurementId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  awardProcurement(context: __compactRuntime.CircuitContext<PS>,
                   procurementId_0: Uint8Array,
                   winnerBid_0: Uint8Array,
                   actionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  recordDisclosure(context: __compactRuntime.CircuitContext<PS>,
                   disclosureId_0: Uint8Array,
                   auditorId_0: Uint8Array,
                   scopeCommitment_0: Uint8Array,
                   expires_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  ownerCommitmentOf(sk_0: Uint8Array): Uint8Array;
  holderCommitmentOf(sk_0: Uint8Array): Uint8Array;
  credentialCommitmentOf(holder_0: Uint8Array,
                         org_0: Uint8Array,
                         classId_0: bigint,
                         expiry_0: bigint,
                         salt_0: Uint8Array): Uint8Array;
  revocationNullifierOf(commitment_0: Uint8Array, secret_0: Uint8Array): Uint8Array;
  intentCommitmentOf(actionId_0: Uint8Array,
                     agentId_0: Uint8Array,
                     org_0: Uint8Array,
                     actionType_0: bigint,
                     amount_0: bigint,
                     vendor_0: Uint8Array,
                     reason_0: Uint8Array,
                     periodStart_0: bigint,
                     periodEnd_0: bigint,
                     salt_0: Uint8Array): Uint8Array;
  settlementNullifierOf(actionId_0: Uint8Array): Uint8Array;
  ballotCommitmentOf(proposalId_0: Uint8Array,
                     holder_0: Uint8Array,
                     choice_0: bigint,
                     salt_0: Uint8Array): Uint8Array;
  voteNullifierOf(proposalId_0: Uint8Array, holder_0: Uint8Array): Uint8Array;
  bidCommitmentOf(procurementId_0: Uint8Array,
                  holder_0: Uint8Array,
                  amount_0: bigint,
                  salt_0: Uint8Array): Uint8Array;
  awardCommitmentOf(procurementId_0: Uint8Array,
                    winnerBid_0: Uint8Array,
                    salt_0: Uint8Array): Uint8Array;
  addressCommitmentOf(addr_0: { bytes: Uint8Array }): Uint8Array;
}

export type Circuits<PS> = {
  ownerCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credentialCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                         holder_0: Uint8Array,
                         org_0: Uint8Array,
                         classId_0: bigint,
                         expiry_0: bigint,
                         salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  revocationNullifierOf(context: __compactRuntime.CircuitContext<PS>,
                        commitment_0: Uint8Array,
                        secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  intentCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     actionId_0: Uint8Array,
                     agentId_0: Uint8Array,
                     org_0: Uint8Array,
                     actionType_0: bigint,
                     amount_0: bigint,
                     vendor_0: Uint8Array,
                     reason_0: Uint8Array,
                     periodStart_0: bigint,
                     periodEnd_0: bigint,
                     salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  settlementNullifierOf(context: __compactRuntime.CircuitContext<PS>,
                        actionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  ballotCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     proposalId_0: Uint8Array,
                     holder_0: Uint8Array,
                     choice_0: bigint,
                     salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  voteNullifierOf(context: __compactRuntime.CircuitContext<PS>,
                  proposalId_0: Uint8Array,
                  holder_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                  procurementId_0: Uint8Array,
                  holder_0: Uint8Array,
                  amount_0: bigint,
                  salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  awardCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    procurementId_0: Uint8Array,
                    winnerBid_0: Uint8Array,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  addressCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                      addr_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  authorizePayment(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   actionId_0: Uint8Array,
                   amount_0: bigint,
                   vendor_0: Uint8Array,
                   periodStart_0: bigint,
                   periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  depositNight(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settleAuthorizedPayment(context: __compactRuntime.CircuitContext<PS>,
                          actionId_0: Uint8Array,
                          amount_0: bigint,
                          recipient_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 actionCommitment_0: Uint8Array,
                 voteStart_0: bigint,
                 voteEnd_0: bigint,
                 quorumCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProcurement(context: __compactRuntime.CircuitContext<PS>,
                    procurementId_0: Uint8Array,
                    windowStart_0: bigint,
                    windowEnd_0: bigint,
                    eligibility_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            procurementId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  awardProcurement(context: __compactRuntime.CircuitContext<PS>,
                   procurementId_0: Uint8Array,
                   winnerBid_0: Uint8Array,
                   actionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  recordDisclosure(context: __compactRuntime.CircuitContext<PS>,
                   disclosureId_0: Uint8Array,
                   auditorId_0: Uint8Array,
                   scopeCommitment_0: Uint8Array,
                   expires_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly organizationId: Uint8Array;
  readonly organizationStatus: number;
  readonly adminCommitment: Uint8Array;
  credentialTree: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined;
    history(): Iterator<__compactRuntime.MerkleTreeDigest>
  };
  revokedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly credentialCount: bigint;
  usedActionIds: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  authorizations: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { agentId: Uint8Array,
                                 result: number,
                                 intentCommitment: Uint8Array,
                                 periodStart: bigint,
                                 periodEnd: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { agentId: Uint8Array,
  result: number,
  intentCommitment: Uint8Array,
  periodStart: bigint,
  periodEnd: bigint
}]>
  };
  readonly actionCount: bigint;
  settlementNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  settlements: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { actionId: Uint8Array,
                                 amount: bigint,
                                 recipient: Uint8Array,
                                 periodStart: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { actionId: Uint8Array,
  amount: bigint,
  recipient: Uint8Array,
  periodStart: bigint
}]>
  };
  readonly settlementCount: bigint;
  proposals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { actionCommitment: Uint8Array,
                                 voteStart: bigint,
                                 voteEnd: bigint,
                                 quorumCommitment: Uint8Array,
                                 status: number,
                                 yesCount: bigint,
                                 noCount: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { actionCommitment: Uint8Array,
  voteStart: bigint,
  voteEnd: bigint,
  quorumCommitment: Uint8Array,
  status: number,
  yesCount: bigint,
  noCount: bigint
}]>
  };
  voteNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  ballotCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  procurements: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { windowStart: bigint,
                                 windowEnd: bigint,
                                 eligibility: Uint8Array,
                                 status: number,
                                 awardCommitment: Uint8Array,
                                 winnerBidCommitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { windowStart: bigint,
  windowEnd: bigint,
  eligibility: Uint8Array,
  status: number,
  awardCommitment: Uint8Array,
  winnerBidCommitment: Uint8Array
}]>
  };
  bidCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  disclosures: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { auditorId: Uint8Array,
                                 scopeCommitment: Uint8Array,
                                 expires: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { auditorId: Uint8Array, scopeCommitment: Uint8Array, expires: bigint }]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               orgId_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
