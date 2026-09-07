import { describe, expect, it } from "vitest";
import { PREVIEW_CONFIG } from "./network.js";
import {
  isTrustedProofServerUrl,
  resolveIndexerHttpUrl,
  resolveProofHealthUrl,
  resolveProofServerUrl,
  resolveZkArtifactsBaseUrl,
  walletSupportsProvingProvider,
} from "./browser-provider-urls.js";

describe("browser provider wiring", () => {
  it("uses the local proof server, not a 1AM hosted prover", () => {
    expect(resolveProofServerUrl("http://127.0.0.1:6300", PREVIEW_CONFIG)).toBe("http://127.0.0.1:6300");
    expect(resolveProofServerUrl(undefined, PREVIEW_CONFIG)).toBe(PREVIEW_CONFIG.proofServer);
    expect(resolveProofServerUrl("in-browser", PREVIEW_CONFIG)).toBe(PREVIEW_CONFIG.proofServer);
    expect(resolveProofServerUrl("https://api-preview.1am.xyz", PREVIEW_CONFIG)).toBe(PREVIEW_CONFIG.proofServer);
  });

  it("proves through the Vite same-origin proxy on :4177", () => {
    const previous = globalThis.location;
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { origin: "http://127.0.0.1:4177" },
    });
    try {
      expect(resolveProofServerUrl("https://api-preview.1am.xyz", PREVIEW_CONFIG)).toBe(
        "http://127.0.0.1:4177/proof-server",
      );
      expect(resolveProofServerUrl("http://127.0.0.1:6300", PREVIEW_CONFIG)).toBe(
        "http://127.0.0.1:4177/proof-server",
      );
      expect(resolveProofHealthUrl("https://api-preview.1am.xyz", PREVIEW_CONFIG)).toBe(
        "http://127.0.0.1:4177/proof-server/health",
      );
      expect(resolveIndexerHttpUrl(PREVIEW_CONFIG)).toBe("http://127.0.0.1:4177/indexer-graphql");
    } finally {
      Object.defineProperty(globalThis, "location", { configurable: true, value: previous });
    }
  });

  it("uses the official Preview indexer URL outside the Vite app origin", () => {
    expect(resolveIndexerHttpUrl(PREVIEW_CONFIG)).toBe(PREVIEW_CONFIG.indexer);
  });

  it("requires an http(s) zk artifact origin", () => {
    expect(resolveZkArtifactsBaseUrl("http://127.0.0.1:4177")).toBe("http://127.0.0.1:4177");
    expect(() => resolveZkArtifactsBaseUrl()).toThrow(/environment missing/);
  });

  it("rejects hosted and arbitrary remote proving endpoints", () => {
    expect(isTrustedProofServerUrl("https://api-preview.1am.xyz")).toBe(false);
    expect(isTrustedProofServerUrl("https://evil.example/prove")).toBe(false);
    expect(isTrustedProofServerUrl("http://127.0.0.1:6300")).toBe(true);
    expect(walletSupportsProvingProvider({ getProvingProvider: () => undefined })).toBe(true);
    expect(walletSupportsProvingProvider({})).toBe(false);
  });
});
