import { Hono } from "hono";
import { and, eq, isNull } from "drizzle-orm";
import { bodyLimit } from "hono/body-limit";
import { createDb } from "../../db/client";
import { mediaObjects, posts } from "../../db/schema";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "../../../shared/contracts/media";
import type { AppEnv } from "../../env";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError } from "../../middleware/errors";
import { completeUpload, removeStoredImage } from "./storage";

export const mediaRoutes = new Hono<AppEnv>();
mediaRoutes.use("*", requireAuthMiddleware());

mediaRoutes.use("/upload", bodyLimit({ maxSize: MAX_IMAGE_BYTES, onError: () => {
  throw new AppError("payload_too_large", "File exceeds 15MB limit", 413);
} }));

mediaRoutes.post("/upload", async (c) => {
  const owner = requireOwner(c);
  const contentType =
    c.req.header("content-type")?.split(";")[0]?.trim() ||
    "application/octet-stream";
  const linkedEntityType = c.req.query("entityType") ?? null;
  const linkedEntityId = c.req.query("entityId") ?? null;
  if (!(IMAGE_TYPES as readonly string[]).includes(contentType)) {
    throw new AppError("unsupported_image", "Use a JPEG, PNG, GIF, or WebP image", 415);
  }
  const db = createDb(c.env.DB);
  if (linkedEntityType !== "post" || !linkedEntityId) {
    throw new AppError("invalid_entity", "A post is required for an image upload", 400);
  }
  const post = await db.select({ id: posts.id }).from(posts).where(and(
    eq(posts.id, linkedEntityId), eq(posts.ownerId, owner.id), isNull(posts.trashedAt),
  )).get();
  if (!post) throw new AppError("not_found", "Post not found or is in trash", 404);

  const bytes = await c.req.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new AppError("empty_body", "Upload body is empty", 400);
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new AppError("payload_too_large", "File exceeds 15MB limit", 413);
  }
  const signature = new Uint8Array(bytes);
  const starts = (...prefix: number[]) => prefix.every((byte, i) => signature[i] === byte);
  const text = (start: number, end: number) => String.fromCharCode(...signature.slice(start, end));
  const valid = contentType === "image/png" ? starts(137, 80, 78, 71, 13, 10, 26, 10)
    : contentType === "image/jpeg" ? starts(255, 216, 255)
    : contentType === "image/gif" ? ["GIF87a", "GIF89a"].includes(text(0, 6))
    : text(0, 4) === "RIFF" && text(8, 12) === "WEBP";
  if (!valid) throw new AppError("invalid_image", "File contents do not match the image type", 415);

  const id = createId("med_");
  const r2Key = `owners/${owner.id}/${id}`;
  const now = new Date().toISOString();

  await db
    .insert(mediaObjects)
    .values({
      id,
      ownerId: owner.id,
      r2Key,
      contentType,
      byteSize: bytes.byteLength,
      status: "pending",
      checksum: null,
      linkedEntityType,
      linkedEntityId,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  try {
    await completeUpload({
      put: () => c.env.MEDIA.put(r2Key, bytes, {
        httpMetadata: { contentType },
        customMetadata: { ownerId: owner.id, mediaId: id },
      }),
      markReady: () => db.update(mediaObjects)
        .set({ status: "ready", updatedAt: new Date().toISOString() })
        .where(eq(mediaObjects.id, id)).run(),
      removeObject: () => c.env.MEDIA.delete(r2Key),
      markFailed: () => db.update(mediaObjects)
        .set({ status: "failed", updatedAt: new Date().toISOString() })
        .where(eq(mediaObjects.id, id)).run(),
      onCleanupError: (stage, cleanupError) => console.error("media_upload_cleanup_failed", { id, stage, cleanupError }),
    });
  } catch (err) {
    throw new AppError(
      "upload_failed",
      err instanceof Error ? err.message : "R2 upload failed",
      500,
    );
  }

  return c.json(
    {
      id,
      r2Key,
      contentType,
      byteSize: bytes.byteLength,
      status: "ready",
      url: `/api/media/${id}`,
    },
    201,
  );
});

mediaRoutes.get("/:mediaId", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(mediaObjects)
    .where(
      and(
        eq(mediaObjects.id, c.req.param("mediaId")),
        eq(mediaObjects.ownerId, owner.id),
      ),
    )
    .get();
  if (!row) throw new AppError("not_found", "Media not found", 404);
  if (row.status !== "ready") {
    throw new AppError("media_not_ready", `Media status is ${row.status}`, 409);
  }

  const obj = await c.env.MEDIA.get(row.r2Key);
  if (!obj) {
    throw new AppError("not_found", "Object missing from storage", 404);
  }

  const headers = new Headers();
  headers.set(
    "content-type",
    row.contentType ?? obj.httpMetadata?.contentType ?? "application/octet-stream",
  );
  if (row.byteSize != null) headers.set("content-length", String(row.byteSize));
  headers.set("cache-control", "private, max-age=3600");
  headers.set("x-content-type-options", "nosniff");
  return new Response(obj.body, { status: 200, headers });
});

mediaRoutes.get("/:mediaId/meta", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select({
      id: mediaObjects.id,
      r2Key: mediaObjects.r2Key,
      contentType: mediaObjects.contentType,
      byteSize: mediaObjects.byteSize,
      status: mediaObjects.status,
      linkedEntityType: mediaObjects.linkedEntityType,
      linkedEntityId: mediaObjects.linkedEntityId,
      createdAt: mediaObjects.createdAt,
      updatedAt: mediaObjects.updatedAt,
    })
    .from(mediaObjects)
    .where(
      and(
        eq(mediaObjects.id, c.req.param("mediaId")),
        eq(mediaObjects.ownerId, owner.id),
      ),
    )
    .get();
  if (!row) throw new AppError("not_found", "Media not found", 404);
  return c.json(row);
});

mediaRoutes.delete("/:mediaId", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(mediaObjects)
    .where(
      and(
        eq(mediaObjects.id, c.req.param("mediaId")),
        eq(mediaObjects.ownerId, owner.id),
      ),
    )
    .get();
  if (!row) throw new AppError("not_found", "Media not found", 404);

  try {
    const result = await removeStoredImage({
      alreadyDeleting: row.status === "orphaned",
      markDeleting: () => db.update(mediaObjects)
        .set({ status: "orphaned", updatedAt: new Date().toISOString() })
        .where(and(eq(mediaObjects.id, row.id), eq(mediaObjects.ownerId, owner.id))).run(),
      removeObject: () => c.env.MEDIA.delete(row.r2Key),
      restoreReady: () => db.update(mediaObjects)
        .set({ status: row.status, updatedAt: new Date().toISOString() })
        .where(eq(mediaObjects.id, row.id)).run(),
      removeRecord: () => db.delete(mediaObjects).where(eq(mediaObjects.id, row.id)).run(),
      onCleanupError: (stage, cleanupError) => console.error("media_delete_cleanup_failed", { id: row.id, stage, cleanupError }),
    });
    return c.json({ ok: true, ...(result.cleanupPending ? { cleanupPending: true } : {}) }, result.cleanupPending ? 202 : 200);
  } catch {
    throw new AppError("delete_failed", "Could not remove image; retry removal", 500);
  }
});
