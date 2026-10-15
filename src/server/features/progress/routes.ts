import { Hono } from "hono";
import { and, eq, isNull, sql } from "drizzle-orm";
import { progressResponseSchema } from "../../../shared/contracts/progress";
import { GATE_NAMES, gatesQualify } from "../../../shared/domain/gates";
import { countVerifiedWeeks, expectedNextWritableWeek } from "../../../shared/domain/locking";
import { createDb } from "../../db/client";
import {
  attempts,
  gaps,
  personalProjects,
  reviews,
  roadmapProjectProgress,
  settings,
  timeEntries,
  weekProgress,
} from "../../db/schema";
import type { AppEnv } from "../../env";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { curriculum } from "../../lib/curriculum";

const GATE_LABELS: Record<(typeof GATE_NAMES)[number], string> = {
  recall: "Recall",
  build: "Build",
  debug: "Debug",
  transfer: "Transfer",
};

export const progressRoutes = new Hono<AppEnv>();
progressRoutes.use("*", requireAuthMiddleware());

/** Aggregates only — no document bodies. */
progressRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);

  const weeks = await db
    .select({
      weekNumber: weekProgress.weekNumber,
      status: weekProgress.status,
      overrideActive: weekProgress.overrideActive,
      verifiedAt: weekProgress.verifiedAt,
    })
    .from(weekProgress)
    .where(eq(weekProgress.ownerId, owner.id))
    .all();

  const byStatus = {
    PLANNED: 0,
    ATTEMPTED: 0,
    DONE: 0,
    VERIFIED: 0,
  };
  for (const w of weeks) {
    const s = w.status as keyof typeof byStatus;
    if (s in byStatus) byStatus[s] += 1;
  }

  const lockWeeks = weeks.map((w) => ({
    weekNumber: w.weekNumber,
    status: w.status as "PLANNED" | "ATTEMPTED" | "DONE" | "VERIFIED",
    overrideActive: w.overrideActive,
  }));

  const verifiedCount = countVerifiedWeeks(lockWeeks);
  const currentWeek = expectedNextWritableWeek(lockWeeks);

  const openGaps = await db
    .select({ n: sql<number>`count(*)` })
    .from(gaps)
    .where(and(eq(gaps.ownerId, owner.id), isNull(gaps.resolvedAt)))
    .get();

  const dueReviews = await db
    .select({ n: sql<number>`count(*)` })
    .from(reviews)
    .where(
      and(
        eq(reviews.ownerId, owner.id),
        isNull(reviews.completedAt),
        sql`${reviews.dueAt} <= datetime('now')`,
      ),
    )
    .get();

  const completedReviews = await db
    .select({
      passed: reviews.passed,
    })
    .from(reviews)
    .where(
      and(eq(reviews.ownerId, owner.id), sql`${reviews.completedAt} IS NOT NULL`),
    )
    .all();

  const reviewsCompleted = completedReviews.length;
  const reviewRetentionPct =
    reviewsCompleted > 0
      ? Math.round(
          (completedReviews.filter((r) => r.passed).length / reviewsCompleted) *
            100,
        )
      : null;

  const projects = await db
    .select({
      status: roadmapProjectProgress.status,
      skipped: roadmapProjectProgress.skipped,
    })
    .from(roadmapProjectProgress)
    .where(eq(roadmapProjectProgress.ownerId, owner.id))
    .all();

  const projectsVerified = projects.filter(
    (p) => p.status === "VERIFIED" && !p.skipped,
  ).length;
  const projectsSkipped = projects.filter((p) => p.skipped).length;

  const personalDone = await db
    .select({ n: sql<number>`count(*)` })
    .from(personalProjects)
    .where(
      and(
        eq(personalProjects.ownerId, owner.id),
        sql`lower(${personalProjects.status}) in ('complete', 'completed')`,
        isNull(personalProjects.trashedAt),
      ),
    )
    .get();

  const hoursRow = await db
    .select({ minutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)` })
    .from(timeEntries)
    .where(eq(timeEntries.ownerId, owner.id))
    .get();

  const sett = await db
    .select({ planStartDate: settings.planStartDate })
    .from(settings)
    .where(eq(settings.ownerId, owner.id))
    .get();

  const verifiedTimeline = weeks
    .filter((w) => w.status === "VERIFIED" && w.verifiedAt)
    .map((w) => ({
      weekNumber: w.weekNumber,
      verifiedAt: w.verifiedAt!,
    }))
    .sort(
      (a, b) =>
        Date.parse(a.verifiedAt) - Date.parse(b.verifiedAt) ||
        a.weekNumber - b.weekNumber,
    );

  const verifiedWeekNumbers = verifiedTimeline.map((v) => v.weekNumber);

  // Latest attempt per verified week for gate chart.
  const attemptRows = await db
    .select({
      weekNumber: attempts.weekNumber,
      recall: attempts.recall,
      build: attempts.build,
      debug: attempts.debug,
      transfer: attempts.transfer,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(eq(attempts.ownerId, owner.id))
    .all();

  const verifiedSet = new Set(verifiedWeekNumbers);
  const byWeekAttempts = new Map<number, typeof attemptRows>();
  for (const a of attemptRows) {
    if (!verifiedSet.has(a.weekNumber)) continue;
    const list = byWeekAttempts.get(a.weekNumber) ?? [];
    list.push(a);
    byWeekAttempts.set(a.weekNumber, list);
  }

  const scoreBuckets: Record<
    (typeof GATE_NAMES)[number],
    [number, number, number, number, number]
  > = {
    recall: [0, 0, 0, 0, 0],
    build: [0, 0, 0, 0, 0],
    debug: [0, 0, 0, 0, 0],
    transfer: [0, 0, 0, 0, 0],
  };
  const gapCounts: Record<(typeof GATE_NAMES)[number], number> = {
    recall: 0,
    build: 0,
    debug: 0,
    transfer: 0,
  };
  let firstAttemptPassCount = 0;

  for (const weekNumber of verifiedWeekNumbers) {
    const list = (byWeekAttempts.get(weekNumber) ?? []).slice().sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    if (!list.length) continue;
    const first = list[0]!;
    const last = list[list.length - 1]!;
    if (
      gatesQualify({
        recall: first.recall,
        build: first.build,
        debug: first.debug,
        transfer: first.transfer,
      })
    ) {
      firstAttemptPassCount += 1;
    }
    for (const gate of GATE_NAMES) {
      const score = Math.max(0, Math.min(4, last[gate]));
      scoreBuckets[gate][score] += 1;
      for (const att of list) {
        if (att[gate] > 0 && att[gate] < 3) gapCounts[gate] += 1;
      }
    }
  }

  const payload = {
    asOf: new Date().toISOString(),
    weeksTracked: weeks.length,
    weeksTotal: 91,
    byStatus,
    verifiedCount,
    openGaps: Number(openGaps?.n ?? 0),
    reviewsDue: Number(dueReviews?.n ?? 0),
    projectsVerified,
    projectsSkipped,
    projectsComplete: projectsVerified + Number(personalDone?.n ?? 0),
    programmeComplete: verifiedCount >= 91,
    currentWeek,
    planStartDate: sett?.planStartDate ?? null,
    hoursInvested: Math.round(Number(hoursRow?.minutes ?? 0) / 60),
    plannedHours:
      (curriculum.meta as { plannedHours?: number }).plannedHours ?? 1183,
    reviewsCompleted,
    reviewRetentionPct,
    verifiedTimeline,
    verifiedWeekNumbers,
    gatePerformance: {
      gates: GATE_NAMES.map((key) => ({
        key,
        label: GATE_LABELS[key],
        scoreCounts: scoreBuckets[key],
        gapCount: gapCounts[key],
      })),
      firstAttemptPassCount,
      verifiedWeekCount: verifiedWeekNumbers.length,
    },
    weekStatuses: weeks.map((w) => ({
      weekNumber: w.weekNumber,
      status: w.status as "PLANNED" | "ATTEMPTED" | "DONE" | "VERIFIED",
    })),
  };

  return c.json(progressResponseSchema.parse(payload));
});
