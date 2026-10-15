import { Hono } from "hono";
import { and, asc, eq, isNull, lte, sql } from "drizzle-orm";
import {
  countVerifiedWeeks,
  expectedNextWritableWeek,
} from "../../../shared/domain/locking";
import { createDb } from "../../db/client";
import { gaps, ideas, notes, reviews } from "../../db/schema";
import type { AppEnv } from "../../env";
import { curriculum, getWeek } from "../../lib/curriculum";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";
import { z } from "zod";
import { loadLockingContext, loadWeekDetail } from "../weeks/queries";

export const todayRoutes = new Hono<AppEnv>();
todayRoutes.use("*", requireAuthMiddleware());

function offsetWeeks(reviewOffset: number): number {
  return Math.round(reviewOffset / 7);
}

function nextStepFor(
  status: string,
  eligibilityOk: boolean,
  gapForWeek: boolean,
  beginTitle: string | null,
) {
  if (status === "DONE" && eligibilityOk) {
    return {
      label: "Review evidence and verify",
      tab: "verify" as const,
      hint: "All four gates pass and evidence is in. Verifying is your call.",
      icon: "badge-check",
    };
  }
  if (gapForWeek) {
    return {
      label: "Retry with a new unseen task",
      tab: "verify" as const,
      hint: "Target practice first, then retry on a fresh fixture.",
      icon: "rotate-ccw",
    };
  }
  if (status === "ATTEMPTED" || status === "DONE") {
    return {
      label: "Finish your evidence",
      tab: "verify" as const,
      hint: "Complete structured evidence fields before you can submit.",
      icon: "clipboard-list",
    };
  }
  return {
    label: "Continue learning",
    tab: "learn" as const,
    hint: `Start with: ${beginTitle || "the core reading"}.`,
    icon: "book-open",
  };
}

todayRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const ctx = await loadLockingContext(c.env, owner.id);
  const currentWeek = expectedNextWritableWeek(ctx.weeks, {
    pythonCheckpointPassed: ctx.pythonCheckpointPassed,
  });

  const detail = await loadWeekDetail(c.env, owner.id, currentWeek);
  const curriculumWeek = getWeek(currentWeek);
  const beginTitle =
    typeof curriculumWeek?.beginWith === "string"
      ? curriculumWeek.beginWith
      : (curriculumWeek?.beginWith as { title?: string } | null | undefined)
          ?.title ?? null;

  const verifiedCount = countVerifiedWeeks(ctx.weeks);

  const reviewsDue = await db
    .select({
      weekNumber: reviews.weekNumber,
      reviewOffset: reviews.reviewOffset,
      dueAt: reviews.dueAt,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.ownerId, owner.id),
        isNull(reviews.completedAt),
        lte(reviews.dueAt, now),
      ),
    )
    .orderBy(asc(reviews.dueAt))
    .limit(20)
    .all();

  const nextReview = await db
    .select({ dueAt: reviews.dueAt })
    .from(reviews)
    .where(
      and(
        eq(reviews.ownerId, owner.id),
        isNull(reviews.completedAt),
        sql`${reviews.dueAt} > ${now}`,
      ),
    )
    .orderBy(asc(reviews.dueAt))
    .limit(1)
    .get();

  const openGaps = await db
    .select({
      id: gaps.id,
      weekNumber: gaps.weekNumber,
      kind: gaps.kind,
      notes: gaps.notes,
      createdAt: gaps.createdAt,
    })
    .from(gaps)
    .where(and(eq(gaps.ownerId, owner.id), isNull(gaps.resolvedAt)))
    .orderBy(asc(gaps.createdAt))
    .limit(20)
    .all();

  const project =
    curriculum.projects.find(
      (p) =>
        !p.optional &&
        (p.weekStart ?? 1) <= currentWeek &&
        (p.weekEnd ?? 91) >= currentWeek,
    ) ?? curriculum.projects[0];

  let milestoneText = "See project contract";
  if (project?.milestones) {
    const raw =
      typeof project.milestones === "string"
        ? project.milestones
        : Array.isArray(project.milestones)
          ? project.milestones.join("; ")
          : String(project.milestones);
    const parts = raw
      .split(/;\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    const hit = parts.find((part) => {
      const range = part.match(/W(\d+)[–-](\d+)/i);
      if (range) {
        return (
          currentWeek >= Number(range[1]) && currentWeek <= Number(range[2])
        );
      }
      const single = part.match(/W(\d+)/i);
      return single ? Number(single[1]) === currentWeek : false;
    });
    milestoneText = hit || parts[0] || milestoneText;
  }

  const gapForCurrent = openGaps.some((g) => g.weekNumber === currentWeek);
  const nextStep = nextStepFor(
    detail.status,
    detail.eligibility.canVerify,
    gapForCurrent,
    beginTitle,
  );

  return c.json({
    isDemo: false,
    displayName: owner.displayName || "Vaibhav",
    currentWeek,
    weekStatus: detail.status,
    locked: detail.locked,
    verifiedCount,
    nextStep,
    reviewsDue: reviewsDue.map((r) => ({
      weekNumber: r.weekNumber,
      reviewOffset: r.reviewOffset as 7 | 28 | 56 | 112,
      offsetWeeks: offsetWeeks(r.reviewOffset),
      dueAt: r.dueAt,
      title: getWeek(r.weekNumber)?.title ?? `Week ${r.weekNumber}`,
    })),
    nextReviewDueAt: nextReview?.dueAt ?? null,
    openGaps: openGaps.map((g) => ({
      id: g.id,
      weekNumber: g.weekNumber,
      title: `${g.kind} gap in Week ${g.weekNumber}`,
      detail: g.notes,
      retryTask: "New unseen task on a fresh fixture",
    })),
    project: project
      ? {
          projectId: project.id,
          title: project.title,
          milestoneText,
        }
      : null,
    lockingEnabled: ctx.lockingEnabled,
  });
});

todayRoutes.post("/capture", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      text: z.string().min(1).max(8000),
      weekNumber: z.number().int().min(1).max(91).optional(),
    }),
  );
  const text = body.text.trim();
  if (!text) {
    throw new AppError("validation_error", "text required", 400);
  }

  const ctx = await loadLockingContext(c.env, owner.id);
  const weekNumber =
    body.weekNumber ??
    expectedNextWritableWeek(ctx.weeks, {
      pythonCheckpointPassed: ctx.pythonCheckpointPassed,
    });

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();

  if (/^idea:/i.test(text)) {
    const ideaText = text.replace(/^idea:\s*/i, "");
    const id = createId("idea_");
    await db
      .insert(ideas)
      .values({
        id,
        ownerId: owner.id,
        title: ideaText.slice(0, 120) || "Idea",
        body: ideaText,
        convertedProjectId: null,
        trashedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return c.json({ kind: "idea", id, text: ideaText }, 201);
  }

  const isUrl = /^https?:\/\//i.test(text);
  const id = createId("note_");
  const title = isUrl
    ? text.replace(/^https?:\/\/(www\.)?/i, "").slice(0, 60)
    : text.slice(0, 80);
  await db
    .insert(notes)
    .values({
      id,
      ownerId: owner.id,
      title,
      schemaVersion: 1,
      editorState: null,
      plainText: text,
      tagsJson: JSON.stringify(isUrl ? ["reading", "inbox"] : ["inbox"]),
      weekNumber,
      revision: 0,
      archivedAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  if (isUrl) {
    return c.json({ kind: "resource", id, title, url: text }, 201);
  }
  return c.json({ kind: "note", id, title }, 201);
});
