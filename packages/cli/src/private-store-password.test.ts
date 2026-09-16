import { describe, expect, it } from "vitest";
import { resolvePrivateStorePassword } from "./private-store-password.js";

describe("CLI private store password", () => {
  it("requires an explicit password that is not the account id", () => {
    expect(() => resolvePrivateStorePassword({}, "aa".repeat(32))).toThrow(/required/);
    expect(() =>
      resolvePrivateStorePassword({ VELIOS_PRIVATE_STORE_PASSWORD: `${"aa".repeat(32)}!` }, "aa".repeat(32)),
    ).toThrow(/account id/);
    expect(resolvePrivateStorePassword({ VELIOS_PRIVATE_STORE_PASSWORD: "operator-store-pass" }, "aa".repeat(32))).toBe(
      "operator-store-pass",
    );
  });
});
