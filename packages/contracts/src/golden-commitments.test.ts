/**
 * Golden vectors: TypeScript commitments must match compiled Compact
 * `ownerCommitmentOf` / `memberCommitmentOf` / `agentCommitmentOf` /
 * `roleCommitmentOf` / `policyCommitmentOf` / `spendCommitmentOf`.
 */

import { describe, expect, it } from "vitest";
import {
  agentCommitment,
  memberCommitment,
  ownerCommitment,
  policyCommitment,
  roleCommitment,
  spendCommitment,
} from "@velios/policy-engine";
import { loadCompiledAuthorization, witnesses } from "./index.js";
import { compiledArtifactsPresent } from "./node-artifacts.js";

const SECRET = new Uint8Array(32).fill(7);
const SALT = new Uint8Array(32).fill(9);
const VENDOR = new Uint8Array(32).fill(3);

function asBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value && typeof value === "object" && "value" in value) return asBytes((value as { value: unknown }).value);
  throw new Error("unexpected compact circuit return");
}

describe("golden Compact / TypeScript commitments", () => {
  it("TypeScript vectors stay domain-separated", () => {
    expect(ownerCommitment(SECRET)).not.toEqual(memberCommitment(SECRET));
    expect(agentCommitment(SECRET)).not.toEqual(roleCommitment(SECRET, SALT));
    expect(
      policyCommitment({
        perActionLimit: 25_000n,
        dailyLimit: 48_000n,
        vendorId: VENDOR,
        credentialOk: true,
        credentialExpiry: 1_800_000_000n,
        selfModifyAllowed: false,
        salt: SALT,
      }),
    ).not.toEqual(spendCommitment(0n, 0n, SALT));
  });

  it("matches compiled Compact pure circuits when artifacts exist", async () => {
    if (!compiledArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:contracts` first. Skipping Compact golden compare.");
      return;
    }
    const loaded = await loadCompiledAuthorization();
    expect(loaded).not.toBeNull();
    const pure = loaded!.pureCircuits;
    expect(pure).toBeTruthy();
    expect(asBytes(pure!.ownerCommitmentOf(SECRET))).toEqual(ownerCommitment(SECRET));
    expect(asBytes(pure!.memberCommitmentOf(SECRET))).toEqual(memberCommitment(SECRET));
    expect(asBytes(pure!.agentCommitmentOf(SECRET))).toEqual(agentCommitment(SECRET));
    expect(asBytes(pure!.roleCommitmentOf(SECRET, SALT))).toEqual(roleCommitment(SECRET, SALT));
    expect(
      asBytes(pure!.policyCommitmentOf(25_000n, 48_000n, VENDOR, true, 1_800_000_000n, false, SALT)),
    ).toEqual(
      policyCommitment({
        perActionLimit: 25_000n,
        dailyLimit: 48_000n,
        vendorId: VENDOR,
        credentialOk: true,
        credentialExpiry: 1_800_000_000n,
        selfModifyAllowed: false,
        salt: SALT,
      }),
    );
    expect(asBytes(pure!.spendCommitmentOf(86_400n, 4800n, SALT))).toEqual(spendCommitment(86_400n, 4800n, SALT));
  });
});
