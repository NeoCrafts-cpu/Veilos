import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  recordDisclosure(context: __compactRuntime.CircuitContext<PS>,
                   disclosureId_0: Uint8Array,
                   auditorId_0: Uint8Array,
                   scopeCommitment_0: Uint8Array,
                   expires_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  recordDisclosure(context: __compactRuntime.CircuitContext<PS>,
                   disclosureId_0: Uint8Array,
                   auditorId_0: Uint8Array,
                   scopeCommitment_0: Uint8Array,
                   expires_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  ownerCommitmentOf(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  ownerCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
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
  readonly disclosureCount: bigint;
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
