import { and, asc, eq, isNull } from "drizzle-orm";
import {
  evaluateVerificationEligibility,
  isBoundedCoreWeek,
} from "../../../shared/domain/eligibility";
import { gatesQualify } from "../../../shared/domain/gates";
import { systemClock } from "../../../shared/domain/clock";
import { evaluatePilotClock } from "../../../shared/domain/pilot";
import {
  evaluateWeekWriteAccess,
  expectedNextWritableWeek,
} from "../../../shared/domain/locking";
import {
  getPrerequisiteDefinition,
  type PrerequisiteId,
} from "../../../shared/domain/prerequisites";
import { createDb } from "../../db/client";
import {
  attempts,
  evidence,
  gaps,
  pilotInterruptions,
  pilotRecords,
  prerequisites,
  reviews,
  settings,
  timeEntries,
  weekProgress,
  type WeekStatus,
} from "../../db/schema";
import { getWeek } from "../../lib/curriculum";
import type { AppBindings } from "../../env";
import { AppError } from "../../middleware/errors";

function mapAttempt(row: {
  id: string;
  recall: number;
  build: number;
  debug: number;
  transfer: number;
  coreAiAuthored: boolean;
  assistanceNotes?: string | null;
  notes?: string | null;
  createdAt: string;
}) {
  return {
    id: row.id,
    recall: row.recall,
    build: row.build,
    debug: row.debug,
    transfer: row.transfer,
    assistanceLevel: null as string | null,
    assistanceNotes: row.assistanceNotes ?? null,
    coreAiAuthored: row.coreAiAuthored,
    notes: row.notes ?? null,
    passed: gatesQualify({
      recall: row.recall,
      build: row.build,
      debug: row.debug,
      transfer: row.transfer,
    }),
    createdAt: row.createdAt,
  };
}

