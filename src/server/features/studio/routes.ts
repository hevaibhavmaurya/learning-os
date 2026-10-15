import { Hono } from "hono";
import { and, desc, eq, isNotNull, isNull, like, sql } from "drizzle-orm";
import { z } from "zod";
import {
  postDetailResponseSchema,
  postListResponseSchema,
  postUpdateSchema,
  studioPlatformSchema,
} from "../../../shared/contracts/posts";
import { createDb } from "../../db/client";
import { mediaObjects, platformCopy, posts } from "../../db/schema";
import type { AppEnv } from "../../env";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";

export const studioRoutes = new Hono<AppEnv>();
studioRoutes.use("*", requireAuthMiddleware());

const PLATFORMS = ["li", "x", "ig"] as const;

function postUrls(raw: string, savedUrl: string | null): Record<string, string> {
  let urls: Record<string, string> = {};
  try {
    const parsed = z.record(z.string(), z.string()).safeParse(JSON.parse(raw));
    if (parsed.success) urls = parsed.data;
  } catch {
    // Keep a post readable if stored metadata is malformed.
  }
  if (savedUrl && !urls.saved) urls.saved = savedUrl;
  return urls;
}

function previewFromCopies(
  copies: Array<{ platform: string; body: string }>,
): string {
  const order = ["li", "x", "ig"];
  for (const p of order) {
    const hit = copies.find((c) => c.platform === p && c.body.trim());
    if (hit) {
      const t = hit.body.replace(/\s+/g, " ").trim();
      return t.length <= 160 ? t : `${t.slice(0, 159)}…`;
    }
  }
  return "";
}

async function loadCopies(db: ReturnType<typeof createDb>, postId: string) {
  return db
    .select({
      id: platformCopy.id,
      platform: platformCopy.platform,
      body: platformCopy.body,
      charCount: platformCopy.charCount,
      revision: platformCopy.revision,
      updatedAt: platformCopy.updatedAt,
    })
    .from(platformCopy)
    .where(eq(platformCopy.postId, postId))
    .all();
}

async function loadMedia(db: ReturnType<typeof createDb>, ownerId: string, postId: string) {
  return db
    .select({
      id: mediaObjects.id,
      r2Key: mediaObjects.r2Key,
      contentType: mediaObjects.contentType,
      byteSize: mediaObjects.byteSize,
      status: mediaObjects.status,
    })
    .from(mediaObjects)
    .where(
      and(
        eq(mediaObjects.ownerId, ownerId),
        eq(mediaObjects.linkedEntityType, "post"),
        eq(mediaObjects.linkedEntityId, postId),
        eq(mediaObjects.status, "ready"),
      ),
    )
    .all();
}

function toDetail(
  post: typeof posts.$inferSelect,
  copies: Awaited<ReturnType<typeof loadCopies>>,
  media: Awaited<ReturnType<typeof loadMedia>>,
) {
  const copy = { li: "", x: "", ig: "" };
  for (const c of copies) {
    if (c.platform === "li" || c.platform === "x" || c.platform === "ig") {
      copy[c.platform] = c.body;
    }
  }
  return postDetailResponseSchema.parse({
    id: post.id,
    title: post.title,
    status: post.status,
    weekNumber: post.weekNumber,
    projectId: post.projectId,
    plannedAt: post.plannedAt,
    publishedAt: post.publishedAt,
    urls: postUrls(post.urlsJson, post.savedUrl),
    images: media.map((m) => ({
      id: m.id,
      url: `/api/media/${encodeURIComponent(m.id)}`,
    })),
    copy,
    revision: post.revision,
    trashedAt: post.trashedAt,
    updatedAt: post.updatedAt,
    createdAt: post.createdAt,
  });
}

