import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

/**
 * Visual capture matrix harness.
 *
 * Captures reference/index7.html and app routes at 390/768/1440 × light/dark.
 * Full pixel-diff compare is deferred; this suite materializes baselines under
 * tests/visual/baselines/ when RUN_VISUAL_CAPTURE=1.
 *
 * Default (CI/smoke): verifies harness wiring and directory layout only —
 * does not claim visual parity.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const BASELINES = path.join(ROOT, "tests/visual/baselines");
const REFERENCE_HTML = path.join(ROOT, "reference/index7.html");

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 1000 },
] as const;

const THEMES = ["light", "dark"] as const;

/** Reference hash → app path (parity mapping). */
const ROUTES: { id: string; referenceHash: string; appPath: string }[] = [
  { id: "login", referenceHash: "#/login", appPath: "/login" },
  { id: "today", referenceHash: "#/today", appPath: "/today" },
  { id: "roadmap", referenceHash: "#/roadmap", appPath: "/roadmap" },
  {
    id: "week-9-overview",
    referenceHash: "#/week/9/overview",
    appPath: "/weeks/9/overview",
  },
  { id: "projects", referenceHash: "#/projects", appPath: "/projects" },
  { id: "projects-p01", referenceHash: "#/projects/P01", appPath: "/projects/P01" },
  { id: "library", referenceHash: "#/library", appPath: "/library" },
  { id: "studio", referenceHash: "#/studio", appPath: "/studio" },
  { id: "progress", referenceHash: "#/progress", appPath: "/progress" },
  { id: "settings", referenceHash: "#/settings", appPath: "/settings" },
];

function baselinePath(
  kind: "reference" | "app",
  routeId: string,
  viewport: string,
  theme: string,
): string {
  return path.join(
    BASELINES,
    kind,
    routeId,
    `${viewport}-${theme}.png`,
  );
}

async function applyTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("los.ui", JSON.stringify({ theme: t }));
    } catch {
      /* ignore */
    }
  }, theme);
  await page.emulateMedia({ colorScheme: theme });
}

const APP_ORIGIN = "http://127.0.0.1:43124";

/** Local browser-test session for authenticated captures. */
async function loginForCapture(page: Page) {
  const response = await page.request.post("/api/auth/dev-session", {
    headers: {
      origin: APP_ORIGIN,
      "content-type": "application/json",
    },
  });
  if (!response.ok()) throw new Error(`Dev session failed: ${response.status()}`);
}

test.describe("visual matrix harness", () => {
  test("documents baseline directory layout", async () => {
    expect(fs.existsSync(REFERENCE_HTML)).toBe(true);
    for (const kind of ["reference", "app"] as const) {
      for (const route of ROUTES) {
        const dir = path.join(BASELINES, kind, route.id);
        fs.mkdirSync(dir, { recursive: true });
        const marker = path.join(dir, ".gitkeep");
        if (!fs.existsSync(marker)) fs.writeFileSync(marker, "");
      }
    }
    // Manifest of expected capture paths (always written).
    const manifest = {
      viewports: VIEWPORTS.map((v) => ({
        name: v.name,
        width: v.width,
        height: v.height,
      })),
      themes: [...THEMES],
      routes: ROUTES,
      paths: ROUTES.flatMap((route) =>
        VIEWPORTS.flatMap((vp) =>
          THEMES.map((theme) => ({
            routeId: route.id,
            reference: path.relative(
              ROOT,
              baselinePath("reference", route.id, vp.name, theme),
            ),
            app: path.relative(
              ROOT,
              baselinePath("app", route.id, vp.name, theme),
            ),
          })),
        ),
      ),
      captureStatus: "NOT_CAPTURED",
      note:
        "Set RUN_VISUAL_CAPTURE=1 to write PNGs. Do not mark visual parity DONE until captures are inspected.",
    };
    fs.mkdirSync(BASELINES, { recursive: true });
    fs.writeFileSync(
      path.join(BASELINES, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
  });

  test("captures reference and app screenshots when RUN_VISUAL_CAPTURE=1", async ({
    browser,
    browserName,
  }) => {
    test.skip(
      process.env.RUN_VISUAL_CAPTURE !== "1",
      "Capture deferred — set RUN_VISUAL_CAPTURE=1 to materialize baselines",
    );
    test.skip(browserName !== "chromium", "Chromium only for baselines");
    test.setTimeout(10 * 60_000);

    const fileUrl = `file://${REFERENCE_HTML}`;

    // Authenticate once into a reusable cookie storage state.
    const boot = await browser.newContext({ baseURL: APP_ORIGIN });
    const bootPage = await boot.newPage();
    await loginForCapture(bootPage);
    const storagePath = path.join(BASELINES, ".auth-storage.json");
    fs.mkdirSync(BASELINES, { recursive: true });
    await boot.storageState({ path: storagePath });
    await boot.close();

    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        for (const theme of THEMES) {
          // Fresh contexts avoid addInitScript accumulation / redirect loops
          const refCtx = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            colorScheme: theme,
          });
          const refPage = await refCtx.newPage();
          await applyTheme(refPage, theme);
          await refPage.goto(`${fileUrl}${route.referenceHash}`, {
            waitUntil: "domcontentloaded",
          });
          await refPage.waitForTimeout(250);
          const refOut = baselinePath(
            "reference",
            route.id,
            vp.name,
            theme,
          );
          fs.mkdirSync(path.dirname(refOut), { recursive: true });
          await refPage.screenshot({ path: refOut, fullPage: false });
          await refCtx.close();

          const appCtx = await browser.newContext({
            baseURL: APP_ORIGIN,
            viewport: { width: vp.width, height: vp.height },
            colorScheme: theme,
            ...(route.appPath === "/login"
              ? {}
              : { storageState: storagePath }),
          });
          const appPage = await appCtx.newPage();
          await applyTheme(appPage, theme);
          const appUrl =
            route.appPath === "/login"
              ? `/login?theme=${theme}`
              : `${route.appPath}?theme=${theme}`;
          try {
            await appPage.goto(appUrl, { waitUntil: "domcontentloaded" });
            if (route.appPath === "/login") {
              await appPage.getByRole("heading", { name: "Sign in" }).waitFor({
                timeout: 15_000,
              });
            } else {
              await appPage.locator("h1").first().waitFor({
                state: "visible",
                timeout: 15_000,
              });
              await appPage.waitForTimeout(500);
            }
          } catch (err) {
            console.warn(
              `capture wait failed for ${route.id} ${vp.name} ${theme}:`,
              err instanceof Error ? err.message : err,
            );
          }
          const appOut = baselinePath("app", route.id, vp.name, theme);
          fs.mkdirSync(path.dirname(appOut), { recursive: true });
          await appPage.screenshot({ path: appOut, fullPage: false });
          await appCtx.close();
        }
      }
    }

    const statusPath = path.join(BASELINES, "CAPTURE_STATUS.md");
    fs.writeFileSync(
      statusPath,
      [
        "# Visual capture status",
        "",
        `- Captured at: ${new Date().toISOString()}`,
        `- Auth: local browser-test session cookie + storageState`,
        `- Routes: ${ROUTES.length}`,
        `- Viewports: ${VIEWPORTS.map((v) => v.name).join(", ")}`,
        `- Themes: ${THEMES.join(", ")}`,
        `- Inspection: compare app vs reference PNGs under tests/visual/baselines/`,
        "",
      ].join("\n"),
    );
  });
});
