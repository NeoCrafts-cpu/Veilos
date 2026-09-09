import { bytesToHex32, type Hex32, type VeliosPrivateState } from "@velios/shared-types";

export function expectedSpendAfterAuthorization(
  state: VeliosPrivateState,
  amount: bigint,
  periodStart: bigint,
  nextSpendSalt: Uint8Array,
): {
  expectedPeriodStart: string;
  expectedDailySpend: string;
  expectedSpendSalt: Hex32;
  expectedNextSpendSalt: Hex32;
  nextPrivateState: VeliosPrivateState;
} {
  const carried = state.spendPeriodStart === periodStart ? state.dailySpend : 0n;
  const nextPrivateState: VeliosPrivateState = {
    ...state,
    spendPeriodStart: periodStart,
    dailySpend: carried + amount,
    spendSalt: state.nextSpendSalt,
    nextSpendSalt,
  };
  return {
    expectedPeriodStart: nextPrivateState.spendPeriodStart.toString(),
    expectedDailySpend: nextPrivateState.dailySpend.toString(),
    expectedSpendSalt: bytesToHex32(nextPrivateState.spendSalt),
    expectedNextSpendSalt: bytesToHex32(nextPrivateState.nextSpendSalt),
    nextPrivateState,
  };
}
