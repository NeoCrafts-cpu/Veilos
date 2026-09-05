/**
 * Encoding helpers that mirror Compact `pad`, `n as Field as Bytes<32>`,
 * and `persistentHash` (official docs: SHA-256, ledger-stable).
 *
 * Field→bytes uses Compact `convertFieldToBytes`: 32-byte little-endian
 * (`n as Field as Bytes<32>`). Golden tests compare compiled
 * `ownerCommitmentOf` / `policyCommitmentOf` after `compact compile`.
 */

import { sha256 } from "@noble/hashes/sha2.js";

export const DOMAIN_OWNER = "velios:owner:";
export const DOMAIN_MEMBER = "velios:member:";
export const DOMAIN_AGENT_KEY = "velios:agentkey:";
export const DOMAIN_ROLE = "velios:role:";
export const DOMAIN_POLICY = "velios:policy:";
export const DOMAIN_SPEND = "velios:spend:";
export const DOMAIN_RESULT = "velios:result:";
export const DOMAIN_ORG = "velios:org:";
export const DOMAIN_AGENT = "velios:agent:";
export const DOMAIN_ACTION = "velios:action:";
export const DOMAIN_VENDOR = "velios:vendor:";
export const DOMAIN_INTENT = "velios:intent:";
export const DOMAIN_REASON = "velios:reason:";

export const UINT64_MAX = (1n << 64n) - 1n;

export function assertUint64(value: bigint, label = "amount"): bigint {
  // Fail loudly rather than coercing: a missing private-state field would
  // otherwise silently encode as 0 and produce a commitment that never opens.
  if (typeof value !== "bigint") {
    throw new Error(`${label} is not a Uint64`);
  }
  if (value < 0n || value > UINT64_MAX) {
    throw new Error(`${label} exceeds Uint64`);
  }
  return value;
}

export function pad32(text: string): Uint8Array {
  const encoded = new TextEncoder().encode(text);
  if (encoded.length > 32) {
    throw new Error("pad overflow");
  }
  const out = new Uint8Array(32);
  out.set(encoded);
  return out;
}

/** Compact `n as Field as Bytes<32>` — little-endian field bytes (`convertFieldToBytes`). */
export function encodeUint64(value: bigint): Uint8Array {
  assertUint64(value);
  const out = new Uint8Array(32);
  let x = value;
  for (let i = 0; i < 32; i++) {
    out[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return out;
}

export function encodeBoolean(value: boolean): Uint8Array {
  return encodeUint64(value ? 1n : 0n);
}

export function persistentHash(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => {
    if (chunk.length !== 32) {
      throw new Error("persistentHash expects 32-byte chunks");
    }
    return sum + chunk.length;
  }, 0);
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return sha256(joined);
}

export function randomBytes32(cryptoImpl: Crypto = globalThis.crypto): Uint8Array {
  const out = new Uint8Array(32);
  cryptoImpl.getRandomValues(out);
  return out;
}

export function utf8Bytes32(label: string, domain: string): Uint8Array {
  return persistentHash([pad32(domain), pad32(label)]);
}
