import { Hono } from "hono";
import { and, desc, eq, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  noteDetailResponseSchema,
  noteKindSchema,
  noteListResponseSchema,
  noteUpdateSchema,
} from "../../../shared/contracts/notes";
import { createDb } from "../../db/client";
import { notes } from "../../db/schema";
import type { AppEnv } from "../../env";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";

export const notesRoutes = new Hono<AppEnv>();
notesRoutes.use("*", requireAuthMiddleware());

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const v = JSON.parse(tagsJson) as unknown;
    return Array.isArray(v) ? v.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function preview(plainText: string, max = 160): string {
  const t = plainText.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function parseEditorState(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

notesRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const limit = Math.min(Number(c.req.query("limit") ?? 25) || 25, 100);
  const cursor = c.req.query("cursor") ?? null;
  const q = c.req.query("q")?.trim();
  const tag = c.req.query("tag")?.trim();
  const filter = c.req.query("filter") ?? "all";
  const includeArchived =
    c.req.query("includeArchived") === "true" ||
    c.req.query("includeArchived") === "1" ||
    filter === "archived";
  const includeTrashed =
    c.req.query("includeTrashed") === "true" ||
    c.req.query("includeTrashed") === "1" ||
    filter === "trash";
  const weekNumber = c.req.query("weekNumber")
    ? Number(c.req.query("weekNumber"))
    : undefined;

  const db = createDb(c.env.DB);
  const conditions = [eq(notes.ownerId, owner.id)];
  if (filter === "trash") {
    conditions.push(isNotNull(notes.trashedAt));
  } else if (!includeTrashed) {
    conditions.push(isNull(notes.trashedAt));
  }
  if (filter === "archived") {
    conditions.push(isNotNull(notes.archivedAt));
  } else if (!includeArchived) {
    conditions.push(isNull(notes.archivedAt));
  }
  if (filter === "note" || filter === "resource") {
    conditions.push(eq(notes.kind, filter));
  }
  if (weekNumber) conditions.push(eq(notes.weekNumber, weekNumber));
  if (q) {
    conditions.push(
      or(
        like(notes.title, `%${q}%`),
        like(notes.plainText, `%${q}%`),
        like(notes.url, `%${q}%`),
      )!,
    );
  }
  if (tag) {
    conditions.push(like(notes.tagsJson, `%"${tag}"%`));
  }
  if (cursor) {
    conditions.push(sql`${notes.updatedAt} < ${cursor}`);
  }

  const rows = await db
    .select({
      id: notes.id,
      kind: notes.kind,
      title: notes.title,
      plainText: notes.plainText,
      url: notes.url,
      tagsJson: notes.tagsJson,
      weekNumber: notes.weekNumber,
      projectId: notes.projectId,
      revision: notes.revision,
      archivedAt: notes.archivedAt,
      trashedAt: notes.trashedAt,
      updatedAt: notes.updatedAt,
      createdAt: notes.createdAt,
    })
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.updatedAt))
    .limit(limit + 1)
    .all();

  const page = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit ? (page[page.length - 1]?.updatedAt ?? null) : null;

  return c.json(
    noteListResponseSchema.parse({
      items: page.map((r) => ({
        id: r.id,
        kind: noteKindSchema.catch("note").parse(r.kind),
        title: r.title,
        plainTextPreview: preview(r.plainText),
        url: r.url,
        tags: parseTags(r.tagsJson),
        weekNumber: r.weekNumber,
        projectId: r.projectId,
        revision: r.revision,
        archivedAt: r.archivedAt,
        trashedAt: r.trashedAt,
        updatedAt: r.updatedAt,
        createdAt: r.createdAt,
      })),
      nextCursor,
    }),
  );
});

notesRoutes.post("/", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      kind: noteKindSchema.optional(),
      title: z.string().max(500).default(""),
      plainText: z.string().max(500_000).default(""),
      editorState: z.unknown().optional(),
      url: z.string().max(2000).nullable().optional(),
      tags: z.array(z.string().max(64)).max(50).optional(),
      weekNumber: z.number().int().min(1).max(91).nullable().optional(),
      projectId: z.string().nullable().optional(),
      schemaVersion: z.number().int().positive().optional(),
      templateId: z.string().optional(),
    }),
  );
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("note_");
  const kind = body.kind ?? (body.url ? "resource" : "note");
  await db
    .insert(notes)
    .values({
      id,
      ownerId: owner.id,
      title: body.title,
      kind,
      url: body.url ?? null,
      projectId: body.projectId ?? null,
      schemaVersion: body.schemaVersion ?? 1,
      editorState:
        body.editorState !== undefined
          ? JSON.stringify(body.editorState)
          : null,
      plainText: body.plainText,
      tagsJson: body.tags ? JSON.stringify(body.tags) : null,
      weekNumber: body.weekNumber ?? null,
      revision: 0,
      archivedAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return c.json(
    {
      id,
      kind,
      title: body.title,
      revision: 0,
      updatedAt: now,
      createdAt: now,
    },
    201,
  );
});

