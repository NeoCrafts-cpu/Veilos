import { describe, expect, it } from "vitest";
import { indexerClockOffsetMs, parseIndexerBlockTimestamp, timestampToMs } from "./clock.js";

describe("indexer-aligned clock", () => {
  it("treats Preview indexer timestamps as milliseconds", () => {
    expect(timestampToMs(1_789_303_380_000)).toBe(1_789_303_380_000);
    expect(timestampToMs(1_789_303_380)).toBe(1_789_303_380_000);
  });

  it("reads the official GraphQL block.timestamp field", () => {
    expect(parseIndexerBlockTimestamp({ data: { block: { timestamp: 1_789_303_380_000 } } })).toBe(1_789_303_380_000);
    expect(parseIndexerBlockTimestamp({ data: { block: { timestamp: "1789303380000" } } })).toBe(1_789_303_380_000);
  });

  it("keeps the wallet clock behind chain time by the measured lag plus slack", () => {
    expect(indexerClockOffsetMs(1_789_303_546_000, 1_789_303_380_000, 30_000)).toBe(196_000);
    expect(indexerClockOffsetMs(1_000, 2_000, 30_000)).toBe(30_000);
  });

  it("rejects a missing timestamp without echoing the payload", () => {
    expect(() => parseIndexerBlockTimestamp({ data: { block: {} } })).toThrow(/timestamp is missing/);
    expect(() => parseIndexerBlockTimestamp({ errors: [{ message: "secret" }] })).toThrow(/timestamp is missing/);
  });
});
