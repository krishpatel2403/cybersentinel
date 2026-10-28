import { expect, test } from "@playwright/test";

test.describe("asset inventory", () => {
  test("lists assets and filters by search", async ({ page }) => {
    await page.goto("/assets");

    await expect(page.getByRole("heading", { name: "Asset inventory" })).toBeVisible();
    await expect(page.getByText("Production web frontend", { exact: true })).toBeVisible();

    await page.getByLabel("Search assets").fill("Production web");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/search=Production/);
    await expect(page.getByText("Production web frontend", { exact: true })).toBeVisible();
    await expect(page.getByText("Finance laptop", { exact: true })).toHaveCount(0);
  });

  test("opens an asset detail page with its findings", async ({ page }) => {
    await page.goto("/assets");
    await page.getByRole("link", { name: "Production web frontend", exact: true }).click();

    await expect(page).toHaveURL(/\/assets\/[0-9a-f-]+$/);
    await expect(page.getByRole("heading", { name: "Production web frontend" })).toBeVisible();
    await expect(page.getByText("prod-web-01").first()).toBeVisible();
  });
});
