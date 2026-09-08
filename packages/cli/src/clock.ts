/**
 * WalletFacade clock aligned to the official indexer block timestamp.
 *
 * Preview/Preprod block time can lag UTC. DustActions.ctime from Date.now()
 * then fails ledger check 171 (OutOfDustValidityWindow): ctime > tblock.
 * The dust wallet already falls back to indexer `block.timestamp` for fee
 * balancing; registration uses the injected Clock instead.
 *
 * Clock.now() is synchronous, so the offset is measured once at init.
 * https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 */

const INDEXER_BLOCK_QUERY = "{ block { timestamp } }";
const CLOCK_SLACK_MS = 30_000;

export function timestampToMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("indexer block timestamp is missing");
  }
  // Official indexer GraphQL documents UNIX time. Preview returns milliseconds
  // (same value wallet-sdk-dust-wallet passes to `new Date(blockData.timestamp)`).
  return value > 1e12 ? value : value * 1000;
}

export function parseIndexerBlockTimestamp(payload: unknown): number {
  const timestamp = (payload as { data?: { block?: { timestamp?: unknown } } })?.data?.block?.timestamp;
  if (typeof timestamp === "number") return timestampToMs(timestamp);
  if (typeof timestamp === "string" && timestamp.trim() !== "") {
    return timestampToMs(Number(timestamp));
  }
  throw new Error("indexer block timestamp is missing");
}

export function indexerClockOffsetMs(nowMs: number, indexerTimestampMs: number, slackMs = CLOCK_SLACK_MS): number {
  return Math.max(0, nowMs - indexerTimestampMs) + slackMs;
}

export async function fetchIndexerBlockTimestampMs(indexerHttpUrl: string): Promise<number> {
  const response = await fetch(indexerHttpUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: INDEXER_BLOCK_QUERY }),
  });
  if (!response.ok) {
    throw new Error(`indexer block query failed (${response.status})`);
  }
  return parseIndexerBlockTimestamp(await response.json());
}

export async function createIndexerAlignedClock(indexerHttpUrl: string): Promise<{ now: () => Date }> {
  const indexerMs = await fetchIndexerBlockTimestampMs(indexerHttpUrl);
  const offsetMs = indexerClockOffsetMs(Date.now(), indexerMs);
  return { now: () => new Date(Date.now() - offsetMs) };
}
