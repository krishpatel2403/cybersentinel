import { expect, test } from "@playwright/test";

test.describe("threat intel", () => {
  test("shows advisories and labels the data source", async ({ page }) => {
    await page.goto("/intel");

    await expect(page.getByRole("heading", { name: "Threat intel" })).toBeVisible();
    await expect(page.getByText(/Live CISA feed|Bundled sample/)).toBeVisible();
    await expect(page.getByText(/^CVE-\d{4}-\d+$/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /CISA catalog/ })).toBeVisible();
  });

  test("filters advisories by search", async ({ page }) => {
    await page.goto("/intel");
    const firstCve = page.getByText(/^CVE-\d{4}-\d+$/).first();
    await expect(firstCve).toBeVisible();
    const cveText = (await firstCve.textContent())?.trim() ?? "";
    expect(cveText).toMatch(/^CVE-\d{4}-\d+$/);

    await page.getByLabel("Search advisories").fill(cveText);
    await page.getByRole("button", { name: "Filter", exact: true }).click();

    await expect(page).toHaveURL(/search=CVE-/);
    await expect(page.getByText(cveText, { exact: true })).toBeVisible();
  });
});
