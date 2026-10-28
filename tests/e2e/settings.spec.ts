import { expect, test } from "@playwright/test";

test.describe("settings", () => {
  test("shows profile, password, and system sections", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Password & sessions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "System", exact: true })).toBeVisible();
    await expect(page.getByLabel("Display name")).toHaveValue("Ava Chen");
  });
});