notesRoutes.get("/:noteId", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, c.req.param("noteId")), eq(notes.ownerId, owner.id)))
    .get();
  if (!row) throw new AppError("not_found", "Note not found", 404);

  return c.json(
    noteDetailResponseSchema.parse({
      id: row.id,
      kind: noteKindSchema.catch("note").parse(row.kind),
      title: row.title,
      schemaVersion: row.schemaVersion,
      editorState: parseEditorState(row.editorState),
      plainText: row.plainText,
      url: row.url,
      tags: parseTags(row.tagsJson),
      weekNumber: row.weekNumber,
      projectId: row.projectId,
      revision: row.revision,
      archivedAt: row.archivedAt,
      trashedAt: row.trashedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    }),
  );
});

notesRoutes.patch("/:noteId", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, noteUpdateSchema);
  const db = createDb(c.env.DB);
  const noteId = c.req.param("noteId");
  const existing = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.ownerId, owner.id)))
    .get();
  if (!existing) throw new AppError("not_found", "Note not found", 404);
  if (existing.revision !== body.expectedRevision) {
    throw new AppError("stale_revision", "Note revision conflict", 409);
  }

  const now = new Date().toISOString();
  const nextRevision = existing.revision + 1;
  await db
    .update(notes)
    .set({
      title: body.title ?? existing.title,
      kind: body.kind ?? existing.kind,
      url: body.url !== undefined ? body.url : existing.url,
      projectId:
        body.projectId !== undefined ? body.projectId : existing.projectId,
      schemaVersion: body.schemaVersion ?? existing.schemaVersion,
      editorState:
        body.editorState !== undefined
          ? JSON.stringify(body.editorState)
          : existing.editorState,
      plainText: body.plainText ?? existing.plainText,
      tagsJson:
        body.tags !== undefined
          ? JSON.stringify(body.tags)
          : existing.tagsJson,
      weekNumber:
        body.weekNumber !== undefined ? body.weekNumber : existing.weekNumber,
      revision: nextRevision,
      updatedAt: now,
    })
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.ownerId, owner.id),
        eq(notes.revision, body.expectedRevision),
      ),
    )
    .run();

  return c.json({ id: noteId, revision: nextRevision, updatedAt: now });
});

notesRoutes.post("/:noteId/archive", async (c) => {
  const owner = requireOwner(c);
  const now = new Date().toISOString();
  const db = createDb(c.env.DB);
  const exists = await db
    .select({ id: notes.id })
    .from(notes)
    .where(
      and(eq(notes.id, c.req.param("noteId")), eq(notes.ownerId, owner.id)),
    )
    .get();
  if (!exists) throw new AppError("not_found", "Note not found", 404);
  await db
    .update(notes)
    .set({ archivedAt: now, updatedAt: now })
    .where(eq(notes.id, exists.id))
    .run();
  return c.json({ ok: true as const });
});

notesRoutes.post("/:noteId/unarchive", async (c) => {
  const owner = requireOwner(c);
  const now = new Date().toISOString();
  const db = createDb(c.env.DB);
  await db
    .update(notes)
    .set({ archivedAt: null, updatedAt: now })
    .where(
      and(
        eq(notes.id, c.req.param("noteId")),
        eq(notes.ownerId, owner.id),
      ),
    )
    .run();
  return c.json({ ok: true as const });
});

notesRoutes.post("/:noteId/trash", async (c) => {
  const owner = requireOwner(c);
  const now = new Date().toISOString();
  const db = createDb(c.env.DB);
  const exists = await db
    .select({ id: notes.id })
    .from(notes)
    .where(
      and(eq(notes.id, c.req.param("noteId")), eq(notes.ownerId, owner.id)),
    )
    .get();
  if (!exists) throw new AppError("not_found", "Note not found", 404);
  await db
    .update(notes)
    .set({ trashedAt: now, updatedAt: now })
    .where(eq(notes.id, exists.id))
    .run();
  return c.json({ ok: true, trashedAt: now });
});

notesRoutes.post("/:noteId/restore", async (c) => {
  const owner = requireOwner(c);
  const now = new Date().toISOString();
  const db = createDb(c.env.DB);
  await db
    .update(notes)
    .set({ trashedAt: null, updatedAt: now })
    .where(
      and(
        eq(notes.id, c.req.param("noteId")),
        eq(notes.ownerId, owner.id),
        isNotNull(notes.trashedAt),
      ),
    )
    .run();
  return c.json({ ok: true });
});

notesRoutes.delete("/:noteId", async (c) => {
  const owner = requireOwner(c);
  const forever = c.req.query("forever") === "true";
  const db = createDb(c.env.DB);
  const noteId = c.req.param("noteId");
  const row = await db
    .select({ id: notes.id, trashedAt: notes.trashedAt })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.ownerId, owner.id)))
    .get();
  if (!row) throw new AppError("not_found", "Note not found", 404);

  if (forever || row.trashedAt) {
    await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.ownerId, owner.id)))
      .run();
    return c.json({ ok: true, deleted: true });
  }

  const now = new Date().toISOString();
  await db
    .update(notes)
    .set({ trashedAt: now, updatedAt: now })
    .where(eq(notes.id, noteId))
    .run();
  return c.json({ ok: true, trashedAt: now });
});
