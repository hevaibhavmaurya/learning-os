import { expect, test, type Page } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:43124";

async function clearAuth(page: Page) {
  await page.goto("/login");
  await page.context().clearCookies();
}

async function loginForTest(page: Page) {
  const res = await page.request.post("/api/auth/dev-session", {
    headers: {
      origin: APP_ORIGIN,
      "content-type": "application/json",
    },
  });
  expect(
    res.ok(),
    `dev-session failed: ${res.status()} ${await res.text()}`,
  ).toBeTruthy();
}

test.describe("auth smoke", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByText("Learning OS").first()).toBeVisible();
  });

  test("unauthenticated visit redirects to login", async ({ page }) => {
    await page.goto("/today");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("authenticated shell shows primary nav after session", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginForTest(page);
    await page.goto("/today");
    await expect(page).toHaveURL(/\/today/);

    // Desktop sidebar is an <aside aria-label="Primary"> (complementary).
    const shell = page.getByRole("complementary", { name: "Primary" });
    await expect(shell).toBeVisible();
    for (const label of [
      "Today",
      "Roadmap",
      "Projects",
      "Library",
      "Content Studio",
      "Progress",
    ]) {
      await expect(shell.getByRole("link", { name: label })).toBeVisible();
    }

    await shell.getByRole("link", { name: "Roadmap" }).click();
    await expect(page).toHaveURL(/\/roadmap/);
  });

  test("session survives reload and logout clears the server cookie", async ({ page }) => {
    await loginForTest(page);
    await page.goto("/today");
    await page.reload();
    await expect(page).toHaveURL(/\/today/);
    const loggedOut = await page.request.post("/api/auth/logout", { headers: { origin: APP_ORIGIN } });
    expect(loggedOut.ok()).toBeTruthy();
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });
});
