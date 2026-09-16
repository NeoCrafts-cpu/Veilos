import { describe, expect, it } from "vitest";
import { PREVIEW_CONFIG } from "./network.js";
import {
  assertWalletSessionCurrent,
  type WalletSessionReader,
} from "./wallet-session-guard.js";

function session(overrides: {
  status?: "connected" | "disconnected";
  networkId?: string;
  coinPublicKey?: string;
} = {}): WalletSessionReader {
  const status = overrides.status ?? "connected";
  const networkId = overrides.networkId ?? "preview";
  return {
    getConnectionStatus: async () =>
      status === "connected"
        ? { status: "connected", networkId }
        : { status: "disconnected" },
    getConfiguration: async () => ({
      indexerUri: PREVIEW_CONFIG.indexer,
      indexerWsUri: PREVIEW_CONFIG.indexerWS,
      substrateNodeUri: PREVIEW_CONFIG.node,
      networkId,
    }),
    getShieldedAddresses: async () => ({
      shieldedAddress: "shielded",
      shieldedCoinPublicKey: overrides.coinPublicKey ?? "coin-key",
      shieldedEncryptionPublicKey: "encryption-key",
    }),
  };
}

describe("wallet transaction session guard", () => {
  it("accepts the connected account on the configured network", async () => {
    await expect(assertWalletSessionCurrent(session(), PREVIEW_CONFIG, "coin-key")).resolves.toBeUndefined();
  });

  it("fails closed after disconnect, network switch, or account switch", async () => {
    await expect(
      assertWalletSessionCurrent(session({ status: "disconnected" }), PREVIEW_CONFIG, "coin-key"),
    ).rejects.toThrow(/wallet disconnected/i);
    await expect(
      assertWalletSessionCurrent(session({ networkId: "preprod" }), PREVIEW_CONFIG, "coin-key"),
    ).rejects.toThrow(/wallet disconnected/i);
    await expect(
      assertWalletSessionCurrent(session({ coinPublicKey: "other-key" }), PREVIEW_CONFIG, "coin-key"),
    ).rejects.toThrow(/wallet disconnected/i);
  });
});
