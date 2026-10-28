import { test as setup, expect } from "@playwright/test";

setup("authenticate as the demo administrator", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Administrator/ }).click();
  await expect(page.getByLabel("Email address")).toHaveValue("admin@cybersentinel.dev");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Security posture" })).toBeVisible();

  await page.context().storageState({ path: ".auth/admin.json" });
});
