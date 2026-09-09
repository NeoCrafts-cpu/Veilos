import { describe, expect, it } from "vitest";
import { deriveCurrentTask } from "./journey.js";

describe("current task", () => {
  it("asks unset users to choose a path", () => {
    const task = deriveCurrentTask({
      mode: "unset",
      wallet: false,
      match: "none",
      vault: "missing",
      actions: [],
    });
    expect(task.primary.to).toBe("/app/setup");
    expect(task.secondary?.to).toBe("/app/preview");
  });

  it("sends a verified owner to authorize", () => {
    const task = deriveCurrentTask({
      mode: "owner",
      wallet: true,
      match: "verified",
      vault: "unlocked",
      actions: [],
      agent: { status: "active" } as never,
    });
    expect(task.primary.to).toBe("/app/authorize/new");
    expect(task.body).toMatch(/does not transfer funds/i);
  });
});
