import type { NetworkConfig } from "./network.js";

export function resolveZkArtifactsBaseUrl(explicit?: string): string {
  if (explicit) return explicit;
  const origin = globalThis.location?.origin;
  if (typeof origin === "string" && (origin.startsWith("http://") || origin.startsWith("https://"))) {
    return origin;
  }
  throw new Error("environment missing: zk artifacts url");
}

function pageOrigin(): string | undefined {
  const origin = globalThis.location?.origin;
  return typeof origin === "string" && (origin.startsWith("http://") || origin.startsWith("https://"))
    ? origin
    : undefined;
}

function isDevAppOrigin(origin: string | undefined): boolean {
  return Boolean(origin?.includes(":4177"));
}

function isLoopback(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

function isSameOrigin(url: string, origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    return new URL(url).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

function isUsableHttpProofUrl(url: string | undefined): url is string {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes("in-browser") || lower.includes("wasm")) return false;
  return lower.startsWith("http://") || lower.startsWith("https://");
}

/** 1AM's hosted prover (`api-preview.1am.xyz`) is not the official proof-server path. */
export function isHostedWalletProver(url: string): boolean {
  return /1am\.xyz/i.test(url);
}

export function isTrustedProofServerUrl(url: string, origin?: string): boolean {
  if (!isUsableHttpProofUrl(url) || isHostedWalletProver(url)) return false;
  return isLoopback(url) || isSameOrigin(url, origin ?? pageOrigin());
}

function sameOriginProofProxy(origin: string): string {
  return `${origin.replace(/\/$/, "")}/proof-server`;
}

/**
 * HTTP proof-server fallback. Wallet proving uses `getProvingProvider`
 * instead of this URL. Wallet URIs that point at hosted provers are ignored.
 */
export function resolveProofServerUrl(
  walletProverServerUri: string | undefined,
  config: NetworkConfig,
): string {
  const origin = pageOrigin();
  if (isDevAppOrigin(origin) && origin) {
    return sameOriginProofProxy(origin);
  }
  const fromWallet =
    isUsableHttpProofUrl(walletProverServerUri) &&
    !isHostedWalletProver(walletProverServerUri) &&
    isTrustedProofServerUrl(walletProverServerUri, origin)
      ? walletProverServerUri
      : undefined;
  const proofServer = fromWallet ?? config.proofServer;
  if (!proofServer) {
    throw new Error("environment missing: proof server");
  }
  if (!isTrustedProofServerUrl(proofServer, origin)) {
    throw new Error("environment missing: untrusted proof server");
  }
  return proofServer;
}

/** Preview indexer GraphQL through the Vite same-origin proxy on `:4177`. */
export function resolveIndexerHttpUrl(config: NetworkConfig): string {
  const origin = pageOrigin();
  if (isDevAppOrigin(origin) && origin && config.networkId === "preview") {
    return `${origin.replace(/\/$/, "")}/indexer-graphql`;
  }
  return config.indexer;
}

/** Health URL the browser can fetch without talking to Windows-localhost:6300. */
export function resolveProofHealthUrl(
  walletProverServerUri: string | undefined,
  config: NetworkConfig,
): string {
  const proof = resolveProofServerUrl(walletProverServerUri, config);
  return proof.endsWith("/health") ? proof : `${proof.replace(/\/$/, "")}/health`;
}

export function walletSupportsProvingProvider(api: unknown): boolean {
  return Boolean(api && typeof api === "object" && "getProvingProvider" in api);
}
