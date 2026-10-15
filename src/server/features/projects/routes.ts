import { Hono } from "hono";
import { and, eq, isNull } from "drizzle-orm";
import {
  personalProjectCreateSchema,
  personalProjectDetailResponseSchema,
  personalProjectUpdateSchema,
  projectDecisionCreateSchema,
  projectDetailResponseSchema,
  projectLinksUpdateSchema,
  projectListResponseSchema,
  projectLogCreateSchema,
  projectSkipSchema,
  projectVerifySchema,
  roadmapProjectIdSchema,
} from "../../../shared/contracts/projects";
import {
  evaluateProjectAcceptance,
  isOptionalProject,
} from "../../../shared/domain/projects";
import { createDb } from "../../db/client";
import {
  ideas,
  personalProjects,
  projectDecisions,
  projectLinks,
  projectLogs,
  roadmapProjectProgress,
} from "../../db/schema";
import type { AppEnv } from "../../env";
import { curriculum, getProject } from "../../lib/curriculum";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";

export const projectsRoutes = new Hono<AppEnv>();
projectsRoutes.use("*", requireAuthMiddleware());

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

async function loadProjectExtras(
  db: ReturnType<typeof createDb>,
  ownerId: string,
  ref: string,
) {
  const logs = await db
    .select({
      id: projectLogs.id,
      body: projectLogs.body,
      loggedAt: projectLogs.loggedAt,
    })
    .from(projectLogs)
    .where(
      and(eq(projectLogs.ownerId, ownerId), eq(projectLogs.projectRef, ref)),
    )
    .all();
  const decisions = await db
    .select({
      id: projectDecisions.id,
      decision: projectDecisions.decision,
      rationale: projectDecisions.rationale,
      decidedAt: projectDecisions.decidedAt,
    })
    .from(projectDecisions)
    .where(
      and(
        eq(projectDecisions.ownerId, ownerId),
        eq(projectDecisions.projectRef, ref),
      ),
    )
    .all();
  const links = await db
    .select({
      id: projectLinks.id,
      url: projectLinks.url,
      label: projectLinks.label,
    })
    .from(projectLinks)
    .where(
      and(eq(projectLinks.ownerId, ownerId), eq(projectLinks.projectRef, ref)),
    )
    .all();
  return { logs, decisions, links };
}

async function upsertLink(
  db: ReturnType<typeof createDb>,
  ownerId: string,
  projectRef: string,
  label: string,
  url: string | null | undefined,
) {
  const existing = await db
    .select()
    .from(projectLinks)
    .where(
      and(
        eq(projectLinks.ownerId, ownerId),
        eq(projectLinks.projectRef, projectRef),
        eq(projectLinks.label, label),
      ),
    )
    .get();

  if (!url?.trim()) {
    if (existing) {
      await db.delete(projectLinks).where(eq(projectLinks.id, existing.id)).run();
    }
    return;
  }

  const normalized = normalizeUrl(url);
  const now = new Date().toISOString();
  if (existing) {
    await db
      .update(projectLinks)
      .set({ url: normalized })
      .where(eq(projectLinks.id, existing.id))
      .run();
  } else {
    await db
      .insert(projectLinks)
      .values({
        id: createId("plink_"),
        ownerId,
        projectRef,
        url: normalized,
        label,
        createdAt: now,
      })
      .run();
  }
}

projectsRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const progressRows = await db
    .select()
    .from(roadmapProjectProgress)
    .where(eq(roadmapProjectProgress.ownerId, owner.id))
    .all();
  const byId = new Map(progressRows.map((p) => [p.projectId, p]));

  const roadmap = curriculum.projects.map((p) => {
    const prog = byId.get(p.id);
    return {
      projectId: roadmapProjectIdSchema.parse(p.id),
      title: p.title,
      optional: Boolean(p.optional),
      status: (prog?.status ?? "PLANNED") as
        | "PLANNED"
        | "ATTEMPTED"
        | "DONE"
        | "VERIFIED",
      learnerConfirmed: prog?.learnerConfirmed ?? false,
      skipped: prog?.skipped ?? false,
      verifiedAt: prog?.verifiedAt ?? null,
      updatedAt: prog?.updatedAt ?? prog?.createdAt ?? new Date(0).toISOString(),
    };
  });

  const personal = await db
    .select({
      id: personalProjects.id,
      title: personalProjects.title,
      summary: personalProjects.summary,
      status: personalProjects.status,
      trashedAt: personalProjects.trashedAt,
      updatedAt: personalProjects.updatedAt,
    })
    .from(personalProjects)
    .where(
      and(
        eq(personalProjects.ownerId, owner.id),
        isNull(personalProjects.trashedAt),
      ),
    )
    .all();

  return c.json(projectListResponseSchema.parse({ roadmap, personal }));
});

