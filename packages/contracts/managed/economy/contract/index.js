import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = __compactRuntime.CompactTypeBoolean;

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(1, 1);

class _ProcurementPublic_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      windowStart: _descriptor_2.fromValue(value_0),
      windowEnd: _descriptor_2.fromValue(value_0),
      eligibility: _descriptor_0.fromValue(value_0),
      status: _descriptor_3.fromValue(value_0),
      awardCommitment: _descriptor_0.fromValue(value_0),
      winnerBidCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.windowStart).concat(_descriptor_2.toValue(value_0.windowEnd).concat(_descriptor_0.toValue(value_0.eligibility).concat(_descriptor_3.toValue(value_0.status).concat(_descriptor_0.toValue(value_0.awardCommitment).concat(_descriptor_0.toValue(value_0.winnerBidCommitment))))));
  }
}

const _descriptor_4 = new _ProcurementPublic_0();

const _descriptor_5 = new __compactRuntime.CompactTypeEnum(0, 0);

class _AuthReceipt_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()))));
  }
  fromValue(value_0) {
    return {
      agentId: _descriptor_0.fromValue(value_0),
      result: _descriptor_5.fromValue(value_0),
      intentCommitment: _descriptor_0.fromValue(value_0),
      periodStart: _descriptor_2.fromValue(value_0),
      periodEnd: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.agentId).concat(_descriptor_5.toValue(value_0.result).concat(_descriptor_0.toValue(value_0.intentCommitment).concat(_descriptor_2.toValue(value_0.periodStart).concat(_descriptor_2.toValue(value_0.periodEnd)))));
  }
}

const _descriptor_6 = new _AuthReceipt_0();

class _DisclosurePublic_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      auditorId: _descriptor_0.fromValue(value_0),
      scopeCommitment: _descriptor_0.fromValue(value_0),
      expires: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.auditorId).concat(_descriptor_0.toValue(value_0.scopeCommitment).concat(_descriptor_2.toValue(value_0.expires)));
  }
}

const _descriptor_7 = new _DisclosurePublic_0();

const _descriptor_8 = new __compactRuntime.CompactTypeEnum(1, 1);

class _ProposalPublic_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()))))));
  }
  fromValue(value_0) {
    return {
      actionCommitment: _descriptor_0.fromValue(value_0),
      voteStart: _descriptor_2.fromValue(value_0),
      voteEnd: _descriptor_2.fromValue(value_0),
      quorumCommitment: _descriptor_0.fromValue(value_0),
      status: _descriptor_8.fromValue(value_0),
      yesCount: _descriptor_2.fromValue(value_0),
      noCount: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.actionCommitment).concat(_descriptor_2.toValue(value_0.voteStart).concat(_descriptor_2.toValue(value_0.voteEnd).concat(_descriptor_0.toValue(value_0.quorumCommitment).concat(_descriptor_8.toValue(value_0.status).concat(_descriptor_2.toValue(value_0.yesCount).concat(_descriptor_2.toValue(value_0.noCount)))))));
  }
}

const _descriptor_9 = new _ProposalPublic_0();

class _SettlementPublic_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      actionId: _descriptor_0.fromValue(value_0),
      amount: _descriptor_2.fromValue(value_0),
      recipient: _descriptor_0.fromValue(value_0),
      periodStart: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.actionId).concat(_descriptor_2.toValue(value_0.amount).concat(_descriptor_0.toValue(value_0.recipient).concat(_descriptor_2.toValue(value_0.periodStart))));
  }
}

const _descriptor_10 = new _SettlementPublic_0();

const _descriptor_11 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _UserAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_12 = new _UserAddress_0();

const _descriptor_13 = new __compactRuntime.CompactTypeEnum(1, 1);

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_15 = __compactRuntime.CompactTypeField;

class _MerkleTreeDigest_0 {
  alignment() {
    return _descriptor_15.alignment();
  }
  fromValue(value_0) {
    return {
      field: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_15.toValue(value_0.field);
  }
}

const _descriptor_16 = new _MerkleTreeDigest_0();

class _MerkleTreePathEntry_0 {
  alignment() {
    return _descriptor_16.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      sibling: _descriptor_16.fromValue(value_0),
      goes_left: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_16.toValue(value_0.sibling).concat(_descriptor_1.toValue(value_0.goes_left));
  }
}

const _descriptor_17 = new _MerkleTreePathEntry_0();

const _descriptor_18 = new __compactRuntime.CompactTypeVector(10, _descriptor_17);

class _MerkleTreePath_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_18.alignment());
  }
  fromValue(value_0) {
    return {
      leaf: _descriptor_0.fromValue(value_0),
      path: _descriptor_18.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.leaf).concat(_descriptor_18.toValue(value_0.path));
  }
}

const _descriptor_19 = new _MerkleTreePath_0();

const _descriptor_20 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

const _descriptor_21 = new __compactRuntime.CompactTypeBytes(6);

class _LeafPreimage_0 {
  alignment() {
    return _descriptor_21.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      domain_sep: _descriptor_21.fromValue(value_0),
      data: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_21.toValue(value_0.domain_sep).concat(_descriptor_0.toValue(value_0.data));
  }
}

const _descriptor_22 = new _LeafPreimage_0();

const _descriptor_23 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_24 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_25 = new __compactRuntime.CompactTypeVector(11, _descriptor_0);

const _descriptor_26 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_27 = new __compactRuntime.CompactTypeVector(2, _descriptor_15);

const _descriptor_28 = new __compactRuntime.CompactTypeVector(6, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_1.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_29 = new _Either_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_30 = new _ContractAddress_0();

class _Either_1 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_30.alignment().concat(_descriptor_12.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_1.fromValue(value_0),
      left: _descriptor_30.fromValue(value_0),
      right: _descriptor_12.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.is_left).concat(_descriptor_30.toValue(value_0.left).concat(_descriptor_12.toValue(value_0.right)));
  }
}

const _descriptor_31 = new _Either_1();

