import { describe, expect, it } from "vitest";
import { PREPROD_CONFIG, PREVIEW_CONFIG } from "@velios/midnight";

describe("official testnet endpoints", () => {
  it("uses the hello-world Preview indexer, node, and proof server", () => {
    expect(PREVIEW_CONFIG.networkId).toBe("preview");
    expect(PREVIEW_CONFIG.indexer).toBe("https://indexer.preview.midnight.network/api/v4/graphql");
    expect(PREVIEW_CONFIG.indexerWS).toBe("wss://indexer.preview.midnight.network/api/v4/graphql/ws");
    expect(PREVIEW_CONFIG.node).toBe("https://rpc.preview.midnight.network");
    expect(PREVIEW_CONFIG.nodeWS).toBe("wss://rpc.preview.midnight.network");
    expect(PREVIEW_CONFIG.proofServer).toBe("http://127.0.0.1:6300");
  });

  it("keeps Preprod on the official public endpoints", () => {
    expect(PREPROD_CONFIG.indexer).toBe("https://indexer.preprod.midnight.network/api/v4/graphql");
    expect(PREPROD_CONFIG.node).toBe("https://rpc.preprod.midnight.network");
  });
});
