import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  revocationSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  bidSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  bidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  awardSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerBidder(context: __compactRuntime.CircuitContext<PS>,
                 commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeBidder(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
                   treasuryActionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerBidder(context: __compactRuntime.CircuitContext<PS>,
                 commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeBidder(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
                   treasuryActionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  ownerCommitmentOf(sk_0: Uint8Array): Uint8Array;
  holderCommitmentOf(sk_0: Uint8Array): Uint8Array;
  bidderRevocationOf(holder_0: Uint8Array, secret_0: Uint8Array): Uint8Array;
  bidCommitmentOf(procurementId_0: Uint8Array,
                  holder_0: Uint8Array,
                  amount_0: bigint,
                  salt_0: Uint8Array): Uint8Array;
  awardCommitmentOf(procurementId_0: Uint8Array,
                    winnerBid_0: Uint8Array,
                    salt_0: Uint8Array): Uint8Array;
  bidKeyOf(procurementId_0: Uint8Array, holder_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  ownerCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidderRevocationOf(context: __compactRuntime.CircuitContext<PS>,
                     holder_0: Uint8Array,
                     secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                  procurementId_0: Uint8Array,
                  holder_0: Uint8Array,
                  amount_0: bigint,
                  salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  awardCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    procurementId_0: Uint8Array,
                    winnerBid_0: Uint8Array,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidKeyOf(context: __compactRuntime.CircuitContext<PS>,
           procurementId_0: Uint8Array,
           holder_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  registerBidder(context: __compactRuntime.CircuitContext<PS>,
                 commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeBidder(context: __compactRuntime.CircuitContext<PS>,
               nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
                   treasuryActionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly organizationId: Uint8Array;
  readonly organizationStatus: number;
  readonly adminCommitment: Uint8Array;
  bidders: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  revokedBidders: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly bidderCount: bigint;
  procurements: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { windowStart: bigint,
                                 windowEnd: bigint,
                                 eligibility: Uint8Array,
                                 status: number,
                                 awardCommitment: Uint8Array,
                                 winnerBidCommitment: Uint8Array,
                                 treasuryActionId: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { windowStart: bigint,
  windowEnd: bigint,
  eligibility: Uint8Array,
  status: number,
  awardCommitment: Uint8Array,
  winnerBidCommitment: Uint8Array,
  treasuryActionId: Uint8Array
}]>
  };
  bidCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  readonly procurementCount: bigint;
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
