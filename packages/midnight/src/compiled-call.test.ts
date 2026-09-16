import { describe, expect, it } from "vitest";
import { requireSucceedEntirely } from "./compiled-call.js";

describe("deploy confirmation", () => {
  it("refuses a missing or non-success Midnight status", () => {
    expect(() => requireSucceedEntirely("")).toThrow(/deploy failed/);
    expect(() => requireSucceedEntirely("FailEntirely")).toThrow(/deploy failed/);
    expect(requireSucceedEntirely("SucceedEntirely")).toBe("SucceedEntirely");
  });
});