const _descriptor_32 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.ownerSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named ownerSecret');
    }
    if (typeof(witnesses_0.holderSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named holderSecret');
    }
    if (typeof(witnesses_0.credentialClass) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credentialClass');
    }
    if (typeof(witnesses_0.credentialExpiry) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credentialExpiry');
    }
    if (typeof(witnesses_0.credentialSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credentialSalt');
    }
    if (typeof(witnesses_0.credentialPath) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credentialPath');
    }
    if (typeof(witnesses_0.revocationSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named revocationSecret');
    }
    if (typeof(witnesses_0.intentSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named intentSalt');
    }
    if (typeof(witnesses_0.reasonDigestW) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named reasonDigestW');
    }
    if (typeof(witnesses_0.vendorId) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named vendorId');
    }
    if (typeof(witnesses_0.perActionLimit) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named perActionLimit');
    }
    if (typeof(witnesses_0.dailyLimit) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named dailyLimit');
    }
    if (typeof(witnesses_0.spendPeriodStart) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named spendPeriodStart');
    }
    if (typeof(witnesses_0.spendDaily) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named spendDaily');
    }
    if (typeof(witnesses_0.ballotChoice) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named ballotChoice');
    }
    if (typeof(witnesses_0.ballotSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named ballotSalt');
    }
    if (typeof(witnesses_0.tallyYes) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named tallyYes');
    }
    if (typeof(witnesses_0.tallyNo) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named tallyNo');
    }
    if (typeof(witnesses_0.bidSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named bidSalt');
    }
    if (typeof(witnesses_0.bidAmount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named bidAmount');
    }
    if (typeof(witnesses_0.awardSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named awardSalt');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      ownerCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.ownerCommitmentOf(...args_1), context };
      },
      holderCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.holderCommitmentOf(...args_1), context };
      },
      credentialCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.credentialCommitmentOf(...args_1), context };
      },
      revocationNullifierOf(context, ...args_1) {
        return { result: pureCircuits.revocationNullifierOf(...args_1), context };
      },
      intentCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.intentCommitmentOf(...args_1), context };
      },
      settlementNullifierOf(context, ...args_1) {
        return { result: pureCircuits.settlementNullifierOf(...args_1), context };
      },
      ballotCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.ballotCommitmentOf(...args_1), context };
      },
      voteNullifierOf(context, ...args_1) {
        return { result: pureCircuits.voteNullifierOf(...args_1), context };
      },
      bidCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.bidCommitmentOf(...args_1), context };
      },
      awardCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.awardCommitmentOf(...args_1), context };
      },
      addressCommitmentOf(context, ...args_1) {
        return { result: pureCircuits.addressCommitmentOf(...args_1), context };
      },
      issueCredential: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`issueCredential: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const commitment_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 273 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 273 char 1',
                                     'Bytes<32>',
                                     commitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(commitment_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issueCredential_0(context,
                                                 partialProofData,
                                                 commitment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revokeCredential: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeCredential: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const nullifier_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeCredential',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 280 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(nullifier_0.buffer instanceof ArrayBuffer && nullifier_0.BYTES_PER_ELEMENT === 1 && nullifier_0.length === 32)) {
          __compactRuntime.typeError('revokeCredential',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 280 char 1',
                                     'Bytes<32>',
                                     nullifier_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(nullifier_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeCredential_0(context,
                                                  partialProofData,
                                                  nullifier_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      authorizePayment: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`authorizePayment: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const agentId_0 = args_1[1];
        const actionId_0 = args_1[2];
        const amount_0 = args_1[3];
        const vendor_0 = args_1[4];
        const periodStart_0 = args_1[5];
        const periodEnd_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Bytes<32>',
                                     agentId_0)
        }
        if (!(actionId_0.buffer instanceof ArrayBuffer && actionId_0.BYTES_PER_ELEMENT === 1 && actionId_0.length === 32)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Bytes<32>',
                                     actionId_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(vendor_0.buffer instanceof ArrayBuffer && vendor_0.BYTES_PER_ELEMENT === 1 && vendor_0.length === 32)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Bytes<32>',
                                     vendor_0)
        }
        if (!(typeof(periodStart_0) === 'bigint' && periodStart_0 >= 0n && periodStart_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Uint<0..18446744073709551616>',
                                     periodStart_0)
        }
        if (!(typeof(periodEnd_0) === 'bigint' && periodEnd_0 >= 0n && periodEnd_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('authorizePayment',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'economy.compact line 287 char 1',
                                     'Uint<0..18446744073709551616>',
                                     periodEnd_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(agentId_0).concat(_descriptor_0.toValue(actionId_0).concat(_descriptor_2.toValue(amount_0).concat(_descriptor_0.toValue(vendor_0).concat(_descriptor_2.toValue(periodStart_0).concat(_descriptor_2.toValue(periodEnd_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._authorizePayment_0(context,
                                                  partialProofData,
                                                  agentId_0,
                                                  actionId_0,
                                                  amount_0,
                                                  vendor_0,
                                                  periodStart_0,
                                                  periodEnd_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      depositNight: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`depositNight: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const amount_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('depositNight',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 332 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('depositNight',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 332 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     amount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_14.toValue(amount_0),
            alignment: _descriptor_14.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._depositNight_0(context,
                                              partialProofData,
                                              amount_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      settleAuthorizedPayment: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`settleAuthorizedPayment: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const actionId_0 = args_1[1];
        const amount_0 = args_1[2];
        const recipient_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('settleAuthorizedPayment',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 337 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(actionId_0.buffer instanceof ArrayBuffer && actionId_0.BYTES_PER_ELEMENT === 1 && actionId_0.length === 32)) {
          __compactRuntime.typeError('settleAuthorizedPayment',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 337 char 1',
                                     'Bytes<32>',
                                     actionId_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('settleAuthorizedPayment',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 337 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(typeof(recipient_0) === 'object' && recipient_0.bytes.buffer instanceof ArrayBuffer && recipient_0.bytes.BYTES_PER_ELEMENT === 1 && recipient_0.bytes.length === 32)) {
          __compactRuntime.typeError('settleAuthorizedPayment',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 337 char 1',
                                     'struct UserAddress<bytes: Bytes<32>>',
                                     recipient_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(actionId_0).concat(_descriptor_2.toValue(amount_0).concat(_descriptor_12.toValue(recipient_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_12.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._settleAuthorizedPayment_0(context,
                                                         partialProofData,
                                                         actionId_0,
                                                         amount_0,
                                                         recipient_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      createProposal: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`createProposal: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proposalId_0 = args_1[1];
        const actionCommitment_0 = args_1[2];
        const voteStart_0 = args_1[3];
        const voteEnd_0 = args_1[4];
        const quorumCommitment_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(proposalId_0.buffer instanceof ArrayBuffer && proposalId_0.BYTES_PER_ELEMENT === 1 && proposalId_0.length === 32)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'Bytes<32>',
                                     proposalId_0)
        }
        if (!(actionCommitment_0.buffer instanceof ArrayBuffer && actionCommitment_0.BYTES_PER_ELEMENT === 1 && actionCommitment_0.length === 32)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'Bytes<32>',
                                     actionCommitment_0)
        }
        if (!(typeof(voteStart_0) === 'bigint' && voteStart_0 >= 0n && voteStart_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'Uint<0..18446744073709551616>',
                                     voteStart_0)
        }
        if (!(typeof(voteEnd_0) === 'bigint' && voteEnd_0 >= 0n && voteEnd_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'Uint<0..18446744073709551616>',
                                     voteEnd_0)
        }
        if (!(quorumCommitment_0.buffer instanceof ArrayBuffer && quorumCommitment_0.BYTES_PER_ELEMENT === 1 && quorumCommitment_0.length === 32)) {
          __compactRuntime.typeError('createProposal',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'economy.compact line 378 char 1',
                                     'Bytes<32>',
                                     quorumCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(proposalId_0).concat(_descriptor_0.toValue(actionCommitment_0).concat(_descriptor_2.toValue(voteStart_0).concat(_descriptor_2.toValue(voteEnd_0).concat(_descriptor_0.toValue(quorumCommitment_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createProposal_0(context,
                                                partialProofData,
                                                proposalId_0,
                                                actionCommitment_0,
                                                voteStart_0,
                                                voteEnd_0,
                                                quorumCommitment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      castBallot: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`castBallot: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proposalId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('castBallot',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 399 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(proposalId_0.buffer instanceof ArrayBuffer && proposalId_0.BYTES_PER_ELEMENT === 1 && proposalId_0.length === 32)) {
          __compactRuntime.typeError('castBallot',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 399 char 1',
                                     'Bytes<32>',
                                     proposalId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(proposalId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._castBallot_0(context,
                                            partialProofData,
                                            proposalId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      finalizeProposal: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`finalizeProposal: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proposalId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('finalizeProposal',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 415 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(proposalId_0.buffer instanceof ArrayBuffer && proposalId_0.BYTES_PER_ELEMENT === 1 && proposalId_0.length === 32)) {
          __compactRuntime.typeError('finalizeProposal',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 415 char 1',
                                     'Bytes<32>',
                                     proposalId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(proposalId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._finalizeProposal_0(context,
                                                  partialProofData,
                                                  proposalId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      createProcurement: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`createProcurement: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const procurementId_0 = args_1[1];
        const windowStart_0 = args_1[2];
        const windowEnd_0 = args_1[3];
        const eligibility_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createProcurement',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 435 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(procurementId_0.buffer instanceof ArrayBuffer && procurementId_0.BYTES_PER_ELEMENT === 1 && procurementId_0.length === 32)) {
          __compactRuntime.typeError('createProcurement',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 435 char 1',
                                     'Bytes<32>',
                                     procurementId_0)
        }
        if (!(typeof(windowStart_0) === 'bigint' && windowStart_0 >= 0n && windowStart_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createProcurement',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 435 char 1',
                                     'Uint<0..18446744073709551616>',
                                     windowStart_0)
        }
        if (!(typeof(windowEnd_0) === 'bigint' && windowEnd_0 >= 0n && windowEnd_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createProcurement',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 435 char 1',
                                     'Uint<0..18446744073709551616>',
                                     windowEnd_0)
        }
        if (!(eligibility_0.buffer instanceof ArrayBuffer && eligibility_0.BYTES_PER_ELEMENT === 1 && eligibility_0.length === 32)) {
          __compactRuntime.typeError('createProcurement',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'economy.compact line 435 char 1',
                                     'Bytes<32>',
                                     eligibility_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(procurementId_0).concat(_descriptor_2.toValue(windowStart_0).concat(_descriptor_2.toValue(windowEnd_0).concat(_descriptor_0.toValue(eligibility_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createProcurement_0(context,
                                                   partialProofData,
                                                   procurementId_0,
                                                   windowStart_0,
                                                   windowEnd_0,
                                                   eligibility_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      submitBid: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`submitBid: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const procurementId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('submitBid',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 454 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(procurementId_0.buffer instanceof ArrayBuffer && procurementId_0.BYTES_PER_ELEMENT === 1 && procurementId_0.length === 32)) {
          __compactRuntime.typeError('submitBid',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 454 char 1',
                                     'Bytes<32>',
                                     procurementId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(procurementId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._submitBid_0(context,
                                           partialProofData,
                                           procurementId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      awardProcurement: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`awardProcurement: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const procurementId_0 = args_1[1];
        const winnerBid_0 = args_1[2];
        const actionId_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('awardProcurement',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 473 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(procurementId_0.buffer instanceof ArrayBuffer && procurementId_0.BYTES_PER_ELEMENT === 1 && procurementId_0.length === 32)) {
          __compactRuntime.typeError('awardProcurement',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 473 char 1',
                                     'Bytes<32>',
                                     procurementId_0)
        }
        if (!(winnerBid_0.buffer instanceof ArrayBuffer && winnerBid_0.BYTES_PER_ELEMENT === 1 && winnerBid_0.length === 32)) {
          __compactRuntime.typeError('awardProcurement',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 473 char 1',
                                     'Bytes<32>',
                                     winnerBid_0)
        }
        if (!(actionId_0.buffer instanceof ArrayBuffer && actionId_0.BYTES_PER_ELEMENT === 1 && actionId_0.length === 32)) {
          __compactRuntime.typeError('awardProcurement',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 473 char 1',
                                     'Bytes<32>',
                                     actionId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(procurementId_0).concat(_descriptor_0.toValue(winnerBid_0).concat(_descriptor_0.toValue(actionId_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._awardProcurement_0(context,
                                                  partialProofData,
                                                  procurementId_0,
                                                  winnerBid_0,
                                                  actionId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      recordDisclosure: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`recordDisclosure: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const disclosureId_0 = args_1[1];
        const auditorId_0 = args_1[2];
        const scopeCommitment_0 = args_1[3];
        const expires_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('recordDisclosure',
                                     'argument 1 (as invoked from Typescript)',
                                     'economy.compact line 493 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(disclosureId_0.buffer instanceof ArrayBuffer && disclosureId_0.BYTES_PER_ELEMENT === 1 && disclosureId_0.length === 32)) {
          __compactRuntime.typeError('recordDisclosure',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'economy.compact line 493 char 1',
                                     'Bytes<32>',
                                     disclosureId_0)
        }
        if (!(auditorId_0.buffer instanceof ArrayBuffer && auditorId_0.BYTES_PER_ELEMENT === 1 && auditorId_0.length === 32)) {
          __compactRuntime.typeError('recordDisclosure',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'economy.compact line 493 char 1',
                                     'Bytes<32>',
                                     auditorId_0)
        }
        if (!(scopeCommitment_0.buffer instanceof ArrayBuffer && scopeCommitment_0.BYTES_PER_ELEMENT === 1 && scopeCommitment_0.length === 32)) {
          __compactRuntime.typeError('recordDisclosure',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'economy.compact line 493 char 1',
                                     'Bytes<32>',
                                     scopeCommitment_0)
        }
        if (!(typeof(expires_0) === 'bigint' && expires_0 >= 0n && expires_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('recordDisclosure',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'economy.compact line 493 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expires_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(disclosureId_0).concat(_descriptor_0.toValue(auditorId_0).concat(_descriptor_0.toValue(scopeCommitment_0).concat(_descriptor_2.toValue(expires_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._recordDisclosure_0(context,
                                                  partialProofData,
                                                  disclosureId_0,
                                                  auditorId_0,
                                                  scopeCommitment_0,
                                                  expires_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      issueCredential: this.circuits.issueCredential,
      revokeCredential: this.circuits.revokeCredential,
      authorizePayment: this.circuits.authorizePayment,
      depositNight: this.circuits.depositNight,
      settleAuthorizedPayment: this.circuits.settleAuthorizedPayment,
      createProposal: this.circuits.createProposal,
      castBallot: this.circuits.castBallot,
      finalizeProposal: this.circuits.finalizeProposal,
      createProcurement: this.circuits.createProcurement,
      submitBid: this.circuits.submitBid,
      awardProcurement: this.circuits.awardProcurement,
      recordDisclosure: this.circuits.recordDisclosure
    };
    this.provableCircuits = {
      issueCredential: this.circuits.issueCredential,
      revokeCredential: this.circuits.revokeCredential,
      authorizePayment: this.circuits.authorizePayment,
      depositNight: this.circuits.depositNight,
      settleAuthorizedPayment: this.circuits.settleAuthorizedPayment,
      createProposal: this.circuits.createProposal,
      castBallot: this.circuits.castBallot,
      finalizeProposal: this.circuits.finalizeProposal,
      createProcurement: this.circuits.createProcurement,
      submitBid: this.circuits.submitBid,
      awardProcurement: this.circuits.awardProcurement,
      recordDisclosure: this.circuits.recordDisclosure
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const orgId_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(orgId_0.buffer instanceof ArrayBuffer && orgId_0.BYTES_PER_ELEMENT === 1 && orgId_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'economy.compact line 267 char 1',
                                 'Bytes<32>',
                                 orgId_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    let stateValue_2 = __compactRuntime.StateValue.newArray();
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_2);
    let stateValue_1 = __compactRuntime.StateValue.newArray();
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_1);
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('issueCredential', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeCredential', new __compactRuntime.ContractOperation());
    state_0.setOperation('authorizePayment', new __compactRuntime.ContractOperation());
    state_0.setOperation('depositNight', new __compactRuntime.ContractOperation());
    state_0.setOperation('settleAuthorizedPayment', new __compactRuntime.ContractOperation());
    state_0.setOperation('createProposal', new __compactRuntime.ContractOperation());
    state_0.setOperation('castBallot', new __compactRuntime.ContractOperation());
    state_0.setOperation('finalizeProposal', new __compactRuntime.ContractOperation());
    state_0.setOperation('createProcurement', new __compactRuntime.ContractOperation());
    state_0.setOperation('submitBid', new __compactRuntime.ContractOperation());
    state_0.setOperation('awardProcurement', new __compactRuntime.ContractOperation());
    state_0.setOperation('recordDisclosure', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(0n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(1n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(2n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(0n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newArray()
                                                          .arrayPush(__compactRuntime.StateValue.newBoundedMerkleTree(
                                                                       new __compactRuntime.StateBoundedMerkleTree(10)
                                                                     )).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                        alignment: _descriptor_2.alignment() })).arrayPush(__compactRuntime.StateValue.newMap(
                                                                                                                                                                             new __compactRuntime.StateMap()
                                                                                                                                                                           ))
                                                          .encode() } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(2n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       'root',
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(1n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(2n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(3n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(4n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(5n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(6n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(7n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(8n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(9n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(10n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(11n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(12n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(13n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(14n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(0n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(orgId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(1n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(1),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = this._ownerCommitmentOf_0(this._ownerSecret_0(context,
                                                                partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_32.toValue(2n),
                                                                                              alignment: _descriptor_32.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _left_0(value_0) {
    return { is_left: true, left: value_0, right: new Uint8Array(32) };
  }
  _right_0(value_0) {
    return { is_left: false, left: { bytes: new Uint8Array(32) }, right: value_0 };
  }
  _merkleTreePathRoot_0(path_0) {
    return { field:
               this._folder_0((...args_0) =>
                                this._merkleTreePathEntryRoot_0(...args_0),
                              this._degradeToTransient_0(this._persistentHash_6({ domain_sep:
                                                                                    new Uint8Array([109, 100, 110, 58, 108, 104]),
                                                                                  data:
                                                                                    path_0.leaf })),
                              path_0.path) };
  }
  _merkleTreePathEntryRoot_0(recursiveDigest_0, entry_0) {
    const left_0 = entry_0.goes_left ? recursiveDigest_0 : entry_0.sibling.field;
    const right_0 = entry_0.goes_left ?
                    entry_0.sibling.field :
                    recursiveDigest_0;
    return this._transientHash_0([left_0, right_0]);
  }
  _sendUnshielded_0(context, partialProofData, color_0, amount_0, recipient_0) {
    const tmp_0 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(7n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_29.toValue(tmp_0),
                                                                                              alignment: _descriptor_29.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(amount_0),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    const tmp_1 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(8n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.alignedConcat(
                                                                                              { value: _descriptor_29.toValue(tmp_1),
                                                                                                alignment: _descriptor_29.alignment() },
                                                                                              { value: _descriptor_31.toValue(recipient_0),
                                                                                                alignment: _descriptor_31.alignment() }
                                                                                            )).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(amount_0),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    if (recipient_0.is_left
        &&
        this._equal_0(recipient_0.left.bytes,
                      _descriptor_30.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 2 } },
                                                                                  { idx: { cached: true,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_32.toValue(0n),
                                                                                                             alignment: _descriptor_32.alignment() } }] } },
                                                                                  { popeq: { cached: true,
                                                                                             result: undefined } }]).value).bytes))
    {
      const tmp_2 = this._left_0(color_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_32.toValue(6n),
                                                                    alignment: _descriptor_32.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_29.toValue(tmp_2),
                                                                                                alignment: _descriptor_29.alignment() }).encode() } },
                                         { dup: { n: 1 } },
                                         { dup: { n: 1 } },
                                         'member',
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(amount_0),
                                                                                                alignment: _descriptor_14.alignment() }).encode() } },
                                         { swap: { n: 0 } },
                                         'neg',
                                         { branch: { skip: 4 } },
                                         { dup: { n: 2 } },
                                         { dup: { n: 2 } },
                                         { idx: { cached: true,
                                                  pushPath: false,
                                                  path: [ { tag: 'stack' }] } },
                                         'add',
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
    }
    return [];
  }
  _receiveUnshielded_0(context, partialProofData, color_0, amount_0) {
    const tmp_0 = this._left_0(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(6n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_29.toValue(tmp_0),
                                                                                              alignment: _descriptor_29.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(amount_0),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    return [];
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_27, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_28, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_25, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_26, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_24, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_6(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _ownerSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.ownerSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('ownerSecret',
                                 'return value',
                                 'economy.compact line 76 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _holderSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.holderSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('holderSecret',
                                 'return value',
                                 'economy.compact line 77 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _credentialClass_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credentialClass(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('credentialClass',
                                 'return value',
                                 'economy.compact line 78 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _credentialExpiry_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credentialExpiry(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('credentialExpiry',
                                 'return value',
                                 'economy.compact line 79 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _credentialSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credentialSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('credentialSalt',
                                 'return value',
                                 'economy.compact line 80 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _credentialPath_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credentialPath(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.leaf.buffer instanceof ArrayBuffer && result_0.leaf.BYTES_PER_ELEMENT === 1 && result_0.leaf.length === 32 && Array.isArray(result_0.path) && result_0.path.length === 10 && result_0.path.every((t) => typeof(t) === 'object' && typeof(t.sibling) === 'object' && typeof(t.sibling.field) === 'bigint' && t.sibling.field >= 0 && t.sibling.field <= __compactRuntime.MAX_FIELD && typeof(t.goes_left) === 'boolean'))) {
      __compactRuntime.typeError('credentialPath',
                                 'return value',
                                 'economy.compact line 81 char 1',
                                 'struct MerkleTreePath<leaf: Bytes<32>, path: Vector<10, struct MerkleTreePathEntry<sibling: struct MerkleTreeDigest<field: Field>, goes_left: Boolean>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_19.toValue(result_0),
      alignment: _descriptor_19.alignment()
    });
    return result_0;
  }
  _revocationSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.revocationSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('revocationSecret',
                                 'return value',
                                 'economy.compact line 82 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _intentSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.intentSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('intentSalt',
                                 'return value',
                                 'economy.compact line 83 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _reasonDigestW_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.reasonDigestW(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('reasonDigestW',
                                 'return value',
                                 'economy.compact line 84 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _vendorId_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.vendorId(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('vendorId',
                                 'return value',
                                 'economy.compact line 85 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _perActionLimit_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.perActionLimit(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('perActionLimit',
                                 'return value',
                                 'economy.compact line 86 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _dailyLimit_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.dailyLimit(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('dailyLimit',
                                 'return value',
                                 'economy.compact line 87 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _spendPeriodStart_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.spendPeriodStart(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('spendPeriodStart',
                                 'return value',
                                 'economy.compact line 88 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _spendDaily_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.spendDaily(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('spendDaily',
                                 'return value',
                                 'economy.compact line 89 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _ballotChoice_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.ballotChoice(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('ballotChoice',
                                 'return value',
                                 'economy.compact line 93 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _ballotSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.ballotSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('ballotSalt',
                                 'return value',
                                 'economy.compact line 94 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _tallyYes_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.tallyYes(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('tallyYes',
                                 'return value',
                                 'economy.compact line 95 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _tallyNo_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.tallyNo(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('tallyNo',
                                 'return value',
                                 'economy.compact line 96 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _bidSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.bidSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('bidSalt',
                                 'return value',
                                 'economy.compact line 97 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _bidAmount_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.bidAmount(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('bidAmount',
                                 'return value',
                                 'economy.compact line 98 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _awardSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.awardSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('awardSalt',
                                 'return value',
                                 'economy.compact line 99 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _encodeUint64_0(n_0) {
    return __compactRuntime.convertFieldToBytes(32,
                                                n_0,
                                                'economy.compact line 102 char 10');
  }
  _ownerCommitmentOf_0(sk_0) {
    return this._persistentHash_4([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 111, 119, 110, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _holderCommitmentOf_0(sk_0) {
    return this._persistentHash_4([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 104, 111, 108, 100, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _credentialCommitmentOf_0(holder_0, org_0, classId_0, expiry_0, salt_0) {
    return this._persistentHash_0([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 99, 114, 101, 100, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   holder_0,
                                   org_0,
                                   this._encodeUint64_0(classId_0),
                                   this._encodeUint64_0(expiry_0),
                                   salt_0]);
  }
  _revocationNullifierOf_0(commitment_0, secret_0) {
    return this._persistentHash_5([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 99, 114, 101, 100, 114, 101, 118, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   commitment_0,
                                   secret_0]);
  }
  _intentCommitmentOf_0(actionId_0,
                        agentId_0,
                        org_0,
                        actionType_0,
                        amount_0,
                        vendor_0,
                        reason_0,
                        periodStart_0,
                        periodEnd_0,
                        salt_0)
  {
    return this._persistentHash_1([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 105, 110, 116, 101, 110, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   actionId_0,
                                   agentId_0,
                                   org_0,
                                   this._encodeUint64_0(actionType_0),
                                   this._encodeUint64_0(amount_0),
                                   vendor_0,
                                   reason_0,
                                   this._encodeUint64_0(periodStart_0),
                                   this._encodeUint64_0(periodEnd_0),
                                   salt_0]);
  }
  _settlementNullifierOf_0(actionId_0) {
    return this._persistentHash_4([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 115, 101, 116, 116, 108, 101, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   actionId_0]);
  }
  _ballotCommitmentOf_0(proposalId_0, holder_0, choice_0, salt_0) {
    return this._persistentHash_2([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 98, 97, 108, 108, 111, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   proposalId_0,
                                   holder_0,
                                   this._encodeUint64_0(choice_0),
                                   salt_0]);
  }
  _voteNullifierOf_0(proposalId_0, holder_0) {
    return this._persistentHash_5([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 118, 111, 116, 101, 110, 117, 108, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   proposalId_0,
                                   holder_0]);
  }
  _bidCommitmentOf_0(procurementId_0, holder_0, amount_0, salt_0) {
    return this._persistentHash_2([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 98, 105, 100, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   procurementId_0,
                                   holder_0,
                                   this._encodeUint64_0(amount_0),
                                   salt_0]);
  }
  _awardCommitmentOf_0(procurementId_0, winnerBid_0, salt_0) {
    return this._persistentHash_3([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 97, 119, 97, 114, 100, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   procurementId_0,
                                   winnerBid_0,
                                   salt_0]);
  }
  _addressCommitmentOf_0(addr_0) {
    return this._persistentHash_4([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 97, 100, 100, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   addr_0.bytes]);
  }
  _assertWindowIsNow_0(context, partialProofData, periodStart_0, periodEnd_0) {
    __compactRuntime.assert(periodEnd_0 > periodStart_0, 'invalid period');
    let t_0;
    __compactRuntime.assert((t_0 = (__compactRuntime.assert(periodEnd_0
                                                            >=
                                                            periodStart_0,
                                                            'result of subtraction would be negative'),
                                    periodEnd_0 - periodStart_0),
                             t_0 <= 86400n),
                            'period too long');
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(periodStart_0),
                                                                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                                                                       { dup: { n: 3 } },
                                                                                       { idx: { cached: true,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(2n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       'lt',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'period not started');
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(periodEnd_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        { dup: { n: 3 } },
                                                                                        { idx: { cached: true,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        'lt',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'period elapsed');
    return [];
  }
  _assertAdmin_0(context, partialProofData) {
    __compactRuntime.assert(this._equal_1(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_32.toValue(0n),
                                                                                                                                alignment: _descriptor_32.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_32.toValue(2n),
                                                                                                                                alignment: _descriptor_32.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._ownerCommitmentOf_0(this._ownerSecret_0(context,
                                                                                        partialProofData))),
                            'unauthorized');
    return [];
  }
  _currentCredentialCommitment_0(context, partialProofData) {
    return this._credentialCommitmentOf_0(this._holderCommitmentOf_0(this._holderSecret_0(context,
                                                                                          partialProofData)),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_32.toValue(0n),
                                                                                                                                alignment: _descriptor_32.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_32.toValue(0n),
                                                                                                                                alignment: _descriptor_32.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._credentialClass_0(context,
                                                                  partialProofData),
                                          this._credentialExpiry_0(context,
                                                                   partialProofData),
                                          this._credentialSalt_0(context,
                                                                 partialProofData));
  }
  _assertCredential_0(context, partialProofData, classId_0, periodEnd_0) {
    const commitment_0 = this._currentCredentialCommitment_0(context,
                                                             partialProofData);
    const path_0 = this._credentialPath_0(context, partialProofData);
    let tmp_0;
    __compactRuntime.assert((tmp_0 = this._merkleTreePathRoot_0(path_0),
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_16.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'credential path');
    __compactRuntime.assert(this._equal_2(this._credentialClass_0(context,
                                                                  partialProofData),
                                          classId_0),
                            'credential class');
    let t_0;
    __compactRuntime.assert((t_0 = this._credentialExpiry_0(context,
                                                            partialProofData),
                             t_0 >= periodEnd_0),
                            'credential expired');
    const nullifier_0 = this._revocationNullifierOf_0(commitment_0,
                                                      this._revocationSecret_0(context,
                                                                               partialProofData));
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'credential revoked');
    return [];
  }
  _issueCredential_0(context, partialProofData, commitment_0) {
    this._assertAdmin_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value)
                            ===
                            1,
                            'organization inactive');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_0.toValue(commitment_0),
                                                                                                alignment: _descriptor_0.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { addi: { immediate: 1 } },
                                       { ins: { cached: true, n: 1 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(2n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(0n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       'root',
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 3 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(2n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_11.toValue(tmp_0),
                                                                alignment: _descriptor_11.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _revokeCredential_0(context, partialProofData, nullifier_0) {
    this._assertAdmin_0(context, partialProofData);
    const publicNullifier_0 = nullifier_0;
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicNullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'already revoked');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicNullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _authorizePayment_0(context,
                      partialProofData,
                      agentId_0,
                      actionId_0,
                      amount_0,
                      vendor_0,
                      periodStart_0,
                      periodEnd_0)
  {
    const publicAgentId_0 = agentId_0;
    const publicActionId_0 = actionId_0;
    const publicPeriodStart_0 = periodStart_0;
    const publicPeriodEnd_0 = periodEnd_0;
    __compactRuntime.assert(_descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value)
                            ===
                            1,
                            'organization inactive');
    this._assertWindowIsNow_0(context,
                              partialProofData,
                              publicPeriodStart_0,
                              publicPeriodEnd_0);
    this._assertCredential_0(context, partialProofData, 1n, publicPeriodEnd_0);
    __compactRuntime.assert(this._equal_3(vendor_0,
                                          this._vendorId_0(context,
                                                           partialProofData)),
                            'policy predicate failed');
    __compactRuntime.assert(amount_0
                            <=
                            this._perActionLimit_0(context, partialProofData),
                            'policy predicate failed');
    let t_0;
    __compactRuntime.assert((t_0 = this._spendPeriodStart_0(context,
                                                            partialProofData),
                             t_0 <= publicPeriodStart_0),
                            'stale period');
    const carried_0 = this._equal_4(this._spendPeriodStart_0(context,
                                                             partialProofData),
                                    publicPeriodStart_0)
                      ?
                      this._spendDaily_0(context, partialProofData) :
                      0n;
    const nextSpend_0 = carried_0 + amount_0;
    __compactRuntime.assert(nextSpend_0
                            <=
                            this._dailyLimit_0(context, partialProofData),
                            'policy predicate failed');
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(3n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'replay');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(3n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const intentC_0 = this._intentCommitmentOf_0(publicActionId_0,
                                                 publicAgentId_0,
                                                 _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_32.toValue(0n),
                                                                                                                                       alignment: _descriptor_32.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_32.toValue(0n),
                                                                                                                                       alignment: _descriptor_32.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value),
                                                 0n,
                                                 amount_0,
                                                 vendor_0,
                                                 this._reasonDigestW_0(context,
                                                                       partialProofData),
                                                 publicPeriodStart_0,
                                                 publicPeriodEnd_0,
                                                 this._intentSalt_0(context,
                                                                    partialProofData));
    const tmp_0 = { agentId: publicAgentId_0,
                    result: 0,
                    intentCommitment: intentC_0,
                    periodStart: publicPeriodStart_0,
                    periodEnd: publicPeriodEnd_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(4n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(tmp_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(5n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_11.toValue(tmp_1),
                                                                alignment: _descriptor_11.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _depositNight_0(context, partialProofData, amount_0) {
    this._assertAdmin_0(context, partialProofData);
    this._receiveUnshielded_0(context,
                              partialProofData,
                              new Uint8Array(32),
                              amount_0);
    return [];
  }
  _settleAuthorizedPayment_0(context,
                             partialProofData,
                             actionId_0,
                             amount_0,
                             recipient_0)
  {
    const publicActionId_0 = actionId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(4n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'authorization missing');
    const receipt_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_32.toValue(1n),
                                                                                                            alignment: _descriptor_32.alignment() } },
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_32.toValue(4n),
                                                                                                            alignment: _descriptor_32.alignment() } }] } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_0.toValue(publicActionId_0),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    __compactRuntime.assert(receipt_0.result === 0, 'not authorized');
    const addrC_0 = this._addressCommitmentOf_0(recipient_0);
    __compactRuntime.assert(this._equal_5(addrC_0,
                                          this._vendorId_0(context,
                                                           partialProofData)),
                            'recipient mismatch');
    const intentC_0 = this._intentCommitmentOf_0(publicActionId_0,
                                                 receipt_0.agentId,
                                                 _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_32.toValue(0n),
                                                                                                                                       alignment: _descriptor_32.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_32.toValue(0n),
                                                                                                                                       alignment: _descriptor_32.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value),
                                                 0n,
                                                 amount_0,
                                                 this._vendorId_0(context,
                                                                  partialProofData),
                                                 this._reasonDigestW_0(context,
                                                                       partialProofData),
                                                 receipt_0.periodStart,
                                                 receipt_0.periodEnd,
                                                 this._intentSalt_0(context,
                                                                    partialProofData));
    __compactRuntime.assert(this._equal_6(receipt_0.intentCommitment, intentC_0),
                            'intent mismatch');
    const settleN_0 = this._settlementNullifierOf_0(publicActionId_0);
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(6n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(settleN_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'already settled');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(6n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(settleN_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_0 = { actionId: publicActionId_0,
                    amount: amount_0,
                    recipient: addrC_0,
                    periodStart: receipt_0.periodStart };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(7n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(tmp_0),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(8n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_11.toValue(tmp_1),
                                                                alignment: _descriptor_11.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    this._sendUnshielded_0(context,
                           partialProofData,
                           new Uint8Array(32),
                           amount_0,
                           this._right_0(recipient_0));
    return [];
  }
  _createProposal_0(context,
                    partialProofData,
                    proposalId_0,
                    actionCommitment_0,
                    voteStart_0,
                    voteEnd_0,
                    quorumCommitment_0)
  {
    this._assertAdmin_0(context, partialProofData);
    const publicId_0 = proposalId_0;
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(9n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'proposal exists');
    const tmp_0 = { actionCommitment: actionCommitment_0,
                    voteStart: voteStart_0,
                    voteEnd: voteEnd_0,
                    quorumCommitment: quorumCommitment_0,
                    status: 0,
                    yesCount: 0n,
                    noCount: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(9n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(tmp_0),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _castBallot_0(context, partialProofData, proposalId_0) {
    const publicId_0 = proposalId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(9n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'proposal missing');
    const proposal_0 = _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_32.toValue(1n),
                                                                                                             alignment: _descriptor_32.alignment() } },
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_32.toValue(9n),
                                                                                                             alignment: _descriptor_32.alignment() } }] } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_0.toValue(publicId_0),
                                                                                                             alignment: _descriptor_0.alignment() } }] } },
                                                                                  { popeq: { cached: false,
                                                                                             result: undefined } }]).value);
    __compactRuntime.assert(proposal_0.status === 0, 'proposal closed');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = proposal_0.voteStart,
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        { dup: { n: 3 } },
                                                                                        { idx: { cached: true,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        'lt',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'vote not started');
    let tmp_1;
    __compactRuntime.assert(!(tmp_1 = proposal_0.voteEnd,
                              _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                                                                         { dup: { n: 3 } },
                                                                                         { idx: { cached: true,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_32.toValue(2n),
                                                                                                                    alignment: _descriptor_32.alignment() } }] } },
                                                                                         'lt',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value)),
                            'vote elapsed');
    this._assertCredential_0(context, partialProofData, 0n, proposal_0.voteEnd);
    const holder_0 = this._holderCommitmentOf_0(this._holderSecret_0(context,
                                                                     partialProofData));
    const nullifier_0 = this._voteNullifierOf_0(publicId_0, holder_0);
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(10n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'already voted');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(10n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const ballotC_0 = this._ballotCommitmentOf_0(publicId_0,
                                                 holder_0,
                                                 this._ballotChoice_0(context,
                                                                      partialProofData),
                                                 this._ballotSalt_0(context,
                                                                    partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(11n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(ballotC_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _finalizeProposal_0(context, partialProofData, proposalId_0) {
    this._assertAdmin_0(context, partialProofData);
    const publicId_0 = proposalId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(9n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'proposal missing');
    const proposal_0 = _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_32.toValue(1n),
                                                                                                             alignment: _descriptor_32.alignment() } },
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_32.toValue(9n),
                                                                                                             alignment: _descriptor_32.alignment() } }] } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_0.toValue(publicId_0),
                                                                                                             alignment: _descriptor_0.alignment() } }] } },
                                                                                  { popeq: { cached: false,
                                                                                             result: undefined } }]).value);
    __compactRuntime.assert(proposal_0.status === 0, 'proposal closed');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = proposal_0.voteEnd,
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        { dup: { n: 3 } },
                                                                                        { idx: { cached: true,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        'lt',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'vote still open');
    const yes_0 = this._tallyYes_0(context, partialProofData);
    const no_0 = this._tallyNo_0(context, partialProofData);
    const tmp_1 = { actionCommitment: proposal_0.actionCommitment,
                    voteStart: proposal_0.voteStart,
                    voteEnd: proposal_0.voteEnd,
                    quorumCommitment: proposal_0.quorumCommitment,
                    status: 1,
                    yesCount: yes_0,
                    noCount: no_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(9n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(tmp_1),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _createProcurement_0(context,
                       partialProofData,
                       procurementId_0,
                       windowStart_0,
                       windowEnd_0,
                       eligibility_0)
  {
    this._assertAdmin_0(context, partialProofData);
    const publicId_0 = procurementId_0;
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(12n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'procurement exists');
    const tmp_0 = { windowStart: windowStart_0,
                    windowEnd: windowEnd_0,
                    eligibility: eligibility_0,
                    status: 0,
                    awardCommitment: new Uint8Array(32),
                    winnerBidCommitment: new Uint8Array(32) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(12n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _submitBid_0(context, partialProofData, procurementId_0) {
    const publicId_0 = procurementId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(12n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'procurement missing');
    const lot_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_32.toValue(1n),
                                                                                                        alignment: _descriptor_32.alignment() } },
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_32.toValue(12n),
                                                                                                        alignment: _descriptor_32.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(publicId_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    __compactRuntime.assert(lot_0.status === 0, 'procurement closed');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = lot_0.windowStart,
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        { dup: { n: 3 } },
                                                                                        { idx: { cached: true,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        'lt',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'bidding not started');
    let tmp_1;
    __compactRuntime.assert(!(tmp_1 = lot_0.windowEnd,
                              _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                                                                         { dup: { n: 3 } },
                                                                                         { idx: { cached: true,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_32.toValue(2n),
                                                                                                                    alignment: _descriptor_32.alignment() } }] } },
                                                                                         'lt',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value)),
                            'bidding elapsed');
    this._assertCredential_0(context, partialProofData, 2n, lot_0.windowEnd);
    const holder_0 = this._holderCommitmentOf_0(this._holderSecret_0(context,
                                                                     partialProofData));
    const bidC_0 = this._bidCommitmentOf_0(publicId_0,
                                           holder_0,
                                           this._bidAmount_0(context,
                                                             partialProofData),
                                           this._bidSalt_0(context,
                                                           partialProofData));
    const bidKey_0 = this._persistentHash_5([new Uint8Array([118, 101, 108, 105, 111, 115, 58, 98, 105, 100, 107, 101, 121, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                             publicId_0,
                                             holder_0]);
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_32.toValue(13n),
                                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(bidKey_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'duplicate bid');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(13n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(bidKey_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(bidC_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _awardProcurement_0(context,
                      partialProofData,
                      procurementId_0,
                      winnerBid_0,
                      actionId_0)
  {
    this._assertAdmin_0(context, partialProofData);
    const publicId_0 = procurementId_0;
    const publicActionId_0 = actionId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(12n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'procurement missing');
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(1n),
                                                                                                                  alignment: _descriptor_32.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_32.toValue(4n),
                                                                                                                  alignment: _descriptor_32.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicActionId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'authorization missing');
    let tmp_0;
    __compactRuntime.assert(!(tmp_0 = this._settlementNullifierOf_0(publicActionId_0),
                              _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { dup: { n: 0 } },
                                                                                         { idx: { cached: false,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_32.toValue(1n),
                                                                                                                    alignment: _descriptor_32.alignment() } },
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_32.toValue(6n),
                                                                                                                    alignment: _descriptor_32.alignment() } }] } },
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                                                         'member',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value)),
                            'already settled');
    const lot_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_32.toValue(1n),
                                                                                                        alignment: _descriptor_32.alignment() } },
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_32.toValue(12n),
                                                                                                        alignment: _descriptor_32.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(publicId_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    __compactRuntime.assert(lot_0.status === 0, 'procurement closed');
    const awardC_0 = this._awardCommitmentOf_0(publicId_0,
                                               winnerBid_0,
                                               this._awardSalt_0(context,
                                                                 partialProofData));
    const tmp_1 = { windowStart: lot_0.windowStart,
                    windowEnd: lot_0.windowEnd,
                    eligibility: lot_0.eligibility,
                    status: 1,
                    awardCommitment: awardC_0,
                    winnerBidCommitment: winnerBid_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(12n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_1),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _recordDisclosure_0(context,
                      partialProofData,
                      disclosureId_0,
                      auditorId_0,
                      scopeCommitment_0,
                      expires_0)
  {
    this._assertAdmin_0(context, partialProofData);
    const publicId_0 = disclosureId_0;
    const tmp_0 = { auditorId: auditorId_0,
                    scopeCommitment: scopeCommitment_0,
                    expires: expires_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(1n),
                                                                  alignment: _descriptor_32.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_32.toValue(14n),
                                                                  alignment: _descriptor_32.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(publicId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _folder_0(f, x, a0) {
    for (let i = 0; i < 10; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get organizationId() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get organizationStatus() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_32.toValue(0n),
                                                                                                    alignment: _descriptor_32.alignment() } },
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_32.toValue(1n),
                                                                                                    alignment: _descriptor_32.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get adminCommitment() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(0n),
                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    credentialTree: {
      isFull(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isFull: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(0n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1024n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'lt',
                                                                          'neg',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      checkRoot(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`checkRoot: expected 1 argument, received ${args_0.length}`);
        }
        const rt_0 = args_0[0];
        if (!(typeof(rt_0) === 'object' && typeof(rt_0.field) === 'bigint' && rt_0.field >= 0 && rt_0.field <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('checkRoot',
                                     'argument 1',
                                     'economy.compact line 60 char 1',
                                     'struct MerkleTreeDigest<field: Field>',
                                     rt_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(0n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(2n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(rt_0),
                                                                                                                                 alignment: _descriptor_16.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      root(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`root: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[0];
        return ((result) => result             ? __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(result)             : undefined)(self_0.asArray()[0].asBoundedMerkleTree().rehash().root()?.value);
      },
      firstFree(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`first_free: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[0];
        return __compactRuntime.CompactTypeField.fromValue(self_0.asArray()[1].asCell().value);
      },
      pathForLeaf(...args_0) {
        if (args_0.length !== 2) {
          throw new __compactRuntime.CompactError(`path_for_leaf: expected 2 arguments, received ${args_0.length}`);
        }
        const index_0 = args_0[0];
        const leaf_0 = args_0[1];
        if (!(typeof(index_0) === 'bigint' && index_0 >= 0 && index_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 1',
                                     'economy.compact line 60 char 1',
                                     'Field',
                                     index_0)
        }
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 2',
                                     'economy.compact line 60 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[1].asArray()[0];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(10, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().pathForLeaf(    index_0,    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      },
      findPathForLeaf(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`find_path_for_leaf: expected 1 argument, received ${args_0.length}`);
        }
        const leaf_0 = args_0[0];
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('find_path_for_leaf',
                                     'argument 1',
                                     'economy.compact line 60 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[1].asArray()[0];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(10, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().findPathForLeaf(    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      },
      history(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`history: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[0];
        return self_0.asArray()[2].asMap().keys().map(  (elem) => __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    revokedNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 61 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[1];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get credentialCount() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(2n),
                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    usedActionIds: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(3n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(3n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 63 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(3n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[3];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    authorizations: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(4n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(4n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(4n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(4n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get actionCount() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(5n),
                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    settlementNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(6n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(6n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 66 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(6n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[6];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    settlements: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(7n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(7n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(7n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_32.toValue(1n),
                                                                                                      alignment: _descriptor_32.alignment() } },
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_32.toValue(7n),
                                                                                                      alignment: _descriptor_32.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[7];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_10.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get settlementCount() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(1n),
                                                                                                   alignment: _descriptor_32.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_32.toValue(8n),
                                                                                                   alignment: _descriptor_32.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    proposals: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(9n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(9n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 69 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(9n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 69 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(9n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[9];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_9.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    voteNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(10n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(10n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 70 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(10n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[10];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    ballotCommitments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(11n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(11n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 71 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(11n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 71 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(11n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[11];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    procurements: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(12n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(12n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 72 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(12n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 72 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(12n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[12];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    bidCommitments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(13n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(13n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 73 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(13n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 73 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(13n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[13];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    disclosures: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(14n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(14n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'economy.compact line 74 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(14n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'economy.compact line 74 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(1n),
                                                                                                     alignment: _descriptor_32.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_32.toValue(14n),
                                                                                                     alignment: _descriptor_32.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[14];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  ownerSecret: (...args) => undefined,
  holderSecret: (...args) => undefined,
  credentialClass: (...args) => undefined,
  credentialExpiry: (...args) => undefined,
  credentialSalt: (...args) => undefined,
  credentialPath: (...args) => undefined,
  revocationSecret: (...args) => undefined,
  intentSalt: (...args) => undefined,
  reasonDigestW: (...args) => undefined,
  vendorId: (...args) => undefined,
  perActionLimit: (...args) => undefined,
  dailyLimit: (...args) => undefined,
  spendPeriodStart: (...args) => undefined,
  spendDaily: (...args) => undefined,
  ballotChoice: (...args) => undefined,
  ballotSalt: (...args) => undefined,
  tallyYes: (...args) => undefined,
  tallyNo: (...args) => undefined,
  bidSalt: (...args) => undefined,
  bidAmount: (...args) => undefined,
  awardSalt: (...args) => undefined
});
export const pureCircuits = {
  ownerCommitmentOf: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`ownerCommitmentOf: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('ownerCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 105 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._ownerCommitmentOf_0(sk_0);
  },
  holderCommitmentOf: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`holderCommitmentOf: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('holderCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 112 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._holderCommitmentOf_0(sk_0);
  },
  credentialCommitmentOf: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`credentialCommitmentOf: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const holder_0 = args_0[0];
    const org_0 = args_0[1];
    const classId_0 = args_0[2];
    const expiry_0 = args_0[3];
    const salt_0 = args_0[4];
    if (!(holder_0.buffer instanceof ArrayBuffer && holder_0.BYTES_PER_ELEMENT === 1 && holder_0.length === 32)) {
      __compactRuntime.typeError('credentialCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 119 char 1',
                                 'Bytes<32>',
                                 holder_0)
    }
    if (!(org_0.buffer instanceof ArrayBuffer && org_0.BYTES_PER_ELEMENT === 1 && org_0.length === 32)) {
      __compactRuntime.typeError('credentialCommitmentOf',
                                 'argument 2',
                                 'economy.compact line 119 char 1',
                                 'Bytes<32>',
                                 org_0)
    }
    if (!(typeof(classId_0) === 'bigint' && classId_0 >= 0n && classId_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('credentialCommitmentOf',
                                 'argument 3',
                                 'economy.compact line 119 char 1',
                                 'Uint<0..18446744073709551616>',
                                 classId_0)
    }
    if (!(typeof(expiry_0) === 'bigint' && expiry_0 >= 0n && expiry_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('credentialCommitmentOf',
                                 'argument 4',
                                 'economy.compact line 119 char 1',
                                 'Uint<0..18446744073709551616>',
                                 expiry_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('credentialCommitmentOf',
                                 'argument 5',
                                 'economy.compact line 119 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._credentialCommitmentOf_0(holder_0,
                                                    org_0,
                                                    classId_0,
                                                    expiry_0,
                                                    salt_0);
  },
  revocationNullifierOf: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`revocationNullifierOf: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const commitment_0 = args_0[0];
    const secret_0 = args_0[1];
    if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
      __compactRuntime.typeError('revocationNullifierOf',
                                 'argument 1',
                                 'economy.compact line 136 char 1',
                                 'Bytes<32>',
                                 commitment_0)
    }
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('revocationNullifierOf',
                                 'argument 2',
                                 'economy.compact line 136 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._revocationNullifierOf_0(commitment_0, secret_0);
  },
  intentCommitmentOf: (...args_0) => {
    if (args_0.length !== 10) {
      throw new __compactRuntime.CompactError(`intentCommitmentOf: expected 10 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const actionId_0 = args_0[0];
    const agentId_0 = args_0[1];
    const org_0 = args_0[2];
    const actionType_0 = args_0[3];
    const amount_0 = args_0[4];
    const vendor_0 = args_0[5];
    const reason_0 = args_0[6];
    const periodStart_0 = args_0[7];
    const periodEnd_0 = args_0[8];
    const salt_0 = args_0[9];
    if (!(actionId_0.buffer instanceof ArrayBuffer && actionId_0.BYTES_PER_ELEMENT === 1 && actionId_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 actionId_0)
    }
    if (!(agentId_0.buffer instanceof ArrayBuffer && agentId_0.BYTES_PER_ELEMENT === 1 && agentId_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 2',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 agentId_0)
    }
    if (!(org_0.buffer instanceof ArrayBuffer && org_0.BYTES_PER_ELEMENT === 1 && org_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 3',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 org_0)
    }
    if (!(typeof(actionType_0) === 'bigint' && actionType_0 >= 0n && actionType_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 4',
                                 'economy.compact line 144 char 1',
                                 'Uint<0..18446744073709551616>',
                                 actionType_0)
    }
    if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 5',
                                 'economy.compact line 144 char 1',
                                 'Uint<0..18446744073709551616>',
                                 amount_0)
    }
    if (!(vendor_0.buffer instanceof ArrayBuffer && vendor_0.BYTES_PER_ELEMENT === 1 && vendor_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 6',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 vendor_0)
    }
    if (!(reason_0.buffer instanceof ArrayBuffer && reason_0.BYTES_PER_ELEMENT === 1 && reason_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 7',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 reason_0)
    }
    if (!(typeof(periodStart_0) === 'bigint' && periodStart_0 >= 0n && periodStart_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 8',
                                 'economy.compact line 144 char 1',
                                 'Uint<0..18446744073709551616>',
                                 periodStart_0)
    }
    if (!(typeof(periodEnd_0) === 'bigint' && periodEnd_0 >= 0n && periodEnd_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 9',
                                 'economy.compact line 144 char 1',
                                 'Uint<0..18446744073709551616>',
                                 periodEnd_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('intentCommitmentOf',
                                 'argument 10',
                                 'economy.compact line 144 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._intentCommitmentOf_0(actionId_0,
                                                agentId_0,
                                                org_0,
                                                actionType_0,
                                                amount_0,
                                                vendor_0,
                                                reason_0,
                                                periodStart_0,
                                                periodEnd_0,
                                                salt_0);
  },
  settlementNullifierOf: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`settlementNullifierOf: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const actionId_0 = args_0[0];
    if (!(actionId_0.buffer instanceof ArrayBuffer && actionId_0.BYTES_PER_ELEMENT === 1 && actionId_0.length === 32)) {
      __compactRuntime.typeError('settlementNullifierOf',
                                 'argument 1',
                                 'economy.compact line 171 char 1',
                                 'Bytes<32>',
                                 actionId_0)
    }
    return _dummyContract._settlementNullifierOf_0(actionId_0);
  },
  ballotCommitmentOf: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`ballotCommitmentOf: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const proposalId_0 = args_0[0];
    const holder_0 = args_0[1];
    const choice_0 = args_0[2];
    const salt_0 = args_0[3];
    if (!(proposalId_0.buffer instanceof ArrayBuffer && proposalId_0.BYTES_PER_ELEMENT === 1 && proposalId_0.length === 32)) {
      __compactRuntime.typeError('ballotCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 178 char 1',
                                 'Bytes<32>',
                                 proposalId_0)
    }
    if (!(holder_0.buffer instanceof ArrayBuffer && holder_0.BYTES_PER_ELEMENT === 1 && holder_0.length === 32)) {
      __compactRuntime.typeError('ballotCommitmentOf',
                                 'argument 2',
                                 'economy.compact line 178 char 1',
                                 'Bytes<32>',
                                 holder_0)
    }
    if (!(typeof(choice_0) === 'bigint' && choice_0 >= 0n && choice_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('ballotCommitmentOf',
                                 'argument 3',
                                 'economy.compact line 178 char 1',
                                 'Uint<0..18446744073709551616>',
                                 choice_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('ballotCommitmentOf',
                                 'argument 4',
                                 'economy.compact line 178 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._ballotCommitmentOf_0(proposalId_0,
                                                holder_0,
                                                choice_0,
                                                salt_0);
  },
  voteNullifierOf: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`voteNullifierOf: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const proposalId_0 = args_0[0];
    const holder_0 = args_0[1];
    if (!(proposalId_0.buffer instanceof ArrayBuffer && proposalId_0.BYTES_PER_ELEMENT === 1 && proposalId_0.length === 32)) {
      __compactRuntime.typeError('voteNullifierOf',
                                 'argument 1',
                                 'economy.compact line 193 char 1',
                                 'Bytes<32>',
                                 proposalId_0)
    }
    if (!(holder_0.buffer instanceof ArrayBuffer && holder_0.BYTES_PER_ELEMENT === 1 && holder_0.length === 32)) {
      __compactRuntime.typeError('voteNullifierOf',
                                 'argument 2',
                                 'economy.compact line 193 char 1',
                                 'Bytes<32>',
                                 holder_0)
    }
    return _dummyContract._voteNullifierOf_0(proposalId_0, holder_0);
  },
  bidCommitmentOf: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`bidCommitmentOf: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const procurementId_0 = args_0[0];
    const holder_0 = args_0[1];
    const amount_0 = args_0[2];
    const salt_0 = args_0[3];
    if (!(procurementId_0.buffer instanceof ArrayBuffer && procurementId_0.BYTES_PER_ELEMENT === 1 && procurementId_0.length === 32)) {
      __compactRuntime.typeError('bidCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 201 char 1',
                                 'Bytes<32>',
                                 procurementId_0)
    }
    if (!(holder_0.buffer instanceof ArrayBuffer && holder_0.BYTES_PER_ELEMENT === 1 && holder_0.length === 32)) {
      __compactRuntime.typeError('bidCommitmentOf',
                                 'argument 2',
                                 'economy.compact line 201 char 1',
                                 'Bytes<32>',
                                 holder_0)
    }
    if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('bidCommitmentOf',
                                 'argument 3',
                                 'economy.compact line 201 char 1',
                                 'Uint<0..18446744073709551616>',
                                 amount_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('bidCommitmentOf',
                                 'argument 4',
                                 'economy.compact line 201 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._bidCommitmentOf_0(procurementId_0,
                                             holder_0,
                                             amount_0,
                                             salt_0);
  },
  awardCommitmentOf: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`awardCommitmentOf: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const procurementId_0 = args_0[0];
    const winnerBid_0 = args_0[1];
    const salt_0 = args_0[2];
    if (!(procurementId_0.buffer instanceof ArrayBuffer && procurementId_0.BYTES_PER_ELEMENT === 1 && procurementId_0.length === 32)) {
      __compactRuntime.typeError('awardCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 216 char 1',
                                 'Bytes<32>',
                                 procurementId_0)
    }
    if (!(winnerBid_0.buffer instanceof ArrayBuffer && winnerBid_0.BYTES_PER_ELEMENT === 1 && winnerBid_0.length === 32)) {
      __compactRuntime.typeError('awardCommitmentOf',
                                 'argument 2',
                                 'economy.compact line 216 char 1',
                                 'Bytes<32>',
                                 winnerBid_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('awardCommitmentOf',
                                 'argument 3',
                                 'economy.compact line 216 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._awardCommitmentOf_0(procurementId_0,
                                               winnerBid_0,
                                               salt_0);
  },
  addressCommitmentOf: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`addressCommitmentOf: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const addr_0 = args_0[0];
    if (!(typeof(addr_0) === 'object' && addr_0.bytes.buffer instanceof ArrayBuffer && addr_0.bytes.BYTES_PER_ELEMENT === 1 && addr_0.bytes.length === 32)) {
      __compactRuntime.typeError('addressCommitmentOf',
                                 'argument 1',
                                 'economy.compact line 229 char 1',
                                 'struct UserAddress<bytes: Bytes<32>>',
                                 addr_0)
    }
    return _dummyContract._addressCommitmentOf_0(addr_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
