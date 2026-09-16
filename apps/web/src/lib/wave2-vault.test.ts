import { describe, expect, it } from "vitest";
import { decryptWave2Vault, emptyWave2Vault, encryptWave2Vault } from "./wave2-vault.js";

describe("wave2 vault", () => {
  it("round-trips encrypted credential records without putting secrets in the envelope json", async () => {
    const payload = emptyWave2Vault();
    payload.credentials.push({
      commitment: "aa".repeat(32),
      className: "treasury",
      expiry: "1",
      holderSecret: "bb".repeat(32),
      salt: "cc".repeat(32),
      revocationSecret: "dd".repeat(32),
    });
    const vault = await encryptWave2Vault(payload, "SixteenCharsPass1!", "preview");
    expect(JSON.stringify(vault)).not.toMatch(/bbbbbbbb|holderSecret|revocationSecret/);
    const opened = await decryptWave2Vault(vault, "SixteenCharsPass1!");
    expect(opened.credentials[0]?.className).toBe("treasury");
    expect(opened.credentials[0]?.holderSecret).toBe("bb".repeat(32));
  });
});
