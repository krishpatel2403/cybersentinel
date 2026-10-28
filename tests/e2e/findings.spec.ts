import { expect, test } from "@playwright/test";

test.describe("findings workflow", () => {
  test("filters findings and opens a detail page", async ({ page }) => {
    await page.goto("/findings");

    await expect(page.getByRole("heading", { name: "Findings", exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: "Log4Shell vulnerable logging dependency", exact: true })
        .first(),
    ).toBeVisible();

    await page.getByLabel("Search findings").fill("Log4Shell");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/search=Log4Shell/);
    await page
      .getByRole("link", { name: "Log4Shell vulnerable logging dependency", exact: true })
      .first()
      .click();

    await expect(
      page.getByRole("heading", { name: "Log4Shell vulnerable logging dependency" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Analyst remediation plan" })).toBeVisible();
    await expect(page.getByText("CVE-2021-44228").first()).toBeVisible();
  });

  test("generates a remediation plan from a finding", async ({ page }) => {
    await page.goto("/findings");
    await page.getByLabel("Search findings").fill("Log4Shell");
    await page.getByRole("button", { name: "Apply" }).click();
    await page
      .getByRole("link", { name: "Log4Shell vulnerable logging dependency", exact: true })
      .first()
      .click();

    await page.getByRole("button", { name: "Generate plan" }).click();
    await expect(page.getByText("1. Confirm scope and impact")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("This is an educational plan")).toBeVisible();
  });
});
