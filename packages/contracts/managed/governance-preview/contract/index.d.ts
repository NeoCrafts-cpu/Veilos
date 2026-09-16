import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  ballotChoice(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  ballotSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerVoter(context: __compactRuntime.CircuitContext<PS>,
                commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeVoter(context: __compactRuntime.CircuitContext<PS>,
              nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
}

export type ProvableCircuits<PS> = {
  registerVoter(context: __compactRuntime.CircuitContext<PS>,
                commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeVoter(context: __compactRuntime.CircuitContext<PS>,
              nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
}

export type PureCircuits = {
  ownerCommitmentOf(sk_0: Uint8Array): Uint8Array;
  holderCommitmentOf(sk_0: Uint8Array): Uint8Array;
  voterRevocationOf(holder_0: Uint8Array): Uint8Array;
  ballotCommitmentOf(proposalId_0: Uint8Array,
                     holder_0: Uint8Array,
                     choice_0: bigint,
                     salt_0: Uint8Array): Uint8Array;
  voteNullifierOf(proposalId_0: Uint8Array, holder_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  ownerCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  voterRevocationOf(context: __compactRuntime.CircuitContext<PS>,
                    holder_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  ballotCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     proposalId_0: Uint8Array,
                     holder_0: Uint8Array,
                     choice_0: bigint,
                     salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  voteNullifierOf(context: __compactRuntime.CircuitContext<PS>,
                  proposalId_0: Uint8Array,
                  holder_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  registerVoter(context: __compactRuntime.CircuitContext<PS>,
                commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeVoter(context: __compactRuntime.CircuitContext<PS>,
              nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
}

export type Ledger = {
  readonly organizationId: Uint8Array;
  readonly organizationStatus: number;
  readonly adminCommitment: Uint8Array;
  voters: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  revokedVoters: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly voterCount: bigint;
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
  readonly proposalCount: bigint;
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
