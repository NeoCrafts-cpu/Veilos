import { expect, test } from "@playwright/test";

test.describe("workspace sidebar", () => {
  test("desktop groups stay visible and child routes deep-link", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop navigation is asserted on chromium.");
    await page.goto("/app");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Readiness" })).toBeVisible();
    await page.getByRole("link", { name: "Issue" }).click();
    await expect(page).toHaveURL(/\/app\/credentials\/issue$/);
    await expect(page.getByRole("link", { name: "Issue" })).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: "Settle" }).click();
    await expect(page).toHaveURL(/\/app\/treasury\/settle$/);
  });

  test("tablet and mobile open an accessible drawer", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "chromium", "Drawer behavior is asserted on tablet and mobile.");
    await page.goto("/app");
    const menu = page.getByRole("button", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await expect(page.getByRole("button", { name: "Close", exact: true })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