projectsRoutes.post("/personal", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, personalProjectCreateSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("pp_");

  await db
    .insert(personalProjects)
    .values({
      id,
      ownerId: owner.id,
      title: body.title.trim(),
      summary: body.summary?.trim() || null,
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
    await upsertLink(db, owner.id, id, "repo", body.repoUrl);
  }
  if (body.demoUrl?.trim()) {
    await upsertLink(db, owner.id, id, "demo", body.demoUrl);
  }

  if (body.fromIdeaId) {
    await db
      .update(ideas)
      .set({
        convertedProjectId: id,
        trashedAt: now,
        updatedAt: now,
      })
      .where(and(eq(ideas.id, body.fromIdeaId), eq(ideas.ownerId, owner.id)))
      .run();
  }

  return c.json({ id }, 201);
});

projectsRoutes.get("/personal/:id", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(personalProjects)
    .where(
      and(
        eq(personalProjects.id, c.req.param("id")),
        eq(personalProjects.ownerId, owner.id),
      ),
    )
    .get();
  if (!row || row.trashedAt) {
    throw new AppError("not_found", "Project not found", 404);
  }
  const extras = await loadProjectExtras(db, owner.id, row.id);
  let notesEditorState: unknown = null;
  if (row.notesEditorState) {
    try {
      notesEditorState = JSON.parse(row.notesEditorState);
    } catch {
      notesEditorState = null;
    }
  }
  return c.json(
    personalProjectDetailResponseSchema.parse({
      id: row.id,
      title: row.title,
      summary: row.summary,
      status: row.status,
      weekNumber: row.weekNumber,
      milestone: row.milestone,
      notesPlainText: row.notesPlainText,
      notesEditorState,
      notesSchemaVersion: row.notesSchemaVersion,
      revision: row.revision,
      ...extras,
      trashedAt: row.trashedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    }),
  );
});

projectsRoutes.patch("/personal/:id", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, personalProjectUpdateSchema);
  const db = createDb(c.env.DB);
  const existing = await db
    .select()
    .from(personalProjects)
    .where(
      and(
        eq(personalProjects.id, c.req.param("id")),
        eq(personalProjects.ownerId, owner.id),
      ),
    )
    .get();
  if (!existing || existing.trashedAt) {
    throw new AppError("not_found", "Project not found", 404);
  }
  if (
    body.expectedRevision != null &&
    existing.revision !== body.expectedRevision
  ) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }

  const now = new Date().toISOString();
  await db
    .update(personalProjects)
    .set({
      title: body.title ?? existing.title,
      summary: body.summary !== undefined ? body.summary : existing.summary,
      status: body.status ?? existing.status,
      weekNumber:
        body.weekNumber !== undefined
          ? body.weekNumber
          : body.weekNumbers?.[0] !== undefined
            ? body.weekNumbers[0]
            : existing.weekNumber,
      milestone:
        body.milestone !== undefined ? body.milestone : existing.milestone,
      notesPlainText: body.notesPlainText ?? existing.notesPlainText,
      notesEditorState:
        body.notesEditorState !== undefined
          ? body.notesEditorState
            ? JSON.stringify(body.notesEditorState)
            : null
          : existing.notesEditorState,
      notesSchemaVersion:
        body.notesSchemaVersion ?? existing.notesSchemaVersion,
      revision: existing.revision + 1,
      updatedAt: now,
    })
    .where(eq(personalProjects.id, existing.id))
    .run();

  if (body.repoUrl !== undefined) {
    await upsertLink(db, owner.id, existing.id, "repo", body.repoUrl);
  }
  if (body.demoUrl !== undefined) {
    await upsertLink(db, owner.id, existing.id, "demo", body.demoUrl);
  }

  return c.json({ ok: true as const, revision: existing.revision + 1 });
});

