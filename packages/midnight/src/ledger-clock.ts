/**
 * Ledger time from the official indexer `block { timestamp }` query.
 * Compact `authorizeAction` proves the disclosed window against
 * `kernel.blockTimeGreaterThan`. Date.now() is not the ledger clock.
 */

import { authorizationWindow, type AuthorizationWindow } from "@velios/policy-engine";

const INDEXER_BLOCK_QUERY = "{ block { timestamp } }";

export function indexerTimestampToMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("indexer block timestamp is missing");
  }
  return value > 1e12 ? value : value * 1000;
}

export function parseIndexerBlockTimestampMs(payload: unknown): number {
  const timestamp = (payload as { data?: { block?: { timestamp?: unknown } } })?.data?.block?.timestamp;
  if (typeof timestamp === "number") return indexerTimestampToMs(timestamp);
  if (typeof timestamp === "string" && timestamp.trim() !== "") {
    return indexerTimestampToMs(Number(timestamp));
  }
  throw new Error("indexer block timestamp is missing");
}

export async function fetchIndexerNowSeconds(indexerHttpUrl: string): Promise<bigint> {
  const response = await fetch(indexerHttpUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: INDEXER_BLOCK_QUERY }),
  });
  if (!response.ok) {
    throw new Error(`indexer block query failed (${response.status})`);
  }
  return BigInt(Math.floor(parseIndexerBlockTimestampMs(await response.json()) / 1000));
}

export function authorizationWindowFromLedger(nowSeconds: bigint): AuthorizationWindow {
  return authorizationWindow(nowSeconds);
}
