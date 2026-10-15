import { defineConfig, devices } from "@playwright/test";

const PORT = 43124;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * E2E + visual suites share this config.
 * Prefer the real local Vite+Worker API with ALLOW_FAKE_MAILER (wrangler.dev.jsonc).
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  },
  projects: [
    {
      name: "e2e",
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual",
      testMatch: /visual\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: `${BASE_URL}/api/health`,
    // Never attach tests to someone's running development database/R2 state.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