projectsRoutes.delete("/personal/:id", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  await db
    .update(personalProjects)
    .set({ trashedAt: now, updatedAt: now })
    .where(
      and(
        eq(personalProjects.id, c.req.param("id")),
        eq(personalProjects.ownerId, owner.id),
      ),
    )
    .run();
  return c.json({ ok: true as const });
});

projectsRoutes.post("/:projectRef/logs", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, projectLogCreateSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("plog_");
  await db
    .insert(projectLogs)
    .values({
      id,
      ownerId: owner.id,
      projectRef: c.req.param("projectRef"),
      body: body.body.trim(),
      loggedAt: now,
      createdAt: now,
    })
    .run();
  return c.json({ id }, 201);
});

projectsRoutes.post("/:projectRef/decisions", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, projectDecisionCreateSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const id = createId("pdec_");
  await db
    .insert(projectDecisions)
    .values({
      id,
      ownerId: owner.id,
      projectRef: c.req.param("projectRef"),
      decision: body.decision.trim(),
      rationale: body.rationale ?? null,
      decidedAt: now,
      createdAt: now,
    })
    .run();
  return c.json({ id }, 201);
});

projectsRoutes.put("/:projectRef/links", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, projectLinksUpdateSchema);
  const db = createDb(c.env.DB);
  const ref = c.req.param("projectRef");
  if (body.repoUrl !== undefined) {
    await upsertLink(db, owner.id, ref, "repo", body.repoUrl);
  }
  if (body.demoUrl !== undefined) {
    await upsertLink(db, owner.id, ref, "demo", body.demoUrl);
  }
  return c.json({ ok: true as const });
});

