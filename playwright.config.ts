import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/playwright",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: process.env.VELIOS_E2E_BASE_URL ?? "http://127.0.0.1:4177",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], browserName: "chromium" } },
    { name: "tablet", use: { ...devices["iPad Mini"], browserName: "chromium" } },
    { name: "mobile", use: { ...devices["Pixel 7"], browserName: "chromium" } },
  ],
  webServer: process.env.VELIOS_E2E_BASE_URL
    ? undefined
    : {
        command: "export PATH=\"/tmp/node22/bin:$PATH\"; pnpm --filter @velios/web dev",
        url: "http://127.0.0.1:4177",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
