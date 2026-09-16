import { expect, test } from "@playwright/test";

test.describe("Veilos critical public flows", () => {
  test("landing offers owner and public entry", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Private\.\s*Verifiable\.\s*Autonomous/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore public Preview organization/i })).toBeVisible();
  });

  test("setup does not claim proving is ready before a wallet exists", async ({ page }) => {
    await page.goto("/app/setup");
    await expect(page.getByRole("heading", { name: /Check readiness/i })).toBeVisible();
    await expect(page.getByText(/Connect a Midnight wallet\. Hosted UI does not include a proof server/i)).toBeVisible();
    await expect(page.getByText(/Local proof-server on loopback/i)).toHaveCount(0);
    await page.getByRole("button", { name: /Connect wallet/i }).first().click();
    await expect(page.getByText(/No Midnight wallet found|Install Lace or 1AM/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/The wallet declined the transaction/i)).toHaveCount(0);
  });

  test("authorize form rejects empty input and does not invent AUTHORIZED", async ({ page }) => {
    await page.goto("/app/authorize/new");
    await page.getByRole("button", { name: /Review authorization/i }).click();
    await expect(page.getByRole("alert", { name: /Recipient is required/i })).toBeVisible();
    await expect(page.getByRole("alert", { name: /Amount is required/i })).toBeVisible();
    await expect(page.getByText(/AUTHORIZED/i)).toHaveCount(0);
  });

  test("privacy inspector hides private slots", async ({ page }) => {
    await page.goto("/app/privacy");
    await expect(page.getByRole("heading", { name: /Privacy inspector/i })).toBeVisible();
    await expect(page.getByText(/private value hidden/i).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("25000");
  });

  test("docs portal is reachable from the public origin", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByRole("heading", { name: /^Veilos$/i })).toBeVisible();
    await expect(page.getByText(/No proof, no AUTHORIZED/i)).toBeVisible();
  });
});
