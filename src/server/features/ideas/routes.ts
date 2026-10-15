import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  ideaCreateSchema,
  ideaListResponseSchema,
  ideaSchema,
  personalProjectCreateSchema,
} from "../../../shared/contracts/projects";
import { createDb } from "../../db/client";
import { ideas, personalProjects, projectLinks } from "../../db/schema";
import type { AppEnv } from "../../env";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";

export const ideasRoutes = new Hono<AppEnv>();
ideasRoutes.use("*", requireAuthMiddleware());

ideasRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const rows = await db
    .select()
    .from(ideas)
    .where(and(eq(ideas.ownerId, owner.id), isNull(ideas.trashedAt)))
    .orderBy(desc(ideas.updatedAt))
    .all();

  return c.json(
    ideaListResponseSchema.parse({
      items: rows.map((r) =>
        ideaSchema.parse({
          id: r.id,
          text: r.title,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
      ),
    }),
  );
});

ideasRoutes.post("/", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, ideaCreateSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("idea_");
  await db
    .insert(ideas)
    .values({
      id,
      ownerId: owner.id,
      title: body.text.trim(),
      body: "",
      convertedProjectId: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return c.json(
    ideaSchema.parse({
      id,
      text: body.text.trim(),
      createdAt: now,
      updatedAt: now,
    }),
    201,
  );
});

ideasRoutes.delete("/:ideaId", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  await db
    .update(ideas)
    .set({ trashedAt: now, updatedAt: now })
    .where(
      and(eq(ideas.id, c.req.param("ideaId")), eq(ideas.ownerId, owner.id)),
    )
    .run();
  return c.json({ ok: true as const });
});

ideasRoutes.post("/:ideaId/convert", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, personalProjectCreateSchema);
  const db = createDb(c.env.DB);
  const idea = await db
    .select()
    .from(ideas)
    .where(
      and(eq(ideas.id, c.req.param("ideaId")), eq(ideas.ownerId, owner.id)),
    )
    .get();
  if (!idea || idea.trashedAt) {
    throw new AppError("not_found", "Idea not found", 404);
  }

  const now = new Date().toISOString();
  const id = createId("pp_");
  await db
    .insert(personalProjects)
    .values({
      id,
      ownerId: owner.id,
      title: body.title.trim(),
      summary: body.summary?.trim() || idea.body || null,
      status: "Active",
      weekNumber: body.weekNumber ?? null,
      milestone: null,
      notesPlainText: body.notesPlainText ?? "",
      notesEditorState: body.notesEditorState
        ? JSON.stringify(body.notesEditorState)
        : null,
      notesSchemaVersion: 1,
      revision: 0,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  if (body.repoUrl?.trim()) {
    await db
      .insert(projectLinks)
      .values({
        id: createId("plink_"),
        ownerId: owner.id,
        projectRef: id,
        url: normalizeUrl(body.repoUrl),
        label: "repo",
        createdAt: now,
      })
      .run();
  }

  await db
    .update(ideas)
    .set({ convertedProjectId: id, trashedAt: now, updatedAt: now })
    .where(eq(ideas.id, idea.id))
    .run();

  return c.json({ id }, 201);
});

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
