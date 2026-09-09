import { describe, expect, it } from "vitest";
import { operatorStorageKey, readOperatorStateLocal, writeOperatorStateLocal } from "./operator-state.js";

describe("operator private-state storage", () => {
  it("scopes the key to the Midnight network id", () => {
    expect(operatorStorageKey("preview")).toBe("velios.operator.preview");
  });

  it("round-trips an encoded payload without adding fields", () => {
    const encoded = { ownerSecret: "aa".repeat(32), perActionLimit: "0" };
    writeOperatorStateLocal("preview", encoded);
    expect(readOperatorStateLocal("preview")).toEqual(encoded);
  });
});
