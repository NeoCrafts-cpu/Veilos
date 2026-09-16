import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PREVIEW_CONFIG } from "@velios/midnight";
import { publicIndexerProvider } from "@velios/midnight";
import { readEconomyLedger } from "@velios/midnight/economy-client";
import { readAuditorLedger, readGovernanceLedger, readProcurementLedger } from "@velios/midnight/companion-client";

describe("preview wave2 live evidence", () => {
  it("reads retained Wave 2 contracts from the official indexer", async () => {
    if (!process.env["VELIOS_LIVE_PREVIEW"]) return;
    const evidencePath = resolve(process.cwd(), "../../deployment.wave2.json");
    if (!existsSync(evidencePath)) return;
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as {
      economy?: { contractAddress: string };
      governance?: { contractAddress: string };
      procurement?: { contractAddress: string };
      auditor?: { contractAddress: string };
      circuits: Array<{ circuit: string; confirmed: boolean; publicId?: string }>;
    };
    const providers = { publicDataProvider: publicIndexerProvider(PREVIEW_CONFIG) };
    if (evidence.economy) {
      const view = await readEconomyLedger(providers, evidence.economy.contractAddress);
      expect(view.contractAddress).toBe(evidence.economy.contractAddress);
      const authorized = evidence.circuits.find((row) => row.circuit === "authorizePayment" && row.confirmed);
      if (authorized?.publicId) {
        expect(view.authorizations.some((row) => row.actionId === authorized.publicId)).toBe(true);
      }
    }
    if (evidence.governance) {
      const view = await readGovernanceLedger(providers, evidence.governance.contractAddress);
      expect(view.contractAddress).toBe(evidence.governance.contractAddress);
    }
    if (evidence.procurement) {
      const view = await readProcurementLedger(providers, evidence.procurement.contractAddress);
      expect(view.contractAddress).toBe(evidence.procurement.contractAddress);
    }
    if (evidence.auditor) {
      const view = await readAuditorLedger(providers, evidence.auditor.contractAddress);
      expect(view.contractAddress).toBe(evidence.auditor.contractAddress);
    }
  });
});
