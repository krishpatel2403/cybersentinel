import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("sign-in", () => {
  test("shows demo accounts and validates bad credentials", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByText("Demo accounts", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Administrator/ }).click();
    await expect(page.getByLabel("Email address")).toHaveValue("admin@cybersentinel.dev");
    await page.getByRole("textbox", { name: "Password", exact: true }).fill("DefinitelyWrong!2026");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("protects app routes when signed out", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  });
});
