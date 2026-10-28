import { expect, test } from "@playwright/test";

test.describe("dashboard", () => {
  test("shows the posture overview and primary metrics", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Security posture" })).toBeVisible();
    await expect(page.getByText("Open findings", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Internet-facing assets", { exact: true })).toBeVisible();
    await expect(page.getByText("Events · 24 hours", { exact: true })).toBeVisible();
    await expect(page.getByText("Analyst briefing", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ask copilot/ }).first()).toBeVisible();
    await expect(page.getByText("Something broke on this screen.")).toHaveCount(0);
  });

  test("navigates from the dashboard to the findings register", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Findings", exact: true }).first().click();
    await expect(page).toHaveURL(/\/findings$/);
    await expect(page.getByRole("heading", { name: "Findings", exact: true })).toBeVisible();
  });

  test("fits a phone viewport without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/dashboard", "/findings"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} should not overflow horizontally`).toBeLessThanOrEqual(1);
    }

    await page.goto("/findings");
    await expect(
      page
        .getByRole("link", { name: "Log4Shell vulnerable logging dependency", exact: true })
        .last(),
    ).toBeVisible();
  });
});
