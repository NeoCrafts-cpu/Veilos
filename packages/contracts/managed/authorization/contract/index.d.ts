import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  memberSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  agentSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  agentRole(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  roleSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  policyPerActionLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  policyDailyLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  policyVendorId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  policyCredentialOk(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
  policyCredentialExpiry(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  policySelfModifyAllowed(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
  policySalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  spendPeriodStart(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  spendDaily(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  spendSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  nextSpendSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  setOrganizationStatus(context: __compactRuntime.CircuitContext<PS>,
                        status_0: number): __compactRuntime.CircuitResults<PS, []>;
  registerMember(context: __compactRuntime.CircuitContext<PS>,
                 memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setMemberStatus(context: __compactRuntime.CircuitContext<PS>,
                  memberId_0: Uint8Array,
                  status_0: number): __compactRuntime.CircuitResults<PS, []>;
  createAgent(context: __compactRuntime.CircuitContext<PS>,
              agentId_0: Uint8Array,
              memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicyBySelf(context: __compactRuntime.CircuitContext<PS>,
                       agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentStatus(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array,
                 status_0: number): __compactRuntime.CircuitResults<PS, []>;
  authorizeAction(context: __compactRuntime.CircuitContext<PS>,
                  agentId_0: Uint8Array,
                  actionId_0: Uint8Array,
                  actionType_0: number,
                  amount_0: bigint,
                  vendorId_0: Uint8Array,
                  claimedOrganizationId_0: Uint8Array,
                  periodStart_0: bigint,
                  periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  setOrganizationStatus(context: __compactRuntime.CircuitContext<PS>,
                        status_0: number): __compactRuntime.CircuitResults<PS, []>;
  registerMember(context: __compactRuntime.CircuitContext<PS>,
                 memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setMemberStatus(context: __compactRuntime.CircuitContext<PS>,
                  memberId_0: Uint8Array,
                  status_0: number): __compactRuntime.CircuitResults<PS, []>;
  createAgent(context: __compactRuntime.CircuitContext<PS>,
              agentId_0: Uint8Array,
              memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicyBySelf(context: __compactRuntime.CircuitContext<PS>,
                       agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentStatus(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array,
                 status_0: number): __compactRuntime.CircuitResults<PS, []>;
  authorizeAction(context: __compactRuntime.CircuitContext<PS>,
                  agentId_0: Uint8Array,
                  actionId_0: Uint8Array,
                  actionType_0: number,
                  amount_0: bigint,
                  vendorId_0: Uint8Array,
                  claimedOrganizationId_0: Uint8Array,
                  periodStart_0: bigint,
                  periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  ownerCommitmentOf(sk_0: Uint8Array): Uint8Array;
  memberCommitmentOf(sk_0: Uint8Array): Uint8Array;
  agentCommitmentOf(sk_0: Uint8Array): Uint8Array;
  roleCommitmentOf(role_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
  policyCommitmentOf(perActionLimit_0: bigint,
                     dailyLimit_0: bigint,
                     vendorId_0: Uint8Array,
                     credentialOk_0: boolean,
                     credentialExpiry_0: bigint,
                     selfModifyAllowed_0: boolean,
                     salt_0: Uint8Array): Uint8Array;
  spendCommitmentOf(periodStart_0: bigint,
                    dailySpend_0: bigint,
                    salt_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  ownerCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  memberCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  agentCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  roleCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                   role_0: Uint8Array,
                   salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  policyCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                     perActionLimit_0: bigint,
                     dailyLimit_0: bigint,
                     vendorId_0: Uint8Array,
                     credentialOk_0: boolean,
                     credentialExpiry_0: bigint,
                     selfModifyAllowed_0: boolean,
                     salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  spendCommitmentOf(context: __compactRuntime.CircuitContext<PS>,
                    periodStart_0: bigint,
                    dailySpend_0: bigint,
                    salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  setOrganizationStatus(context: __compactRuntime.CircuitContext<PS>,
                        status_0: number): __compactRuntime.CircuitResults<PS, []>;
  registerMember(context: __compactRuntime.CircuitContext<PS>,
                 memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setMemberStatus(context: __compactRuntime.CircuitContext<PS>,
                  memberId_0: Uint8Array,
                  status_0: number): __compactRuntime.CircuitResults<PS, []>;
  createAgent(context: __compactRuntime.CircuitContext<PS>,
              agentId_0: Uint8Array,
              memberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentPolicyBySelf(context: __compactRuntime.CircuitContext<PS>,
                       agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setAgentStatus(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array,
                 status_0: number): __compactRuntime.CircuitResults<PS, []>;
  authorizeAction(context: __compactRuntime.CircuitContext<PS>,
                  agentId_0: Uint8Array,
                  actionId_0: Uint8Array,
                  actionType_0: number,
                  amount_0: bigint,
                  vendorId_0: Uint8Array,
                  claimedOrganizationId_0: Uint8Array,
                  periodStart_0: bigint,
                  periodEnd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly organizationId: Uint8Array;
  readonly organizationStatus: number;
  readonly adminCommitment: Uint8Array;
  members: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { organizationId: Uint8Array,
                                 status: number,
                                 memberCommitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { organizationId: Uint8Array, status: number, memberCommitment: Uint8Array }]>
  };
  agents: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { organizationId: Uint8Array,
                                 status: number,
                                 memberId: Uint8Array,
                                 ownerCommitment: Uint8Array,
                                 agentCommitment: Uint8Array,
                                 roleCommitment: Uint8Array,
                                 policyCommitment: Uint8Array,
                                 spendCommitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { organizationId: Uint8Array,
  status: number,
  memberId: Uint8Array,
  ownerCommitment: Uint8Array,
  agentCommitment: Uint8Array,
  roleCommitment: Uint8Array,
  policyCommitment: Uint8Array,
  spendCommitment: Uint8Array
}]>
  };
  usedActionIds: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  actions: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { agentId: Uint8Array,
                                 actionType: number,
                                 result: number,
                                 resultCommitment: Uint8Array,
                                 periodStart: bigint,
                                 periodEnd: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { agentId: Uint8Array,
  actionType: number,
  result: number,
  resultCommitment: Uint8Array,
  periodStart: bigint,
  periodEnd: bigint
}]>
  };
  readonly memberCount: bigint;
  readonly agentCount: bigint;
  readonly actionCount: bigint;
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
