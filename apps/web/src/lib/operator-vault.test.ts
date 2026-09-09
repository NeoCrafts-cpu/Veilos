import { randomBytes32 } from "@velios/policy-engine";
import { roleLabelToBytes, vendorIdFromRecipient } from "@velios/midnight/ids";
import type { VeliosPrivateState } from "@velios/shared-types";
import { describe, expect, it } from "vitest";
import {
  decryptOperatorVault,
  decryptOperatorVaultBundle,
  encryptOperatorVault,
  isEncryptedVault,
  writeEncryptedVault,
} from "./operator-vault.js";

function sampleState(): VeliosPrivateState {
  return {
    ownerSecret: randomBytes32(),
    memberSecret: randomBytes32(),
    agentSecret: randomBytes32(),
    agentRole: roleLabelToBytes("Treasury Operator"),
    roleSalt: randomBytes32(),
    perActionLimit: 99n,
    dailyLimit: 200n,
    vendorId: vendorIdFromRecipient("hidden-vendor"),
    credentialOk: true,
    credentialExpiry: 2_000_000_000n,
    selfModifyAllowed: false,
    policySalt: randomBytes32(),
    spendPeriodStart: 0n,
    dailySpend: 0n,
    spendSalt: randomBytes32(),
    nextSpendSalt: randomBytes32(),
  };
}

describe("encrypted operator vault", () => {
  it("round-trips private state and stores ciphertext only", async () => {
    const state = sampleState();
    const vault = await encryptOperatorVault({
      state,
      passphrase: "correct-horse",
      networkId: "preview",
      contractAddress: "aa".repeat(32),
    });
    expect(isEncryptedVault(vault)).toBe(true);
    expect(JSON.stringify(vault)).not.toMatch(/perActionLimit|hidden-vendor|ownerSecret|dailyLimit/);
    const next = await decryptOperatorVault(vault, "correct-horse");
    expect(next.perActionLimit).toBe(99n);
    const bundle = await decryptOperatorVaultBundle(vault, "correct-horse");
    expect(bundle.journal.kind).toBe("velios-operation-journal");
    writeEncryptedVault(vault);
    const stored = window.localStorage.getItem(`velios.vault.v1.preview.${"aa".repeat(32)}`);
    expect(stored).toBeTruthy();
    expect(stored).not.toMatch(/perActionLimit|99n|ownerSecret/);
  });

  it("rejects an invalid passphrase", async () => {
    const vault = await encryptOperatorVault({
      state: sampleState(),
      passphrase: "correct-horse",
      networkId: "preview",
      contractAddress: "bb".repeat(32),
    });
    await expect(decryptOperatorVault(vault, "wrong")).rejects.toThrow(/invalid passphrase/);
  });
});
