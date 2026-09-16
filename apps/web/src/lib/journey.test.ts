import { describe, expect, it } from "vitest";
import { deriveCurrentTask } from "./journey.js";

describe("current task", () => {
  it("sends a live organization to the payment request", () => {
    const task = deriveCurrentTask({
      mode: "preview",
      wallet: false,
      match: "none",
      vault: "missing",
      actions: [],
      agent: { status: "active" } as never,
    });
    expect(task.primary.to).toBe("/app/authorize/new");
    expect(task.primary.label).toMatch(/payment/i);
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
    expect(task.body).toMatch(/private policy/i);
  });
});
