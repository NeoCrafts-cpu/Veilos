import { describe, expect, it } from "vitest";
import { authorizationWindowFromLedger, indexerTimestampToMs, parseIndexerBlockTimestampMs } from "./ledger-clock.js";

describe("indexer ledger clock", () => {
  it("accepts Preview millisecond timestamps and UNIX seconds", () => {
    expect(indexerTimestampToMs(1_789_321_554_000)).toBe(1_789_321_554_000);
    expect(indexerTimestampToMs(1_789_321_554)).toBe(1_789_321_554_000);
  });

  it("reads official GraphQL block.timestamp", () => {
    expect(parseIndexerBlockTimestampMs({ data: { block: { timestamp: 1_789_321_554_000 } } })).toBe(
      1_789_321_554_000,
    );
  });

  it("builds the same UTC-day window Compact proves against", () => {
    const window = authorizationWindowFromLedger(1_789_257_600n);
    expect(window.periodEnd - window.periodStart).toBe(86_400n);
    expect(window.periodStart).toBe(1_789_257_600n);
  });
});
