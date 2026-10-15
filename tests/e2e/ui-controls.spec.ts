import { expect, test } from "@playwright/test";

test("menus stay anchored and command results scroll within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.request.post("/api/auth/dev-session", { headers: { origin: "http://127.0.0.1:43124" } });
  await page.addInitScript(() => {
    localStorage.setItem("los.ui", JSON.stringify({ theme: "dark", collapsed: false }));
  });
  await page.route("**/api/notes?**", (route) => route.fulfill({ json: { items: [], nextCursor: null } }));
  await page.goto("/library");

  const collapse = page.getByRole("button", { name: "Collapse sidebar" });
  await expect(collapse).toHaveCSS("justify-content", "flex-start");
  const trigger = page.getByRole("button", { name: "Templates", exact: true });
  const anchor = await trigger.boundingBox();
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const popup = await menu.boundingBox();
  expect(anchor).not.toBeNull();
  expect(popup).not.toBeNull();
  expect(Math.abs(popup!.x + popup!.width - anchor!.x - anchor!.width)).toBeLessThan(3);
  expect(popup!.y).toBeGreaterThanOrEqual(anchor!.y + anchor!.height);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: /Jump to week/ }).click();
  const dialog = page.getByRole("dialog", { name: "Jump to" });
  await expect(dialog).toBeVisible();
  const list = dialog.locator("[cmdk-list]");
  await expect(list).toHaveCSS("overflow-y", "auto");
  const bounds = await dialog.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(720);
  const input = dialog.getByRole("combobox");
  await input.fill("Week 91");
  await expect(dialog.getByRole("option").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("note select has padded options and project search stays below its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.request.post("/api/auth/dev-session", { headers: { origin: "http://127.0.0.1:43124" } });
  await page.route("**/api/notes/ui-test", (route) => route.fulfill({ json: {
    id: "ui-test", kind: "note", title: "UI regression", schemaVersion: 1,
    editorState: null, plainText: "Example note", tags: [], weekNumber: null,
    projectId: null, revision: 0, archivedAt: null, trashedAt: null,
    createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  } }));
  await page.goto("/library/notes/ui-test");
  await page.getByRole("combobox", { name: "Type", exact: true }).click();
  const option = page.getByRole("option", { name: "Note", exact: true });
  await expect(option).toHaveCSS("padding-left", "12px");
  await expect(option).toHaveCSS("padding-right", "32px");
  const mark = option.locator("svg");
  const optionBox = await option.boundingBox();
  const markBox = await mark.boundingBox();
  expect(markBox!.x).toBeGreaterThan(optionBox!.x + optionBox!.width / 2);
  await page.keyboard.press("Escape");
  const trigger = page.getByRole("combobox", { name: "Linked project", exact: true });
  await trigger.click();
  const search = page.getByRole("combobox", { name: "Search linked project", exact: true });
  await search.fill("Flagship");
  await expect(page.getByRole("option")).toHaveCount(1);
  const anchor = await trigger.boundingBox();
  const field = await search.boundingBox();
  expect(field!.y).toBeGreaterThan(anchor!.y + anchor!.height);
  await expect(page.locator('[data-state="open"][role="dialog"]')).toHaveCount(1);
});