studioRoutes.get("/posts", async (c) => {
  const owner = requireOwner(c);
  const limit = Math.min(Number(c.req.query("limit") ?? 25) || 25, 100);
  const cursor = c.req.query("cursor") ?? null;
  const q = c.req.query("q")?.trim();
  const status = c.req.query("status") ?? "all";
  const db = createDb(c.env.DB);

  const conditions = [eq(posts.ownerId, owner.id)];
  if (status === "trash") {
    conditions.push(isNotNull(posts.trashedAt));
  } else {
    conditions.push(isNull(posts.trashedAt));
    if (status !== "all") {
      conditions.push(eq(posts.status, status));
    }
  }
  if (q) {
    conditions.push(like(posts.title, `%${q}%`));
  }
  if (cursor) {
    conditions.push(sql`${posts.updatedAt} < ${cursor}`);
  }

  const rows = await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.updatedAt))
    .limit(limit + 1)
    .all();

  const page = rows.slice(0, limit);
  const items = [];
  for (const row of page) {
    const copies = await loadCopies(db, row.id);
    const media = await loadMedia(db, owner.id, row.id);
    const platforms = copies
      .filter(
        (c) =>
          c.body.trim() &&
          (PLATFORMS as readonly string[]).includes(c.platform),
      )
      .map((c) => c.platform as (typeof PLATFORMS)[number]);
    items.push({
      id: row.id,
      title: row.title,
      status: row.status,
      preview: previewFromCopies(copies),
      platforms,
      weekNumber: row.weekNumber,
      projectId: row.projectId,
      plannedAt: row.plannedAt,
      publishedAt: row.publishedAt,
      imageCount: media.length,
      revision: row.revision,
      trashedAt: row.trashedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    });
  }

  const allActive = await db
    .select({ status: posts.status })
    .from(posts)
    .where(and(eq(posts.ownerId, owner.id), isNull(posts.trashedAt)))
    .all();
  const counts = { idea: 0, draft: 0, ready: 0, published: 0 };
  for (const r of allActive) {
    if (r.status in counts) {
      counts[r.status as keyof typeof counts] += 1;
    }
  }

  return c.json(
    postListResponseSchema.parse({
      items,
      nextCursor:
        rows.length > limit ? (page[page.length - 1]?.updatedAt ?? null) : null,
      counts,
    }),
  );
});

studioRoutes.post("/posts", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      title: z.string().min(1).max(500),
      status: z.enum(["idea", "draft", "ready", "published"]).optional(),
    }),
  );
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("post_");
  const status = body.status ?? "idea";
  await db
    .insert(posts)
    .values({
      id,
      ownerId: owner.id,
      title: body.title.trim(),
      status,
      publishedAt: null,
      savedUrl: null,
      trashedAt: null,
      revision: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .get();
  if (!post) throw new AppError("internal_error", "Post create failed", 500);
  return c.json(toDetail(post, [], []), 201);
});

studioRoutes.get("/posts/:postId", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const post = await db
    .select()
    .from(posts)
    .where(
      and(eq(posts.id, c.req.param("postId")), eq(posts.ownerId, owner.id)),
    )
    .get();
  if (!post) throw new AppError("not_found", "Post not found", 404);
  const copies = await loadCopies(db, post.id);
  const media = await loadMedia(db, owner.id, post.id);
  return c.json(toDetail(post, copies, media));
});

