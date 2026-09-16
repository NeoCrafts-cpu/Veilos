import { describe, expect, it } from "vitest";
import { pathMatches, WORKSPACE_NAV } from "./navigation.js";

describe("workspace navigation", () => {
  it("leads a new user from Home to a payment", () => {
    expect(WORKSPACE_NAV.map((group) => group.label)).toEqual(["Start", "Money", "People", "Privacy"]);
    expect(WORKSPACE_NAV[0]?.items.map((item) => item.label)).toEqual(["Home", "Request a payment", "Activity"]);
  });

  it("keeps votes, bids, and auditor as regular people links", () => {
    const people = WORKSPACE_NAV.find((group) => group.id === "people");
    expect(people?.items.map((item) => item.label)).toEqual(["Members", "Agents", "Votes", "Bids", "Auditor"]);
    expect(WORKSPACE_NAV.some((group) => group.label === "Later")).toBe(false);
  });

  it("matches payment and activity paths", () => {
    const pay = WORKSPACE_NAV[0]?.items[1];
    const home = WORKSPACE_NAV[0]?.items[0];
    expect(pay && pathMatches(pay, "/app/authorize/new")).toBe(true);
    expect(home && pathMatches(home, "/app")).toBe(true);
    expect(home && pathMatches(home, "/app/authorize/new")).toBe(false);
  });
});
