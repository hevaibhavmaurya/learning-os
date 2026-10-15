import { env, SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { seedOwnerAndSettings } from "../../src/server/db/seed";
import { testSessionCookie } from "./session";

const png = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="), (char) => char.charCodeAt(0));

async function signIn(): Promise<string> {
  return testSessionCookie();
}

describe("Content Studio R2 images", () => {
  beforeEach(async () => {
    await seedOwnerAndSettings(env);
  });

  it("stores bytes in R2, exposes the image on the post, and removes both records", async () => {
    const cookie = await signIn();
    const headers = { origin: env.APP_ORIGIN, cookie };
    const created = await SELF.fetch("http://localhost/api/studio/posts", {
      method: "POST", headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ title: "R2 integration test" }),
    });
    expect(created.status).toBe(201);
    const { id: postId } = await created.json() as { id: string };

    const uploaded = await SELF.fetch(`http://localhost/api/media/upload?entityType=post&entityId=${postId}`, {
      method: "POST", headers: { ...headers, "content-type": "image/png" }, body: png,
    });
    expect(uploaded.status).toBe(201);
    const { id: mediaId, url } = await uploaded.json() as { id: string; url: string };

    const row = await env.DB.prepare("SELECT r2_key, status FROM media_objects WHERE id = ?")
      .bind(mediaId).first<{ r2_key: string; status: string }>();
    expect(row?.status).toBe("ready");
    const object = await env.MEDIA.get(row!.r2_key);
    expect(new Uint8Array(await object!.arrayBuffer())).toEqual(png);

    const post = await SELF.fetch(`http://localhost/api/studio/posts/${postId}`, { headers });
    expect((await post.json() as { images: { id: string; url: string }[] }).images).toEqual([{ id: mediaId, url }]);
    const served = await SELF.fetch(`http://localhost${url}`, { headers });
    expect(served.status).toBe(200);
    expect(new Uint8Array(await served.arrayBuffer())).toEqual(png);

    const removed = await SELF.fetch(`http://localhost${url}`, { method: "DELETE", headers });
    expect(removed.status).toBe(200);
    expect(await env.MEDIA.get(row!.r2_key)).toBeNull();
    expect(await env.DB.prepare("SELECT id FROM media_objects WHERE id = ?").bind(mediaId).first()).toBeNull();
    expect((await SELF.fetch(`http://localhost${url}`, { headers })).status).toBe(404);
  });

  it("rejects invalid bytes and nonexistent posts without storing media", async () => {
    const cookie = await signIn();
    const headers = { origin: env.APP_ORIGIN, cookie, "content-type": "image/png" };
    const missing = await SELF.fetch("http://localhost/api/media/upload?entityType=post&entityId=missing", {
      method: "POST", headers, body: png,
    });
    expect(missing.status).toBe(404);
    const created = await SELF.fetch("http://localhost/api/studio/posts", {
      method: "POST", headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ title: "Invalid image test" }),
    });
    const { id } = await created.json() as { id: string };
    const invalid = await SELF.fetch(`http://localhost/api/media/upload?entityType=post&entityId=${id}`, {
      method: "POST", headers, body: "not an image",
    });
    expect(invalid.status).toBe(415);
    const count = await env.DB.prepare("SELECT count(*) AS n FROM media_objects WHERE linked_entity_id = ?")
      .bind(id).first<{ n: number }>();
    expect(count?.n).toBe(0);
  });
});
