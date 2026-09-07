import { describe, expect, it } from "vitest";
import { asHex32, type PublicAction, type PublicOrganization } from "@velios/shared-types";
import { confirmPublicAction, waitForPublicAction } from "./indexer-confirm.js";
import type { PublicLedgerView } from "./ledger-view.js";

const actionId = asHex32("11".repeat(32));
const otherId = asHex32("22".repeat(32));

function organization(): PublicOrganization {
  return {
    organizationId: asHex32("33".repeat(32)),
    status: "active",
    adminCommitment: asHex32("44".repeat(32)),
    contractAddress: "aa".repeat(32),
    actionCount: 1n,
  };
}

function action(id = actionId): PublicAction {
  return {
    actionId: id,
    agentId: asHex32("55".repeat(32)),
    actionType: "payment",
    result: "authorized",
    resultCommitment: asHex32("66".repeat(32)),
    periodStart: 1n,
    periodEnd: 2n,
  };
}

function view(actions: PublicAction[]): PublicLedgerView {
  return { organization: organization(), members: [], agents: [], actions };
}

describe("indexer confirmation", () => {
  it("confirms only the exact action id", async () => {
    const hit = await confirmPublicAction({
      actionId,
      readLedger: async () => view([action()]),
    });
    expect(hit.status).toBe("confirmed");
    const miss = await confirmPublicAction({
      actionId,
      readLedger: async () => view([action(otherId)]),
    });
    expect(miss.status).toBe("missing");
  });

  it("waits for a delayed indexer row", async () => {
    let calls = 0;
    const result = await waitForPublicAction({
      actionId,
      timeoutMs: 50,
      pollMs: 1,
      now: () => calls * 10,
      sleep: async () => {
        calls += 1;
      },
      readLedger: async () => {
        calls += 1;
        return view(calls > 2 ? [action()] : []);
      },
    });
    expect(result.status).toBe("confirmed");
  });

  it("confirms immediately when the exact row is already present", async () => {
    const result = await waitForPublicAction({
      actionId,
      contractAddress: "aa".repeat(32),
      expectedResult: "authorized",
      timeoutMs: 10,
      pollMs: 5,
      now: () => 0,
      sleep: async () => undefined,
      readLedger: async () => view([action()]),
    });
    expect(result.status).toBe("confirmed");
  });

  it("never confirms a matching action id on the wrong contract", async () => {
    const result = await waitForPublicAction({
      actionId,
      contractAddress: "ff".repeat(32),
      timeoutMs: 20,
      pollMs: 5,
      now: (() => {
        let t = 0;
        return () => {
          t += 10;
          return t;
        };
      })(),
      sleep: async () => undefined,
      readLedger: async () => view([action()]),
    });
    expect(result.status).toBe("stale");
    expect(result.action).toBeUndefined();
  });

  it("returns stale when SucceedEntirely has no ledger row", async () => {
    const result = await waitForPublicAction({
      actionId,
      timeoutMs: 20,
      pollMs: 5,
      now: (() => {
        let t = 0;
        return () => {
          t += 10;
          return t;
        };
      })(),
      sleep: async () => undefined,
      readLedger: async () => view([]),
    });
    expect(result.status).toBe("stale");
    expect(result.action).toBeUndefined();
  });
});
