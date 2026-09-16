import { describe, expect, it } from "vitest";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ZKConfigProvider } from "@midnight-ntwrk/midnight-js-types";
import { browserProvingReady, resolveBrowserProofProvider, tryWalletProofProvider } from "./browser-proving.js";
import { PREVIEW_CONFIG } from "./network.js";

const zkConfigProvider = {
  asKeyMaterialProvider: () => ({
    getZKIR: async () => new Uint8Array(),
    getProverKey: async () => new Uint8Array(),
    getVerifierKey: async () => new Uint8Array(),
  }),
} as ZKConfigProvider<string>;

describe("browser proving", () => {
  it("uses official wallet getProvingProvider instead of localhost Docker", async () => {
    const api = {
      getProvingProvider: async () => ({
        check: async () => [],
        prove: async () => new Uint8Array(),
      }),
    } as unknown as ConnectedAPI;
    const wallet = await tryWalletProofProvider(api, zkConfigProvider);
    expect(wallet).toBeDefined();
    expect(typeof wallet?.proveTx).toBe("function");
    const resolved = await resolveBrowserProofProvider(
      api,
      zkConfigProvider,
      "https://api-preview.1am.xyz",
      PREVIEW_CONFIG,
    );
    expect(resolved.source).toBe("wallet");
  });

  it("ignores a hosted 1AM URI and falls back to the local HTTP proof server", async () => {
    const api = {} as ConnectedAPI;
    const resolved = await resolveBrowserProofProvider(
      api,
      zkConfigProvider,
      "https://api-preview.1am.xyz",
      PREVIEW_CONFIG,
    );
    expect(resolved.source).toBe("local-http");
    expect(typeof resolved.proofProvider.proveTx).toBe("function");
  });

  it("falls back to local HTTP when getProvingProvider rejects", async () => {
    const api = {
      getProvingProvider: async () => {
        throw new Error("proof station closed");
      },
    } as unknown as ConnectedAPI;
    expect(await tryWalletProofProvider(api, zkConfigProvider)).toBeUndefined();
    const resolved = await resolveBrowserProofProvider(api, zkConfigProvider, undefined, PREVIEW_CONFIG);
    expect(resolved.source).toBe("local-http");
  });

  it("treats wallet proving as ready without a local Docker health check", async () => {
    expect(await browserProvingReady("wallet", undefined, PREVIEW_CONFIG)).toBe(true);
  });
});
