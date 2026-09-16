import { describe, expect, it } from "vitest";
import { privateStorePasswordClasses, resolvePrivateStorePassword } from "./private-store-password.js";

describe("private store password", () => {
  it("requires three character classes before wallet sync", () => {
    expect(privateStorePasswordClasses("aabbccdd1122")).toBe(2);
    expect(() =>
      resolvePrivateStorePassword({ VELIOS_PRIVATE_STORE_PASSWORD: "aabbccdd1122" }, "acct"),
    ).toThrow(/Found: 2/);
    expect(resolvePrivateStorePassword({ VELIOS_PRIVATE_STORE_PASSWORD: "aabbccdd1122A!" }, "acct")).toBe(
      "aabbccdd1122A!",
    );
  });

  it("rejects a password derived from the account id", () => {
    expect(() =>
      resolvePrivateStorePassword({ VELIOS_PRIVATE_STORE_PASSWORD: "acct!" }, "acct"),
    ).toThrow(/account id/);
  });
});
