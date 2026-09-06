import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // The real Compact compile of 8 ledger circuits takes ~3 minutes.
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
