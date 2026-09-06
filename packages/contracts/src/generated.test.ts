/**
 * Guards the boundary between `compact/authorization.compact` and the
 * TypeScript driver.
 *
 * The replica tests check Wave 1 *semantics*; this file checks that the
 * compiler-generated contract still has the circuits and witnesses the driver
 * supplies. Without it, renaming or reordering a Compact circuit parameter
 * would only surface as a failed transaction on a real network.
 */

import { describe, expect, it } from "vitest";
import { loadCompiledAuthorization, witnesses } from "./index.js";
import { compiledArtifactsPresent } from "./node-artifacts.js";

const EXPECTED_CIRCUITS = [
  "setOrganizationStatus",
  "registerMember",
  "setMemberStatus",
  "createAgent",
  "setAgentPolicy",
  "setAgentPolicyBySelf",
  "setAgentStatus",
  "authorizeAction",
] as const;

const EXPECTED_WITNESSES = [
  "ownerSecret",
  "memberSecret",
  "agentSecret",
  "agentRole",
  "roleSalt",
  "policyPerActionLimit",
  "policyDailyLimit",
  "policyVendorId",
  "policyCredentialOk",
  "policyCredentialExpiry",
  "policySelfModifyAllowed",
  "policySalt",
  "spendPeriodStart",
  "spendDaily",
  "spendSalt",
  "nextSpendSalt",
] as const;

const EXPECTED_LEDGER_FIELDS = [
  "organizationId",
  "organizationStatus",
  "adminCommitment",
  "members",
  "agents",
  "usedActionIds",
  "actions",
  "memberCount",
  "agentCount",
  "actionCount",
] as const;

describe("X5 compiled contract / driver parity", () => {
  it("driver witnesses exactly match the compiled witness surface", () => {
    // Extra or missing witnesses both break proving, so compare as sets.
    expect(Object.keys(witnesses).sort()).toEqual([...EXPECTED_WITNESSES].sort());
  });

  it("exposes every Wave 1 circuit and ledger field", async () => {
    if (!compiledArtifactsPresent()) {
      console.warn("ENVIRONMENT MISSING: run `pnpm compile:contracts` first. Skipping.");
      return;
    }
    const loaded = await loadCompiledAuthorization();
    expect(loaded).not.toBeNull();

    const ContractCtor = loaded!.Contract as new (w: unknown) => {
      impureCircuits: Record<string, unknown>;
      circuits: Record<string, unknown>;
    };
    const instance = new ContractCtor(witnesses);

    for (const circuitId of EXPECTED_CIRCUITS) {
      expect(typeof instance.impureCircuits[circuitId]).toBe("function");
    }

    // Pure commitment helpers stay callable for the Privacy Inspector.
    for (const pure of [
      "ownerCommitmentOf",
      "memberCommitmentOf",
      "agentCommitmentOf",
      "roleCommitmentOf",
      "policyCommitmentOf",
      "spendCommitmentOf",
    ]) {
      expect(typeof instance.circuits[pure]).toBe("function");
    }

    // `ledger()` projects the on-chain state the UI is allowed to read.
    const ledgerFn = loaded!.ledger as (state: unknown) => unknown;
    expect(typeof ledgerFn).toBe("function");
    const source = ledgerFn.toString();
    for (const field of EXPECTED_LEDGER_FIELDS) {
      expect(source).toContain(field);
    }
  });
});
