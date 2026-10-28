import { expect, test } from "@playwright/test";

test.describe("audit log", () => {
  test("is visible to an administrator and records authentication", async ({ page }) => {
    await page.goto("/audit");

    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
    await expect(page.getByText("auth.login").first()).toBeVisible();
    await expect(page.getByText("Admin only", { exact: false }).first()).toBeVisible();
  });

  test("filters audit entries by action", async ({ page }) => {
    await page.goto("/audit");
    await page.getByLabel("Search audit log").fill("auth.");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page).toHaveURL(/search=auth/);
    await expect(page.getByText("auth.login").first()).toBeVisible();
  });
});

test.describe("analyst access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("hides the audit log and redirects the analyst away from it", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Analyst/ }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Security posture" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Audit log" })).toHaveCount(0);

    await page.goto("/audit");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Security posture" })).toBeVisible();
  });
});