export async function getOrCreateWeekProgress(
  env: AppBindings,
  ownerId: string,
  weekNumber: number,
) {
  const db = createDb(env.DB);
  let row = await db
    .select()
    .from(weekProgress)
    .where(
      and(
        eq(weekProgress.ownerId, ownerId),
        eq(weekProgress.weekNumber, weekNumber),
      ),
    )
    .get();

  if (!row) {
    const now = new Date().toISOString();
    const id = `wp_${ownerId.slice(-8)}_${weekNumber}`;
    await db
      .insert(weekProgress)
      .values({
        id,
        ownerId,
        weekNumber,
        status: "PLANNED",
        revision: 0,
        latestAttemptId: null,
        verifiedAt: null,
        curriculumHash: null,
        ruleVersion: null,
        overrideActive: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    row = await db
      .select()
      .from(weekProgress)
      .where(eq(weekProgress.id, id))
      .get();
  }
  if (!row) throw new AppError("internal_error", "Failed to load week", 500);
  return row;
}

export async function loadWeekDetail(
  env: AppBindings,
  ownerId: string,
  weekNumber: number,
) {
  if (weekNumber < 1 || weekNumber > 91) {
    throw new AppError("not_found", `Week ${weekNumber} not found`, 404);
  }

  const db = createDb(env.DB);
  const progress = await getOrCreateWeekProgress(env, ownerId, weekNumber);
  const curriculumWeek = getWeek(weekNumber);
  const lockCtx = await loadLockingContext(env, ownerId);
  const writeAccess = evaluateWeekWriteAccess({
    targetWeek: weekNumber,
    writeKind: "attempt",
    weeks: lockCtx.weeks,
    settings: { lockingEnabled: lockCtx.lockingEnabled },
    pythonCheckpointPassed: lockCtx.pythonCheckpointPassed,
  });
  const locked = !writeAccess.allowed && writeAccess.code === "locked";
  const expected = expectedNextWritableWeek(lockCtx.weeks, {
    pythonCheckpointPassed: lockCtx.pythonCheckpointPassed,
  });

  const attemptRows = await db
    .select({
      id: attempts.id,
      recall: attempts.recall,
      build: attempts.build,
      debug: attempts.debug,
      transfer: attempts.transfer,
      coreAiAuthored: attempts.coreAiAuthored,
      assistanceNotes: attempts.assistanceNotes,
      notes: attempts.notes,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(
      and(eq(attempts.ownerId, ownerId), eq(attempts.weekNumber, weekNumber)),
    )
    .orderBy(asc(attempts.createdAt))
    .all();

  const mappedAttempts = attemptRows.map(mapAttempt);
  const latestAttempt =
    mappedAttempts.find((a) => a.id === progress.latestAttemptId) ??
    mappedAttempts[mappedAttempts.length - 1] ??
    null;

  const evidenceRow =
    (await db
      .select()
      .from(evidence)
      .where(
        and(eq(evidence.ownerId, ownerId), eq(evidence.weekNumber, weekNumber)),
      )
      .get()) ?? null;

  let acceptanceChecks: string | null = null;
  if (evidenceRow?.extrasJson) {
    try {
      const extras = JSON.parse(evidenceRow.extrasJson) as {
        acceptanceChecks?: string;
      };
      acceptanceChecks = extras.acceptanceChecks ?? null;
    } catch {
      acceptanceChecks = null;
    }
  }

  const prereqRows = await db
    .select({
      prerequisiteId: prerequisites.prerequisiteId,
      passed: prerequisites.passed,
      confirmedAt: prerequisites.confirmedAt,
      evidenceNotes: prerequisites.evidenceNotes,
    })
    .from(prerequisites)
    .where(eq(prerequisites.ownerId, ownerId))
    .all();

  const reviewRows = await db
    .select({
      reviewOffset: reviews.reviewOffset,
      dueAt: reviews.dueAt,
      completedAt: reviews.completedAt,
      passed: reviews.passed,
    })
    .from(reviews)
    .where(
      and(eq(reviews.ownerId, ownerId), eq(reviews.weekNumber, weekNumber)),
    )
    .orderBy(asc(reviews.reviewOffset))
    .all();

  const openGapRows = await db
    .select({
      id: gaps.id,
      weekNumber: gaps.weekNumber,
      kind: gaps.kind,
      notes: gaps.notes,
      resolvedAt: gaps.resolvedAt,
    })
    .from(gaps)
    .where(
      and(
        eq(gaps.ownerId, ownerId),
        eq(gaps.weekNumber, weekNumber),
        isNull(gaps.resolvedAt),
      ),
    )
    .all();

  const timeRows = await db
    .select({ minutes: timeEntries.minutes })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.ownerId, ownerId),
        eq(timeEntries.weekNumber, weekNumber),
      ),
    )
    .all();
  const hoursLogged =
    timeRows.reduce((sum, row) => sum + row.minutes, 0) / 60;

  const sett = await db
    .select({ planStartDate: settings.planStartDate })
    .from(settings)
    .where(eq(settings.ownerId, ownerId))
    .get();
  let plannedDate: string | null = null;
  if (sett?.planStartDate) {
    const start = Date.parse(`${sett.planStartDate}T00:00:00.000Z`);
    if (Number.isFinite(start)) {
      plannedDate = new Date(
        start + (weekNumber - 1) * 7 * 86_400_000,
      ).toISOString();
    }
  }

  const nowIso = new Date().toISOString();
  const hasReviewDue = reviewRows.some(
    (r) => !r.completedAt && r.dueAt <= nowIso,
  );

  const eligibility = evaluateVerificationEligibility({
    weekNumber,
    status: progress.status as WeekStatus,
    latestAttempt: latestAttempt
      ? {
          recall: latestAttempt.recall,
          build: latestAttempt.build,
          debug: latestAttempt.debug,
          transfer: latestAttempt.transfer,
          coreAiAuthored: latestAttempt.coreAiAuthored,
        }
      : null,
    evidence: evidenceRow
      ? {
          artifactRef: evidenceRow.artifactRef,
          reproducibleSteps: evidenceRow.reproducibleSteps,
          testOutcome: evidenceRow.testOutcome as
            | "pass"
            | "fail"
            | "not_applicable"
            | null,
          testOutputs: evidenceRow.testOutputs,
          failureRootCause: evidenceRow.failureRootCause,
          transferCondition: evidenceRow.transferCondition,
          transferResult: evidenceRow.transferResult,
          explanation: evidenceRow.explanation,
          measurementContext: evidenceRow.measurementContext,
          measurementNa: evidenceRow.measurementNa,
          limitation: evidenceRow.limitation,
          helpUsed: evidenceRow.helpUsed,
          coreAiAuthored: evidenceRow.coreAiAuthored,
          externalReviewStatus: evidenceRow.externalReviewStatus,
          prerequisiteEvidence: evidenceRow.prerequisiteEvidence,
          boundedCoreEvidence: evidenceRow.boundedCoreEvidence,
          hardwareEvidence: evidenceRow.hardwareEvidence,
          submittedAt: evidenceRow.submittedAt,
        }
      : null,
    prerequisites: prereqRows.map((p) => ({
      prerequisiteId: p.prerequisiteId as PrerequisiteId,
      passed: p.passed,
      confirmedAt: p.confirmedAt,
      evidenceNotes: p.evidenceNotes,
    })),
    minimumToPass: curriculumWeek?.minimumToPass ?? null,
    learnerConfirmed: false,
    revision: progress.revision,
    expectedRevision: progress.revision,
    overrideActive: progress.overrideActive,
    allowsModeledHardwareEvidence: weekNumber === 83 || weekNumber === 84,
  });

  const pilotRecord = weekNumber >= 43 && weekNumber <= 46
    ? await db.select().from(pilotRecords).where(eq(pilotRecords.ownerId, ownerId)).get()
    : null;
  const pilotPauses = pilotRecord
    ? await db.select({ startedAt: pilotInterruptions.startedAt, endedAt: pilotInterruptions.endedAt })
      .from(pilotInterruptions).where(eq(pilotInterruptions.pilotId, pilotRecord.id)).all()
    : [];
  const pilotClock = pilotRecord?.activatedAt
    ? evaluatePilotClock({
      activatedAt: pilotRecord.activatedAt,
      clockDays: pilotRecord.clockDays,
      interruptions: pilotPauses,
      hasCompletionRecords: Boolean(pilotRecord.observations),
      learnerConfirmedComplete: Boolean(pilotRecord.completedAt),
    }, systemClock())
    : null;

  return {
    weekNumber,
    status: progress.status as WeekStatus,
    asOf: nowIso,
    locked,
    expectedWritableWeek: expected,
    lockReason: locked
      ? `Week ${weekNumber} is locked; expected writable week is ${expected}`
      : null,
    revision: progress.revision,
    startedAt: attemptRows[0]?.createdAt ?? null,
    submittedAt: evidenceRow?.submittedAt ?? null,
    verifiedAt: progress.verifiedAt,
    plannedDate,
    hoursLogged,
    overrideActive: progress.overrideActive,
    hasReviewDue,
    attempts: mappedAttempts,
    latestAttempt,
    evidence: evidenceRow
      ? {
          id: evidenceRow.id,
          revision: evidenceRow.revision,
          submittedAt: evidenceRow.submittedAt,
          artifactRef: evidenceRow.artifactRef,
          reproducibleSteps: evidenceRow.reproducibleSteps,
          testOutcome: evidenceRow.testOutcome as
            | "pass"
            | "fail"
            | "not_applicable"
            | null,
          testOutputs: evidenceRow.testOutputs,
          failureRootCause: evidenceRow.failureRootCause,
          transferCondition: evidenceRow.transferCondition,
          transferResult: evidenceRow.transferResult,
          explanation: evidenceRow.explanation,
          measurementContext: evidenceRow.measurementContext,
          measurementNa: evidenceRow.measurementNa,
          limitation: evidenceRow.limitation,
          helpUsed: evidenceRow.helpUsed,
          coreAiAuthored: evidenceRow.coreAiAuthored,
          externalReviewStatus: evidenceRow.externalReviewStatus,
          prerequisiteEvidence: evidenceRow.prerequisiteEvidence,
          boundedCoreEvidence: evidenceRow.boundedCoreEvidence,
          hardwareEvidence: evidenceRow.hardwareEvidence,
          extrasJson: evidenceRow.extrasJson,
          acceptanceChecks,
        }
      : null,
    openGaps: openGapRows.map((g) => ({
      id: g.id,
      title: `${g.kind} gap in Week ${weekNumber}`,
      detail: g.notes,
      retryTask: "New unseen task on a fresh fixture",
      source: g.kind,
    })),
    prerequisites: prereqRows.map((p) => {
      const id = p.prerequisiteId as PrerequisiteId;
      let label = p.prerequisiteId;
      try {
        label = getPrerequisiteDefinition(id).label;
      } catch {
        /* unknown id */
      }
      return {
        id: p.prerequisiteId,
        label,
        satisfied: p.passed,
      };
    }),
    eligibility: {
      canSubmitEvidence: eligibility.canSubmitEvidence,
      canVerify: eligibility.canVerify,
      issues: eligibility.issues.map((i) => ({
        code: i.code,
        message: i.message,
        field: i.field,
      })),
    },
    reviews: reviewRows.map((r) => ({
      reviewOffset: r.reviewOffset,
      offsetWeeks: Math.round(r.reviewOffset / 7),
      dueAt: r.dueAt,
      completedAt: r.completedAt,
      passed: r.passed,
    })),
    minimumToPass: curriculumWeek?.minimumToPass ?? null,
    isBoundedCore: isBoundedCoreWeek(weekNumber),
    pilot: pilotRecord ? {
      activatedAt: pilotRecord.activatedAt,
      simulated: pilotRecord.mode === "SIMULATED",
      consentDocumented: pilotRecord.consentDocumented,
      interruptionCount: pilotPauses.length,
      dayIndex: pilotClock ? Math.min(28, Math.max(1, pilotClock.elapsedDays + 1)) : 0,
    } : null,
  };
}

export async function listGaps(
  env: AppBindings,
  ownerId: string,
  weekNumber?: number,
) {
  const db = createDb(env.DB);
  const rows = weekNumber
    ? await db
        .select({
          id: gaps.id,
          weekNumber: gaps.weekNumber,
          kind: gaps.kind,
          resolvedAt: gaps.resolvedAt,
          notes: gaps.notes,
          createdAt: gaps.createdAt,
        })
        .from(gaps)
        .where(
          and(eq(gaps.ownerId, ownerId), eq(gaps.weekNumber, weekNumber)),
        )
        .all()
    : await db
        .select({
          id: gaps.id,
          weekNumber: gaps.weekNumber,
          kind: gaps.kind,
          resolvedAt: gaps.resolvedAt,
          notes: gaps.notes,
          createdAt: gaps.createdAt,
        })
        .from(gaps)
        .where(and(eq(gaps.ownerId, ownerId), isNull(gaps.resolvedAt)))
        .all();
  return rows;
}

export async function listTimeEntries(
  env: AppBindings,
  ownerId: string,
  weekNumber: number,
) {
  const db = createDb(env.DB);
  return db
    .select({
      id: timeEntries.id,
      minutes: timeEntries.minutes,
      note: timeEntries.note,
      occurredOn: timeEntries.occurredOn,
      createdAt: timeEntries.createdAt,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.ownerId, ownerId),
        eq(timeEntries.weekNumber, weekNumber),
      ),
    )
    .orderBy(asc(timeEntries.occurredOn))
    .all();
}

export async function loadLockingContext(env: AppBindings, ownerId: string) {
  const db = createDb(env.DB);
  const sett = await db
    .select()
    .from(settings)
    .where(eq(settings.ownerId, ownerId))
    .get();
  const weeks = await db
    .select({
      weekNumber: weekProgress.weekNumber,
      status: weekProgress.status,
      overrideActive: weekProgress.overrideActive,
    })
    .from(weekProgress)
    .where(eq(weekProgress.ownerId, ownerId))
    .all();
  const prereqs = await db
    .select({
      prerequisiteId: prerequisites.prerequisiteId,
      passed: prerequisites.passed,
    })
    .from(prerequisites)
    .where(eq(prerequisites.ownerId, ownerId))
    .all();
  return {
    lockingEnabled: sett?.lockingEnabled ?? true,
    weeks: weeks.map((w) => ({
      weekNumber: w.weekNumber,
      status: w.status as WeekStatus,
      overrideActive: w.overrideActive,
    })),
    pythonCheckpointPassed:
      prereqs.find((p) => p.prerequisiteId === "python_w24")?.passed === true,
  };
}
