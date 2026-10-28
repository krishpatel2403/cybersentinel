import { expect, test } from "@playwright/test";

test.describe("events", () => {
  test("shows the labeled event stream", async ({ page }) => {
    await page.goto("/events");

    await expect(page.getByRole("heading", { name: "Security events" })).toBeVisible();
    await expect(page.getByText("Demonstration telemetry")).toBeVisible();
    await expect(page.getByRole("button", { name: /Simulate telemetry/ })).toBeVisible();
  });

  test("filters events by severity", async ({ page }) => {
    await page.goto("/events");
    await page.getByLabel("Filter by severity").selectOption("high");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/severity=high/);
    await expect(page.getByText(/Showing \d+ events/)).toBeVisible();
  });
});
