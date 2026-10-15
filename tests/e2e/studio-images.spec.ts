import { expect, test } from "@playwright/test";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");

test("Studio images persist in R2 across reload and can be removed", async ({ page }) => {
  const headers = { origin: "http://127.0.0.1:43124" };
  const verified = await page.request.post("/api/auth/dev-session", { headers });
  expect(verified.ok()).toBeTruthy();
  const created = await page.request.post("/api/studio/posts", { headers, data: { title: "Image persistence test" } });
  expect(created.ok()).toBeTruthy();
  const { id } = await created.json();
  let mediaUrl: string | undefined;
  try {
    await page.goto(`/studio/${id}`);
    await page.getByLabel("Attach image", { exact: true }).setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: png });
    const image = page.getByRole("img", { name: "Attached image 1", exact: true });
    await expect(image).toBeVisible();
    mediaUrl = (await image.getAttribute("src"))!;
    expect(mediaUrl).toMatch(/^\/api\/media\//);
    const stored = await page.request.get(mediaUrl);
    expect(stored.status()).toBe(200);
    expect(await stored.body()).toEqual(png);
    await page.reload();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", mediaUrl);

    const invalid = await page.request.post(`/api/media/upload?entityType=post&entityId=${id}`, {
      headers: { ...headers, "content-type": "image/png" }, data: Buffer.from("not an image"),
    });
    expect(invalid.status()).toBe(415);
    const missing = await page.request.post("/api/media/upload?entityType=post&entityId=missing", {
      headers: { ...headers, "content-type": "image/png" }, data: png,
    });
    expect(missing.status()).toBe(404);

    await page.getByRole("button", { name: "Remove image 1", exact: true }).click();
    await expect(image).toHaveCount(0);
    expect((await page.request.get(mediaUrl)).status()).toBe(404);
    await page.reload();
    await expect(page.getByLabel("Attach image", { exact: true })).toBeEnabled();
    await expect(image).toHaveCount(0);
  } finally {
    if (mediaUrl) await page.request.delete(mediaUrl, { headers });
    await page.request.post(`/api/studio/posts/${id}/trash`, { headers });
  }
});