projectsRoutes.get("/:projectId", async (c) => {
  const owner = requireOwner(c);
  const rawId = c.req.param("projectId");

  // Personal projects use opaque ids (pp_…).
  if (!/^P\d{2}$/i.test(rawId)) {
    const db = createDb(c.env.DB);
    const row = await db
      .select()
      .from(personalProjects)
      .where(
        and(
          eq(personalProjects.id, rawId),
          eq(personalProjects.ownerId, owner.id),
        ),
      )
      .get();
    if (!row || row.trashedAt) {
      throw new AppError("not_found", "Project not found", 404);
    }
    const extras = await loadProjectExtras(db, owner.id, row.id);
    let notesEditorState: unknown = null;
    if (row.notesEditorState) {
      try {
        notesEditorState = JSON.parse(row.notesEditorState);
      } catch {
        notesEditorState = null;
      }
    }
    return c.json(
      personalProjectDetailResponseSchema.parse({
        id: row.id,
        title: row.title,
        summary: row.summary,
        status: row.status,
        weekNumber: row.weekNumber,
        milestone: row.milestone,
        notesPlainText: row.notesPlainText,
        notesEditorState,
        notesSchemaVersion: row.notesSchemaVersion,
        revision: row.revision,
        ...extras,
        trashedAt: row.trashedAt,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
      }),
    );
  }

  const projectId = roadmapProjectIdSchema.parse(rawId);
  const meta = getProject(projectId);
  if (!meta) throw new AppError("not_found", "Project not found", 404);

  const db = createDb(c.env.DB);
  let prog = await db
    .select()
    .from(roadmapProjectProgress)
    .where(
      and(
        eq(roadmapProjectProgress.ownerId, owner.id),
        eq(roadmapProjectProgress.projectId, projectId),
      ),
    )
    .get();

  if (!prog) {
    const now = new Date().toISOString();
    const id = createId("rpp_");
    await db
      .insert(roadmapProjectProgress)
      .values({
        id,
        ownerId: owner.id,
        projectId,
        status: "PLANNED",
        acceptanceEvidence: null,
        learnerConfirmed: false,
        verifiedAt: null,
        revision: 0,
        skipped: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    prog = await db
      .select()
      .from(roadmapProjectProgress)
      .where(eq(roadmapProjectProgress.id, id))
      .get();
  }
  if (!prog) throw new AppError("internal_error", "Project progress missing", 500);

  const extras = await loadProjectExtras(db, owner.id, projectId);

  return c.json(
    projectDetailResponseSchema.parse({
      projectId,
      title: meta.title,
      optional: Boolean(meta.optional),
      status: prog.status as "PLANNED" | "ATTEMPTED" | "DONE" | "VERIFIED",
      acceptanceEvidence: prog.acceptanceEvidence,
      learnerConfirmed: prog.learnerConfirmed,
      skipped: prog.skipped,
      verifiedAt: prog.verifiedAt,
      revision: prog.revision,
      purpose: meta.purpose,
      requirements: Array.isArray(meta.functionalRequirements)
        ? meta.functionalRequirements
        : meta.functionalRequirements
          ? [meta.functionalRequirements]
          : undefined,
      acceptanceChecks: Array.isArray(meta.acceptanceTests)
        ? meta.acceptanceTests
        : meta.acceptanceTests
          ? [meta.acceptanceTests]
          : undefined,
      ...extras,
    }),
  );
});

projectsRoutes.post("/:projectId/verify", async (c) => {
  const owner = requireOwner(c);
  const projectId = roadmapProjectIdSchema.parse(c.req.param("projectId"));
  const body = await parseJson(
    c,
    projectVerifySchema.omit({ projectId: true }),
  );
  const decision = evaluateProjectAcceptance({
    projectId,
    mappedWeeksVerified: false,
    acceptanceEvidence: body.acceptanceEvidence,
    learnerConfirmed: body.learnerConfirmed,
  });
  if (!decision.canVerify) {
    throw new AppError("not_eligible", decision.blockers.join("; "), 400);
  }

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(roadmapProjectProgress)
    .where(
      and(
        eq(roadmapProjectProgress.ownerId, owner.id),
        eq(roadmapProjectProgress.projectId, projectId),
      ),
    )
    .get();

  if (existing?.status === "VERIFIED") {
    return c.json({
      projectId,
      status: "VERIFIED",
      revision: existing.revision,
      verifiedAt: existing.verifiedAt,
    });
  }

  if (existing && existing.revision !== body.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }

  const nextRevision = (existing?.revision ?? 0) + 1;
  if (existing) {
    const r = await c.env.DB.prepare(
      `UPDATE roadmap_project_progress
       SET status = 'VERIFIED', acceptance_evidence = ?, learner_confirmed = 1,
           verified_at = ?, revision = ?, updated_at = ?
       WHERE owner_id = ? AND project_id = ? AND revision = ? AND status != 'VERIFIED'`,
    )
      .bind(
        body.acceptanceEvidence,
        now,
        nextRevision,
        now,
        owner.id,
        projectId,
        body.expectedRevision,
      )
      .run();
    if ((r.meta.changes ?? 0) !== 1) {
      throw new AppError("stale_revision", "Concurrent update rejected", 409);
    }
  } else {
    await db
      .insert(roadmapProjectProgress)
      .values({
        id: createId("rpp_"),
        ownerId: owner.id,
        projectId,
        status: "VERIFIED",
        acceptanceEvidence: body.acceptanceEvidence,
        learnerConfirmed: true,
        verifiedAt: now,
        revision: 1,
        skipped: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  return c.json({
    projectId,
    status: "VERIFIED",
    revision: existing ? nextRevision : 1,
    verifiedAt: now,
  });
});

projectsRoutes.post("/:projectId/skip", async (c) => {
  const owner = requireOwner(c);
  const projectId = roadmapProjectIdSchema.parse(c.req.param("projectId"));
  const body = await parseJson(c, projectSkipSchema.omit({ projectId: true }));
  if (projectId !== "P02" || !isOptionalProject(projectId)) {
    throw new AppError("cannot_skip", "Only optional P02 can be skipped", 400);
  }

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(roadmapProjectProgress)
    .where(
      and(
        eq(roadmapProjectProgress.ownerId, owner.id),
        eq(roadmapProjectProgress.projectId, projectId),
      ),
    )
    .get();

  if (existing?.skipped) {
    return c.json({ projectId, skipped: true, revision: existing.revision });
  }
  if (existing && existing.revision !== body.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }

  if (existing) {
    await db
      .update(roadmapProjectProgress)
      .set({
        skipped: true,
        revision: existing.revision + 1,
        updatedAt: now,
      })
      .where(eq(roadmapProjectProgress.id, existing.id))
      .run();
    return c.json({
      projectId,
      skipped: true,
      revision: existing.revision + 1,
    });
  }

  await db
    .insert(roadmapProjectProgress)
    .values({
      id: createId("rpp_"),
      ownerId: owner.id,
      projectId,
      status: "PLANNED",
      acceptanceEvidence: null,
      learnerConfirmed: false,
      verifiedAt: null,
      revision: 1,
      skipped: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return c.json({ projectId, skipped: true, revision: 1 });
});
