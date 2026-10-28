import { expect, test } from "@playwright/test";

test.describe("copilot", () => {
  test("answers a suggested question with citations", async ({ page }) => {
    await page.goto("/copilot");

    await expect(page.getByRole("heading", { name: "Copilot", exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: /Give me a security posture briefing/ })
      .first()
      .click();

    await expect(page.getByText(/Security posture: \d+\/100/)).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText("Sources", { exact: true })).toBeVisible();
    await expect(page.getByText("Something broke on this screen.")).toHaveCount(0);
  });

  test("rejects a question that is too short", async ({ page }) => {
    await page.goto("/copilot");
    await expect(page.getByRole("button", { name: "Ask" })).toBeDisabled();
  });
});
