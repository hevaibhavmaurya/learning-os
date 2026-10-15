import { Hono } from "hono";
import { and, eq, isNull, lte } from "drizzle-orm";
import {
  countVerifiedWeeks,
  expectedNextWritableWeek,
  evaluateWeekWriteAccess,
} from "../../../shared/domain/locking";
import { createDb } from "../../db/client";
import { gaps, reviews, settings, weekProgress } from "../../db/schema";
import type { AppEnv } from "../../env";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { loadLockingContext } from "../weeks/queries";

export const roadmapRoutes = new Hono<AppEnv>();
roadmapRoutes.use("*", requireAuthMiddleware());

roadmapRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const ctx = await loadLockingContext(c.env, owner.id);
  const currentWeek = expectedNextWritableWeek(ctx.weeks, {
    pythonCheckpointPassed: ctx.pythonCheckpointPassed,
  });
  const verifiedCount = countVerifiedWeeks(ctx.weeks);

  const sett = await db
    .select({ planStartDate: settings.planStartDate })
    .from(settings)
    .where(eq(settings.ownerId, owner.id))
    .get();

  const progressRows = await db
    .select({
      weekNumber: weekProgress.weekNumber,
      status: weekProgress.status,
      verifiedAt: weekProgress.verifiedAt,
      overrideActive: weekProgress.overrideActive,
    })
    .from(weekProgress)
    .where(eq(weekProgress.ownerId, owner.id))
    .all();
  const byWeek = new Map(progressRows.map((r) => [r.weekNumber, r]));

  const dueReviews = await db
    .select({ weekNumber: reviews.weekNumber })
    .from(reviews)
    .where(
      and(
        eq(reviews.ownerId, owner.id),
        isNull(reviews.completedAt),
        lte(reviews.dueAt, now),
      ),
    )
    .all();

  const openGaps = await db
    .select({ weekNumber: gaps.weekNumber })
    .from(gaps)
    .where(and(eq(gaps.ownerId, owner.id), isNull(gaps.resolvedAt)))
    .all();

  let plannedWeek = currentWeek;
  if (sett?.planStartDate) {
    const start = Date.parse(`${sett.planStartDate}T00:00:00.000Z`);
    if (Number.isFinite(start)) {
      plannedWeek = Math.min(
        91,
        Math.max(1, Math.floor((Date.now() - start) / (7 * 86_400_000)) + 1),
      );
    }
  }
  const diffWeeks = plannedWeek - currentWeek;
  let message =
    "You are at the start. Planned dates are a guide, not a deadline.";
  if (verifiedCount === 0 && diffWeeks <= 0) {
    message =
      "You are at the start. Planned dates are a guide, not a deadline.";
  } else if (diffWeeks <= 0) {
    message = "You are on or ahead of the planned pace.";
  } else {
    message = `The plan pencilled in Week ${plannedWeek} for this week. You are on Week ${currentWeek}, ${diffWeeks} week${diffWeeks > 1 ? "s" : ""} later than the guide. Depth over speed is the point.`;
  }

  const weeks = Array.from({ length: 91 }, (_, i) => {
    const weekNumber = i + 1;
    const row = byWeek.get(weekNumber);
    const status = (row?.status ?? "PLANNED") as
      | "PLANNED"
      | "ATTEMPTED"
      | "DONE"
      | "VERIFIED";
    const access = evaluateWeekWriteAccess({
      targetWeek: weekNumber,
      writeKind: "attempt",
      weeks: ctx.weeks,
      settings: { lockingEnabled: ctx.lockingEnabled },
      pythonCheckpointPassed: ctx.pythonCheckpointPassed,
    });
    const locked =
      status !== "VERIFIED" &&
      !access.allowed &&
      access.code === "locked";

    let plannedDate: string | null = null;
    if (sett?.planStartDate) {
      const start = Date.parse(`${sett.planStartDate}T00:00:00.000Z`);
      if (Number.isFinite(start)) {
        plannedDate = new Date(
          start + (weekNumber - 1) * 7 * 86_400_000,
        ).toISOString();
      }
    }

    return {
      weekNumber,
      status,
      locked,
      verifiedAt: row?.verifiedAt ?? null,
      plannedDate,
    };
  });

  return c.json({
    isDemo: false,
    currentWeek,
    verifiedCount,
    lockingEnabled: ctx.lockingEnabled,
    variance: {
      currentWeek,
      plannedWeek,
      diffWeeks,
      message,
    },
    weeks,
    reviewDueWeeks: [...new Set(dueReviews.map((r) => r.weekNumber))],
    gapWeeks: [...new Set(openGaps.map((g) => g.weekNumber))],
  });
});
