import { expect, test } from "@playwright/test";

test.describe("module recovery", () => {
  test("Wave 2 write screens recover through wallet connect instead of claiming success", async ({ page }) => {
    await page.goto("/app/credentials/issue");
    await expect(page.getByRole("heading", { name: /organization-issued credentials/i })).toBeVisible();
    await expect(page.getByText(/Connect a Midnight wallet/i)).toBeVisible();
    await expect(page.getByText(/AUTHORIZATION RECORDED/i)).toHaveCount(0);
    await page.goto("/app/treasury/settle");
    await expect(page.locator(".page-lead").filter({ hasText: /amount and recipient will be public/i })).toBeVisible();
    await expect(page.getByText(/Still private/i)).toBeVisible();
    await page.goto("/docs");
    await expect(page.getByRole("heading", { name: "Fail-closed", exact: true })).toBeVisible();
    await expect(page.locator('meta[name="velios-build"]')).toHaveCount(1);
  });
});
