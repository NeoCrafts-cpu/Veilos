import { describe, expect, it } from "vitest";
import { activeNavItem, pathMatches, taskFromPath, WORKSPACE_NAV } from "./navigation.js";

describe("workspace navigation", () => {
  it("groups every Wave 2 module under a named section", () => {
    const labels = WORKSPACE_NAV.map((group) => group.label);
    expect(labels).toEqual([
      "Workspace",
      "Authorization",
      "Organization",
      "Credentials",
      "Treasury",
      "Governance",
      "Procurement",
      "Auditor",
      "System",
    ]);
  });

  it("marks child task routes current without lighting the Home item", () => {
    const home = WORKSPACE_NAV[0]!.items[0]!;
    expect(pathMatches(home, "/app")).toBe(true);
    expect(pathMatches(home, "/app/treasury/deposit")).toBe(false);
    expect(activeNavItem("/app/credentials/registry")?.id).toBe("registry");
    expect(activeNavItem("/app/org/agents")?.id).toBe("agents");
    expect(activeNavItem("/app/org")?.id).toBe("overview");
  });

  it("resolves default module tasks from the parent path", () => {
    expect(taskFromPath("/app/treasury", "/app/treasury", "deposit")).toBe("deposit");
    expect(taskFromPath("/app/treasury/authorize", "/app/treasury", "deposit")).toBe("authorize");
  });
});
