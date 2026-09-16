import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { createDisclosure, encryptDisclosureBundle, verifyDisclosure } from "./index.js";

describe("scoped auditor disclosure", () => {
  it("rejects expired, overbroad, and wrong-auditor bundles", async () => {
    const auditorId = randomBytes32();
    const grant = {
      auditorId,
      scope: ["action.result"],
      expires: 100n,
      nonce: randomBytes32(),
      actionAnchors: ["aa".repeat(32)],
    };
    expect(() =>
      createDisclosure({
        grant,
        claims: { "action.result": "authorized", "policy.limit": "25000" },
        anchors: { action: "aa".repeat(32) },
        now: 10n,
      }),
    ).toThrow(/overbroad/);
    const bundle = createDisclosure({
      grant,
      claims: { "action.result": "authorized" },
      anchors: { action: "aa".repeat(32) },
      now: 10n,
    });
    expect(() => verifyDisclosure(bundle, { auditorId, now: 200n, expectedAnchors: bundle.anchors })).toThrow(
      /expired/,
    );
    expect(() =>
      verifyDisclosure(bundle, { auditorId: randomBytes32(), now: 10n, expectedAnchors: bundle.anchors }),
    ).toThrow(/wrong auditor/);
    verifyDisclosure(bundle, { auditorId, now: 10n, expectedAnchors: bundle.anchors });
    expect(() =>
      verifyDisclosure(
        { ...bundle, claims: { "action.result": "authorized", extra: "1" } },
        { auditorId, now: 10n, expectedAnchors: bundle.anchors },
      ),
    ).toThrow(/modified claims/);
    const encrypted = await encryptDisclosureBundle(bundle, "AuditorPassphrase12");
    expect(JSON.stringify(encrypted)).not.toMatch(/authorized|policy.limit|25000/);
  });
});
