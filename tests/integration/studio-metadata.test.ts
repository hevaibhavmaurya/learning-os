import { env, SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { seedOwnerAndSettings } from "../../src/server/db/seed";
import { testSessionCookie } from "./session";

async function session(): Promise<string> {
  return testSessionCookie();
}

describe("Content Studio metadata persistence", () => {
  beforeEach(async () => {
    await seedOwnerAndSettings(env);
  });

  it("round-trips week, project, date, URLs and copy across saves", async () => {
    const cookie = await session();
    const headers = { origin: env.APP_ORIGIN, cookie, "content-type": "application/json" };
    const created = await SELF.fetch("http://localhost/api/studio/posts", {
      method: "POST", headers, body: JSON.stringify({ title: "Draft metadata test" }),
    });
    expect(created.status).toBe(201);
    const { id } = await created.json() as { id: string };
    const plannedAt = "2026-11-12T09:00:00.000Z";
    const updated = await SELF.fetch(`http://localhost/api/studio/posts/${id}`, {
      method: "PATCH", headers,
      body: JSON.stringify({
        expectedRevision: 0,
        title: "Saved title",
        status: "ready",
        weekNumber: 12,
        projectId: "P01",
        plannedAt,
        urls: { li: "https://example.com/linkedin", x: "https://example.com/x" },
        copy: { li: "Saved copy" },
      }),
    });
    expect(updated.status).toBe(200);

    const detail = await SELF.fetch(`http://localhost/api/studio/posts/${id}`, { headers });
    expect(detail.status).toBe(200);
    const post = await detail.json() as Record<string, unknown>;
    expect(post).toMatchObject({
      title: "Saved title", status: "ready", weekNumber: 12,
      projectId: "P01", plannedAt,
      urls: { li: "https://example.com/linkedin", x: "https://example.com/x" },
      copy: { li: "Saved copy" }, revision: 1,
    });

    const cleared = await SELF.fetch(`http://localhost/api/studio/posts/${id}`, {
      method: "PATCH", headers,
      body: JSON.stringify({
        expectedRevision: 1, weekNumber: null, projectId: null,
        plannedAt: null, urls: {},
      }),
    });
    expect(cleared.status).toBe(200);
    const afterClear = await (await SELF.fetch(`http://localhost/api/studio/posts/${id}`, { headers })).json() as Record<string, unknown>;
    expect(afterClear).toMatchObject({ weekNumber: null, projectId: null, plannedAt: null, urls: {} });
  });

  it("accepts only one of two saves based on the same revision", async () => {
    const cookie = await session();
    const headers = { origin: env.APP_ORIGIN, cookie, "content-type": "application/json" };
    const created = await SELF.fetch("http://localhost/api/studio/posts", {
      method: "POST", headers, body: JSON.stringify({ title: "Concurrent draft" }),
    });
    expect(created.status).toBe(201);
    const { id } = await created.json() as { id: string };
    const save = (title: string) => SELF.fetch(`http://localhost/api/studio/posts/${id}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ expectedRevision: 0, title }),
    });
    const results = await Promise.all([save("First"), save("Second")]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
    const detail = await (await SELF.fetch(`http://localhost/api/studio/posts/${id}`, { headers })).json() as { revision: number; title: string };
    expect(detail.revision).toBe(1);
    expect(["First", "Second"]).toContain(detail.title);
  });
});
