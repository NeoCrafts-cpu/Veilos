import { describe, expect, it } from "vitest";
import { economyOwnerSecretFromBackup } from "./economy-owner-backup.js";

const secret = "ab".repeat(32);

describe("economyOwnerSecretFromBackup", () => {
  it("reads ownerSecret from a CLI economy export and ignores other fields", () => {
    expect(
      economyOwnerSecretFromBackup({
        ownerSecret: secret,
        holderSecret: "cd".repeat(32),
        credentialClass: "0",
        vendorId: "00".repeat(32),
      }),
    ).toBe(secret);
  });

  it("refuses a Wave 1 organization export", () => {
    expect(() =>
      economyOwnerSecretFromBackup({
        ownerSecret: secret,
        memberSecret: "ef".repeat(32),
        agentSecret: "11".repeat(32),
      }),
    ).toThrow(/organization access/i);
  });

  it("refuses an encrypted browser vault envelope", () => {
    expect(() =>
      economyOwnerSecretFromBackup({
        kind: "velios-operator-vault",
        ciphertext: "aaaa",
      }),
    ).toThrow(/encrypted vault/i);
  });

  it("refuses missing or short secrets without echoing the payload", () => {
    expect(() => economyOwnerSecretFromBackup({ holderSecret: "cd".repeat(32) })).toThrow(
      /does not contain treasury operator access/i,
    );
    expect(() => economyOwnerSecretFromBackup({ ownerSecret: "aa" })).toThrow(
      /does not contain treasury operator access/i,
    );
  });
});
