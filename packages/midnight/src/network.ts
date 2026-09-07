/**
 * Network endpoints copied from the official midnightntwrk/example-hello-world
 * `src/config.ts` (Apache-2.0). Do not invent indexer paths.
 */

export type NetworkConfig = {
  networkId: "undeployed" | "preview" | "preprod";
  indexer: string;
  indexerWS: string;
  node: string;
  nodeWS: string;
  proofServer: string;
  faucet: string;
};

export const LOCAL_CONFIG: NetworkConfig = {
  networkId: "undeployed",
  indexer: "http://127.0.0.1:8088/api/v4/graphql",
  indexerWS: "ws://127.0.0.1:8088/api/v4/graphql/ws",
  node: "http://127.0.0.1:9944",
  nodeWS: "ws://127.0.0.1:9944",
  proofServer: "http://127.0.0.1:6300",
  faucet: "",
};

export const PREVIEW_CONFIG: NetworkConfig = {
  networkId: "preview",
  indexer: "https://indexer.preview.midnight.network/api/v4/graphql",
  indexerWS: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
  node: "https://rpc.preview.midnight.network",
  nodeWS: "wss://rpc.preview.midnight.network",
  proofServer: "http://127.0.0.1:6300",
  faucet: "https://midnight-tmnight-preview.nethermind.dev/",
};

export const PREPROD_CONFIG: NetworkConfig = {
  networkId: "preprod",
  indexer: "https://indexer.preprod.midnight.network/api/v4/graphql",
  indexerWS: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws",
  node: "https://rpc.preprod.midnight.network",
  nodeWS: "wss://rpc.preprod.midnight.network",
  proofServer: "http://127.0.0.1:6300",
  faucet: "https://midnight-tmnight-preprod.nethermind.dev/",
};

function readEnv(name: string): string | undefined {
  const fromProcess =
    typeof process !== "undefined" && process.env ? process.env[name] ?? process.env[`VITE_${name}`] : undefined;
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  return fromProcess ?? env?.[name] ?? env?.[`VITE_${name}`];
}

export function getNetworkConfig(network = readEnv("VELIOS_NETWORK") ?? readEnv("MIDNIGHT_NETWORK") ?? "local"): NetworkConfig {
  const proofOverride = readEnv("MIDNIGHT_PROOF_SERVER");
  if (network === "local" || network === "undeployed") return LOCAL_CONFIG;
  if (network === "preview") {
    return proofOverride ? { ...PREVIEW_CONFIG, proofServer: proofOverride } : PREVIEW_CONFIG;
  }
  if (network === "preprod") {
    return proofOverride ? { ...PREPROD_CONFIG, proofServer: proofOverride } : PREPROD_CONFIG;
  }
  throw new Error(`Unknown network: ${network}`);
}

export async function proofServerReachable(url: string, timeoutMs = 1500): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(url, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
