import { describe, expect, it } from "vitest";
import {
  formatDust,
  formatNight,
  isDustReady,
  publicDustError,
  publicUnshieldedAddress,
  unregisteredNightUtxos,
} from "./dust.js";

describe("DUST helpers", () => {
  it("keeps only NIGHT UTXOs that are not yet registered", () => {
    expect(
      unregisteredNightUtxos([
        { id: "a", meta: { registeredForDustGeneration: true } },
        { id: "b", meta: { registeredForDustGeneration: false } },
        { id: "c" },
      ]).map((coin) => coin.id),
    ).toEqual(["b", "c"]);
  });

  it("treats spendable DUST as both a coin and a positive balance", () => {
    expect(isDustReady({ availableCoins: { length: 1 }, balance: () => 1n })).toBe(true);
    expect(isDustReady({ availableCoins: { length: 1 }, balance: () => 0n })).toBe(false);
    expect(isDustReady({ availableCoins: { length: 0 }, balance: () => 5n })).toBe(false);
  });

  it("formats official NIGHT and DUST denominations", () => {
    expect(formatNight(1_000_000_000n)).toBe("1000.000000");
    expect(formatDust(405_083_000_000n)).toBe("0.000405083000000");
  });

  it("maps known under-funded registration errors without leaking payloads", () => {
    expect(publicDustError(new Error("1010 Custom error: 138 BalanceCheckOverspend"))).toBe(
      "registration under-funded; waiting for retroactive DUST",
    );
    expect(publicDustError(new Error("1010: Invalid Transaction: Custom error: 171"))).toBe(
      "dust ctime outside validity window; retrying with indexer-aligned clock",
    );
    expect(publicDustError(new Error("secret-utxo-abc"))).toBe("dust registration failed");
    expect(publicDustError(new Error("secret-utxo-abc"))).not.toMatch(/secret-utxo/);
  });

  it("reads a bech32 unshielded address from string or asString()", () => {
    expect(publicUnshieldedAddress({ getBech32Address: () => "mn_addr_preview1abc" })).toBe("mn_addr_preview1abc");
    expect(
      publicUnshieldedAddress({
        getBech32Address: () => ({ asString: () => "mn_addr_preview1def" }),
      }),
    ).toBe("mn_addr_preview1def");
  });
});