studioRoutes.patch("/posts/:postId", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, postUpdateSchema);
  const db = createDb(c.env.DB);
  const postId = c.req.param("postId");
  const existing = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.ownerId, owner.id)))
    .get();
  if (!existing) throw new AppError("not_found", "Post not found", 404);
  if (existing.revision !== body.expectedRevision) {
    throw new AppError("stale_revision", "Post revision conflict", 409);
  }

  const now = new Date().toISOString();
  const nextRevision = existing.revision + 1;
  const updated = await db
    .update(posts)
    .set({
      title: body.title ?? existing.title,
      status: body.status ?? existing.status,
      weekNumber: body.weekNumber !== undefined ? body.weekNumber : existing.weekNumber,
      projectId: body.projectId !== undefined ? body.projectId : existing.projectId,
      plannedAt: body.plannedAt !== undefined ? body.plannedAt : existing.plannedAt,
      publishedAt:
        body.publishedAt !== undefined ? body.publishedAt : existing.publishedAt,
      urlsJson: body.urls !== undefined ? JSON.stringify(body.urls) : existing.urlsJson,
      savedUrl:
        body.urls?.saved !== undefined
          ? body.urls.saved || null
          : existing.savedUrl,
      revision: nextRevision,
      updatedAt: now,
    })
    .where(and(
      eq(posts.id, postId),
      eq(posts.ownerId, owner.id),
      eq(posts.revision, body.expectedRevision),
    ))
    .run();
  if (updated.meta.changes !== 1) {
    throw new AppError("stale_revision", "Post revision conflict", 409);
  }

  if (body.copy) {
    for (const platform of PLATFORMS) {
      const text = body.copy[platform];
      if (text === undefined) continue;
      studioPlatformSchema.parse(platform);
      const row = await db
        .select()
        .from(platformCopy)
        .where(
          and(
            eq(platformCopy.postId, postId),
            eq(platformCopy.platform, platform),
          ),
        )
        .get();
      if (row) {
        await db
          .update(platformCopy)
          .set({
            body: text,
            charCount: text.length,
            revision: row.revision + 1,
            updatedAt: now,
          })
          .where(eq(platformCopy.id, row.id))
          .run();
      } else {
        await db
          .insert(platformCopy)
          .values({
            id: createId("pc_"),
            ownerId: owner.id,
            postId,
            platform,
            body: text,
            charCount: text.length,
            revision: 0,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
    }
  }

  return c.json({ id: postId, revision: nextRevision, updatedAt: now });
});

studioRoutes.post("/posts/:postId/duplicate", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const source = await db
    .select()
    .from(posts)
    .where(
      and(eq(posts.id, c.req.param("postId")), eq(posts.ownerId, owner.id)),
    )
    .get();
  if (!source) throw new AppError("not_found", "Post not found", 404);
  const now = new Date().toISOString();
  const id = createId("post_");
  await db
    .insert(posts)
    .values({
      id,
      ownerId: owner.id,
      title: `${source.title} (copy)`,
      status: "draft",
      weekNumber: source.weekNumber,
      projectId: source.projectId,
      plannedAt: source.plannedAt,
      publishedAt: null,
      savedUrl: null,
      trashedAt: null,
      revision: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  const copies = await loadCopies(db, source.id);
  for (const copy of copies) {
    await db
      .insert(platformCopy)
      .values({
        id: createId("pc_"),
        ownerId: owner.id,
        postId: id,
        platform: copy.platform,
        body: copy.body,
        charCount: copy.charCount,
        revision: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
  const post = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) throw new AppError("internal_error", "Duplicate failed", 500);
  const newCopies = await loadCopies(db, id);
  return c.json(toDetail(post, newCopies, []), 201);
});

studioRoutes.post("/posts/:postId/trash", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const exists = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(eq(posts.id, c.req.param("postId")), eq(posts.ownerId, owner.id)),
    )
    .get();
  if (!exists) throw new AppError("not_found", "Post not found", 404);
  await db
    .update(posts)
    .set({ trashedAt: now, updatedAt: now })
    .where(eq(posts.id, exists.id))
    .run();
  return c.json({ ok: true as const });
});

studioRoutes.post("/posts/:postId/restore", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  await db
    .update(posts)
    .set({ trashedAt: null, updatedAt: now })
    .where(
      and(eq(posts.id, c.req.param("postId")), eq(posts.ownerId, owner.id)),
    )
    .run();
  return c.json({ ok: true as const });
});

studioRoutes.put("/posts/:postId/copy/:platform", async (c) => {
  const owner = requireOwner(c);
  const platform = studioPlatformSchema.parse(c.req.param("platform"));
  const body = await parseJson(
    c,
    z.object({
      body: z.string().max(100_000),
      expectedRevision: z.number().int().nonnegative(),
    }),
  );
  const db = createDb(c.env.DB);
  const postId = c.req.param("postId");
  const post = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.ownerId, owner.id)))
    .get();
  if (!post) throw new AppError("not_found", "Post not found", 404);

  const existing = await db
    .select()
    .from(platformCopy)
    .where(
      and(eq(platformCopy.postId, postId), eq(platformCopy.platform, platform)),
    )
    .get();

  const now = new Date().toISOString();
  if (existing) {
    if (existing.revision !== body.expectedRevision) {
      throw new AppError("stale_revision", "Copy revision conflict", 409);
    }
    const next = existing.revision + 1;
    await db
      .update(platformCopy)
      .set({
        body: body.body,
        charCount: body.body.length,
        revision: next,
        updatedAt: now,
      })
      .where(eq(platformCopy.id, existing.id))
      .run();
    return c.json({ id: existing.id, revision: next, updatedAt: now });
  }

  const id = createId("pc_");
  await db
    .insert(platformCopy)
    .values({
      id,
      ownerId: owner.id,
      postId,
      platform,
      body: body.body,
      charCount: body.body.length,
      revision: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return c.json({ id, revision: 0, updatedAt: now }, 201);
});
