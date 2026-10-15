import { and, eq } from "drizzle-orm";
import {
  attemptCreateResponseSchema,
  evidenceResponseSchema,
  reviewCompleteResponseSchema,
  verifyResponseSchema,
  type AttemptCreate,
  type EvidenceSubmit,
  type EvidenceUpsert,
  type ReviewComplete,
  type VerifyRequest,
} from "../../../shared/contracts/weeks";
import {
  canRecordCompletedAttempt,
  evaluateVerificationEligibility,
} from "../../../shared/domain/eligibility";
import {
  buildOutOfOrderAudit,
  evaluateWeekWriteAccess,
  expectedNextWritableWeek,
} from "../../../shared/domain/locking";
import { planReviewsFromVerification, retentionReviewEffect } from "../../../shared/domain/reviews";
import { systemClock } from "../../../shared/domain/clock";
import type { PrerequisiteId } from "../../../shared/domain/prerequisites";
import { createDb } from "../../db/client";
import {
  auditEvents,
  evidence,
  gaps,
  prerequisites,
  reviews,
  timeEntries,
  type WeekStatus,
} from "../../db/schema";
import { RULE_VERSION, type AppBindings } from "../../env";
import { curriculumHash, getWeek } from "../../lib/curriculum";
import { createId, createOperationId } from "../../lib/ids";
import { AppError } from "../../middleware/errors";
import {
  getOrCreateWeekProgress,
  loadLockingContext,
  loadWeekDetail,
} from "./queries";

async function assertWeekWrite(
  env: AppBindings,
  ownerId: string,
  weekNumber: number,
  writeKind:
    | "attempt"
    | "evidence"
    | "submit_evidence"
    | "verify"
    | "time_entry"
    | "note"
    | "other",
) {
  const ctx = await loadLockingContext(env, ownerId);
  const decision = evaluateWeekWriteAccess({
    targetWeek: weekNumber,
    writeKind,
    weeks: ctx.weeks,
    settings: { lockingEnabled: ctx.lockingEnabled },
    pythonCheckpointPassed: ctx.pythonCheckpointPassed,
  });
  if (!decision.allowed) {
    throw new AppError(
      decision.code ?? "locked",
      decision.reason ?? `Week ${weekNumber} is locked`,
      decision.code === "verified_immutable" ? 409 : 403,
    );
  }
  if (decision.requiresOutOfOrderAudit) {
    const clock = systemClock();
    const expected = expectedNextWritableWeek(ctx.weeks, {
      pythonCheckpointPassed: ctx.pythonCheckpointPassed,
    });
    const audit = buildOutOfOrderAudit({
      weekNumber,
      writeKind,
      expectedNextWeek: expected,
      clock,
    });
    const db = createDb(env.DB);
    await db
      .insert(auditEvents)
      .values({
        id: createId("aud_"),
        ownerId,
        action: audit.action,
        entityType: "week",
        entityId: String(weekNumber),
        weekNumber,
        operationId: null,
        detailJson: JSON.stringify(audit.detail),
        createdAt: audit.createdAt,
      })
      .run();
  }
}

export async function recordAttempt(
  env: AppBindings,
  ownerId: string,
  input: AttemptCreate,
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "attempt");

  if (!canRecordCompletedAttempt(input)) {
    throw new AppError(
      "gates_invalid",
      "All gates must be assessed (1–4) and each ≥3 to record a completed attempt",
      400,
    );
  }

  const progress = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);
  if (progress.revision !== input.expectedRevision) {
    throw new AppError(
      "stale_revision",
      `Stale revision: got ${progress.revision}, expected ${input.expectedRevision}`,
      409,
    );
  }
  if (progress.status === "VERIFIED") {
    throw new AppError("verified_immutable", "Week is VERIFIED", 409);
  }

  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const attemptId = createId("att_");
  const nextRevision = progress.revision + 1;
  const nextStatus: WeekStatus =
    progress.status === "PLANNED" ? "ATTEMPTED" : (progress.status as WeekStatus);

  const batch = await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO attempts (
        id, owner_id, week_number, recall, build, debug, transfer,
        assistance_notes, core_ai_authored, externally_reviewed, review_label, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      attemptId,
      ownerId,
      input.weekNumber,
      input.recall,
      input.build,
      input.debug,
      input.transfer,
      input.assistanceNotes ?? null,
      input.coreAiAuthored ? 1 : 0,
      input.externallyReviewed ? 1 : 0,
      input.reviewLabel ?? null,
      input.notes ?? null,
      now,
    ),
    env.DB.prepare(
      `UPDATE week_progress
       SET status = ?, revision = ?, latest_attempt_id = ?, updated_at = ?
       WHERE owner_id = ? AND week_number = ? AND revision = ? AND status != 'VERIFIED'`,
    ).bind(
      nextStatus,
      nextRevision,
      attemptId,
      now,
      ownerId,
      input.weekNumber,
      input.expectedRevision,
    ),
  ]);

  const upd = batch[1]?.meta as { changes?: number } | undefined;
  if ((upd?.changes ?? 0) !== 1) {
    throw new AppError("stale_revision", "Concurrent update rejected", 409);
  }

  // Assessment gap when gates would fail independence etc. — scored attempts that don't qualify create gaps.
  if (input.coreAiAuthored || input.recall < 3 || input.build < 3) {
    // completed attempts already require ≥3; AI-authored still records gap for independence.
    if (input.coreAiAuthored) {
      await db
        .insert(gaps)
        .values({
          id: createId("gap_"),
          ownerId,
          weekNumber: input.weekNumber,
          kind: "assessment",
          reviewId: null,
          attemptId,
          resolvedAt: null,
          notes: "Core AI-authored attempt cannot support independent Build ≥3",
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
  }

  return attemptCreateResponseSchema.parse({
    attemptId,
    weekNumber: input.weekNumber,
    status: nextStatus,
    revision: nextRevision,
  });
}

export async function upsertEvidence(
  env: AppBindings,
  ownerId: string,
  input: EvidenceUpsert,
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "evidence");
  const progress = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);
  if (progress.revision !== input.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }
  if (progress.status === "VERIFIED") {
    throw new AppError("verified_immutable", "Week is VERIFIED", 409);
  }

  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.ownerId, ownerId),
        eq(evidence.weekNumber, input.weekNumber),
      ),
    )
    .get();

  const nextRevision = progress.revision + 1;
  const id = existing?.id ?? createId("ev_");

  if (existing) {
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE evidence SET
          revision = revision + 1,
          artifact_ref = COALESCE(?, artifact_ref),
          reproducible_steps = COALESCE(?, reproducible_steps),
          test_outcome = COALESCE(?, test_outcome),
          test_outputs = COALESCE(?, test_outputs),
          failure_root_cause = COALESCE(?, failure_root_cause),
          transfer_condition = COALESCE(?, transfer_condition),
          transfer_result = COALESCE(?, transfer_result),
          explanation = COALESCE(?, explanation),
          measurement_context = COALESCE(?, measurement_context),
          measurement_na = COALESCE(?, measurement_na),
          limitation = COALESCE(?, limitation),
          help_used = COALESCE(?, help_used),
          core_ai_authored = COALESCE(?, core_ai_authored),
          external_review_status = COALESCE(?, external_review_status),
          prerequisite_evidence = COALESCE(?, prerequisite_evidence),
          bounded_core_evidence = COALESCE(?, bounded_core_evidence),
          hardware_evidence = COALESCE(?, hardware_evidence),
          extras_json = COALESCE(?, extras_json),
          attempt_id = COALESCE(?, attempt_id),
          updated_at = ?
        WHERE id = ? AND owner_id = ?`,
      ).bind(
        input.artifactRef ?? null,
        input.reproducibleSteps ?? null,
        input.testOutcome ?? null,
        input.testOutputs ?? null,
        input.failureRootCause ?? null,
        input.transferCondition ?? null,
        input.transferResult ?? null,
        input.explanation ?? null,
        input.measurementContext ?? null,
        input.measurementNa === undefined ? null : input.measurementNa ? 1 : 0,
        input.limitation ?? null,
        input.helpUsed ?? null,
        input.coreAiAuthored === undefined ? null : input.coreAiAuthored ? 1 : 0,
        input.externalReviewStatus ?? null,
        input.prerequisiteEvidence ?? null,
        input.boundedCoreEvidence ?? null,
        input.hardwareEvidence ?? null,
        input.extrasJson ?? null,
        progress.latestAttemptId,
        now,
        id,
        ownerId,
      ),
      env.DB.prepare(
        `UPDATE week_progress SET revision = ?, updated_at = ?
         WHERE owner_id = ? AND week_number = ? AND revision = ? AND status != 'VERIFIED'`,
      ).bind(nextRevision, now, ownerId, input.weekNumber, input.expectedRevision),
    ]);
  } else {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO evidence (
          id, owner_id, week_number, attempt_id, revision, submitted_at,
          artifact_ref, reproducible_steps, test_outcome, test_outputs,
          failure_root_cause, transfer_condition, transfer_result, explanation,
          measurement_context, measurement_na, limitation, help_used,
          core_ai_authored, external_review_status, prerequisite_evidence,
          bounded_core_evidence, hardware_evidence, extras_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id,
        ownerId,
        input.weekNumber,
        progress.latestAttemptId,
        input.artifactRef ?? null,
        input.reproducibleSteps ?? null,
        input.testOutcome ?? null,
        input.testOutputs ?? null,
        input.failureRootCause ?? null,
        input.transferCondition ?? null,
        input.transferResult ?? null,
        input.explanation ?? null,
        input.measurementContext ?? null,
        input.measurementNa ? 1 : 0,
        input.limitation ?? null,
        input.helpUsed ?? null,
        input.coreAiAuthored ? 1 : 0,
        input.externalReviewStatus ?? null,
        input.prerequisiteEvidence ?? null,
        input.boundedCoreEvidence ?? null,
        input.hardwareEvidence ?? null,
        input.extrasJson ?? null,
        now,
        now,
      ),
      env.DB.prepare(
        `UPDATE week_progress SET revision = ?, updated_at = ?
         WHERE owner_id = ? AND week_number = ? AND revision = ? AND status != 'VERIFIED'`,
      ).bind(nextRevision, now, ownerId, input.weekNumber, input.expectedRevision),
    ]);
  }

  const updated = await db
    .select()
    .from(evidence)
    .where(eq(evidence.id, id))
    .get();
  const wp = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);

  return evidenceResponseSchema.parse({
    id,
    weekNumber: input.weekNumber,
    revision: wp.revision,
    submittedAt: updated?.submittedAt ?? null,
    status: wp.status,
  });
}

export async function submitEvidence(
  env: AppBindings,
  ownerId: string,
  input: EvidenceSubmit,
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "submit_evidence");
  const detail = await loadWeekDetail(env, ownerId, input.weekNumber);
  if (detail.revision !== input.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }
  if (!detail.eligibility.canSubmitEvidence) {
    throw new AppError(
      "cannot_submit_evidence",
      detail.eligibility.issues[0]?.message ?? "Cannot submit evidence",
      400,
    );
  }
  if (!detail.evidence) {
    throw new AppError("evidence_incomplete", "Evidence draft required", 400);
  }

  const now = new Date().toISOString();
  const nextRevision = detail.revision + 1;

  const batch = await env.DB.batch([
    env.DB.prepare(
      `UPDATE evidence SET submitted_at = ?, updated_at = ?
       WHERE owner_id = ? AND week_number = ? AND submitted_at IS NULL`,
    ).bind(now, now, ownerId, input.weekNumber),
    env.DB.prepare(
      `UPDATE week_progress
       SET status = 'DONE', revision = ?, updated_at = ?
       WHERE owner_id = ? AND week_number = ? AND revision = ? AND status IN ('ATTEMPTED', 'DONE', 'PLANNED')`,
    ).bind(nextRevision, now, ownerId, input.weekNumber, input.expectedRevision),
  ]);

  const upd = batch[1]?.meta as { changes?: number } | undefined;
  if ((upd?.changes ?? 0) !== 1) {
    throw new AppError("stale_revision", "Concurrent update rejected", 409);
  }

  return evidenceResponseSchema.parse({
    id: detail.evidence.id,
    weekNumber: input.weekNumber,
    revision: nextRevision,
    submittedAt: now,
    status: "DONE",
  });
}

/** Reopen DONE evidence for editing → ATTEMPTED. Never touches VERIFIED. */
export async function reopenEvidence(
  env: AppBindings,
  ownerId: string,
  input: EvidenceSubmit,
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "evidence");
  const detail = await loadWeekDetail(env, ownerId, input.weekNumber);
  if (detail.revision !== input.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }
  if (detail.status === "VERIFIED") {
    throw new AppError(
      "verified_immutable",
      "Verified weeks cannot reopen evidence",
      409,
    );
  }
  if (detail.status !== "DONE" || !detail.evidence) {
    throw new AppError(
      "invalid_state",
      "Only submitted (DONE) evidence can be reopened",
      400,
    );
  }

  const now = new Date().toISOString();
  const nextRevision = detail.revision + 1;
  const batch = await env.DB.batch([
    env.DB.prepare(
      `UPDATE evidence SET submitted_at = NULL, updated_at = ?
       WHERE owner_id = ? AND week_number = ?`,
    ).bind(now, ownerId, input.weekNumber),
    env.DB.prepare(
      `UPDATE week_progress
       SET status = 'ATTEMPTED', revision = ?, updated_at = ?
       WHERE owner_id = ? AND week_number = ? AND revision = ? AND status = 'DONE'`,
    ).bind(nextRevision, now, ownerId, input.weekNumber, input.expectedRevision),
  ]);
  const upd = batch[1]?.meta as { changes?: number } | undefined;
  if ((upd?.changes ?? 0) !== 1) {
    throw new AppError("stale_revision", "Concurrent update rejected", 409);
  }

  return evidenceResponseSchema.parse({
    id: detail.evidence.id,
    weekNumber: input.weekNumber,
    revision: nextRevision,
    submittedAt: null,
    status: "ATTEMPTED",
  });
}

/**
 * Atomic verification: conditional DONE→VERIFIED, exactly 4 reviews, one audit.
 * Guarded SQL so concurrent requests cannot duplicate side effects.
 */
export async function verifyWeek(
  env: AppBindings,
  ownerId: string,
  input: VerifyRequest,
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "verify");

  const db = createDb(env.DB);
  const progress = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);

  // Idempotent: already verified at this or later revision with reviews present.
  if (progress.status === "VERIFIED") {
    const existingReviews = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.ownerId, ownerId),
          eq(reviews.weekNumber, input.weekNumber),
        ),
      )
      .all();
    if (existingReviews.length === 4 && progress.verifiedAt) {
      const audit = await db
        .select({ operationId: auditEvents.operationId })
        .from(auditEvents)
        .where(
          and(
            eq(auditEvents.ownerId, ownerId),
            eq(auditEvents.action, "week_verified"),
            eq(auditEvents.weekNumber, input.weekNumber),
          ),
        )
        .get();
      return verifyResponseSchema.parse({
        weekNumber: input.weekNumber,
        status: "VERIFIED",
        revision: progress.revision,
        verifiedAt: progress.verifiedAt,
        operationId: audit?.operationId ?? "idempotent",
        reviewsCreated: 4,
      });
    }
  }

  if (progress.revision !== input.expectedRevision) {
    throw new AppError("stale_revision", "Stale revision", 409);
  }

  const detail = await loadWeekDetail(env, ownerId, input.weekNumber);
  const prereqRows = await db
    .select()
    .from(prerequisites)
    .where(eq(prerequisites.ownerId, ownerId))
    .all();

  const evidenceFull = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.ownerId, ownerId),
        eq(evidence.weekNumber, input.weekNumber),
      ),
    )
    .get();

  const curriculumWeek = getWeek(input.weekNumber);
  const eligibility = evaluateVerificationEligibility({
    weekNumber: input.weekNumber,
    status: progress.status as WeekStatus,
    latestAttempt: detail.latestAttempt
      ? {
          recall: detail.latestAttempt.recall,
          build: detail.latestAttempt.build,
          debug: detail.latestAttempt.debug,
          transfer: detail.latestAttempt.transfer,
          coreAiAuthored: detail.latestAttempt.coreAiAuthored,
        }
      : null,
    evidence: evidenceFull
      ? {
          artifactRef: evidenceFull.artifactRef,
          reproducibleSteps: evidenceFull.reproducibleSteps,
          testOutcome: evidenceFull.testOutcome as
            | "pass"
            | "fail"
            | "not_applicable"
            | null,
          testOutputs: evidenceFull.testOutputs,
          failureRootCause: evidenceFull.failureRootCause,
          transferCondition: evidenceFull.transferCondition,
          transferResult: evidenceFull.transferResult,
          explanation: evidenceFull.explanation,
          measurementContext: evidenceFull.measurementContext,
          measurementNa: evidenceFull.measurementNa,
          limitation: evidenceFull.limitation,
          helpUsed: evidenceFull.helpUsed,
          coreAiAuthored: evidenceFull.coreAiAuthored,
          externalReviewStatus: evidenceFull.externalReviewStatus,
          prerequisiteEvidence: evidenceFull.prerequisiteEvidence,
          boundedCoreEvidence: evidenceFull.boundedCoreEvidence,
          hardwareEvidence: evidenceFull.hardwareEvidence,
          submittedAt: evidenceFull.submittedAt,
        }
      : null,
    prerequisites: prereqRows.map((p) => ({
      prerequisiteId: p.prerequisiteId as PrerequisiteId,
      passed: p.passed,
      confirmedAt: p.confirmedAt,
      evidenceNotes: p.evidenceNotes,
    })),
    minimumToPass: curriculumWeek?.minimumToPass ?? null,
    learnerConfirmed: input.learnerConfirmed,
    revision: progress.revision,
    expectedRevision: input.expectedRevision,
    overrideActive: progress.overrideActive,
    allowsModeledHardwareEvidence:
      input.weekNumber === 83 || input.weekNumber === 84,
  });

  if (!eligibility.eligible) {
    throw new AppError(
      eligibility.issues[0]?.code ?? "not_eligible",
      eligibility.issues.map((i) => i.message).join("; ") || "Not eligible",
      400,
    );
  }

  const operationId = createOperationId();
  const verifiedAt = new Date().toISOString();
  const nextRevision = progress.revision + 1;
  const plan = planReviewsFromVerification(verifiedAt);
  const hash = curriculumHash();

  const reviewIds = plan.reviews.map(() => createId("rev_"));
  const auditId = createId("aud_");

  // Guarded: dependent inserts only run when the status transition succeeded.
  const statements = [
    env.DB.prepare(
      `UPDATE week_progress
       SET status = 'VERIFIED', revision = ?, verified_at = ?, updated_at = ?,
           curriculum_hash = ?, rule_version = ?
       WHERE owner_id = ? AND week_number = ? AND status = 'DONE' AND revision = ? AND override_active = 0`,
    ).bind(
      nextRevision,
      verifiedAt,
      verifiedAt,
      hash,
      RULE_VERSION,
      ownerId,
      input.weekNumber,
      input.expectedRevision,
    ),
  ];

  for (let i = 0; i < plan.reviews.length; i++) {
    const item = plan.reviews[i]!;
    const rid = reviewIds[i]!;
    statements.push(
      env.DB.prepare(
        `INSERT INTO reviews (
          id, owner_id, week_number, review_offset, due_at, completed_at, passed, notes,
          verification_operation_id, created_at, updated_at
        )
        SELECT ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?
        WHERE EXISTS (
          SELECT 1 FROM week_progress
          WHERE owner_id = ? AND week_number = ? AND status = 'VERIFIED'
            AND revision = ? AND verified_at = ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM reviews
          WHERE owner_id = ? AND week_number = ? AND review_offset = ?
        )`,
      ).bind(
        rid,
        ownerId,
        input.weekNumber,
        item.reviewOffset,
        item.dueAt,
        operationId,
        verifiedAt,
        verifiedAt,
        ownerId,
        input.weekNumber,
        nextRevision,
        verifiedAt,
        ownerId,
        input.weekNumber,
        item.reviewOffset,
      ),
    );
  }

  statements.push(
    env.DB.prepare(
      `INSERT INTO audit_events (
        id, owner_id, action, entity_type, entity_id, week_number, operation_id, detail_json, created_at
      )
      SELECT ?, ?, 'week_verified', 'week', ?, ?, ?, ?, ?
      WHERE EXISTS (
        SELECT 1 FROM week_progress
        WHERE owner_id = ? AND week_number = ? AND status = 'VERIFIED'
          AND revision = ? AND verified_at = ?
      )
      AND NOT EXISTS (
        SELECT 1 FROM audit_events
        WHERE owner_id = ? AND action = 'week_verified' AND week_number = ?
          AND operation_id = ?
      )`,
    ).bind(
      auditId,
      ownerId,
      String(input.weekNumber),
      input.weekNumber,
      operationId,
      JSON.stringify({ reviews: 4, revision: nextRevision }),
      verifiedAt,
      ownerId,
      input.weekNumber,
      nextRevision,
      verifiedAt,
      ownerId,
      input.weekNumber,
      operationId,
    ),
  );

  const batch = await env.DB.batch(statements);
  const transition = batch[0]?.meta as { changes?: number } | undefined;

  if ((transition?.changes ?? 0) !== 1) {
    // Re-check idempotent success from a winner.
    const again = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);
    if (again.status === "VERIFIED" && again.verifiedAt) {
      const reviewCount = await db
        .select({ id: reviews.id })
        .from(reviews)
        .where(
          and(
            eq(reviews.ownerId, ownerId),
            eq(reviews.weekNumber, input.weekNumber),
          ),
        )
        .all();
      if (reviewCount.length === 4) {
        const audit = await db
          .select({ operationId: auditEvents.operationId })
          .from(auditEvents)
          .where(
            and(
              eq(auditEvents.ownerId, ownerId),
              eq(auditEvents.action, "week_verified"),
              eq(auditEvents.weekNumber, input.weekNumber),
            ),
          )
          .get();
        return verifyResponseSchema.parse({
          weekNumber: input.weekNumber,
          status: "VERIFIED",
          revision: again.revision,
          verifiedAt: again.verifiedAt,
          operationId: audit?.operationId ?? operationId,
          reviewsCreated: 4,
        });
      }
    }
    throw new AppError(
      "verify_conflict",
      "Verification did not apply (stale revision or ineligible state)",
      409,
    );
  }

  return verifyResponseSchema.parse({
    weekNumber: input.weekNumber,
    status: "VERIFIED",
    revision: nextRevision,
    verifiedAt,
    operationId,
    reviewsCreated: 4,
  });
}

export async function completeReview(
  env: AppBindings,
  ownerId: string,
  input: ReviewComplete,
) {
  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const effect = retentionReviewEffect(input.passed);

  const row = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.ownerId, ownerId),
        eq(reviews.weekNumber, input.weekNumber),
        eq(reviews.reviewOffset, input.reviewOffset),
      ),
    )
    .get();

  if (!row) {
    throw new AppError("not_found", "Review not found", 404);
  }

  if (row.completedAt) {
    // Idempotent replay
    const wp = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);
    return reviewCompleteResponseSchema.parse({
      weekNumber: input.weekNumber,
      reviewOffset: input.reviewOffset,
      passed: row.passed ?? input.passed,
      completedAt: row.completedAt,
      weekStatus: wp.status,
      gapCreated: false,
    });
  }

  const gapId = createId("gap_");
  const statements = [
    env.DB.prepare(
      `UPDATE reviews
       SET completed_at = ?, passed = ?, notes = ?, updated_at = ?
       WHERE id = ? AND completed_at IS NULL`,
    ).bind(
      now,
      input.passed ? 1 : 0,
      input.notes ?? null,
      now,
      row.id,
    ),
  ];

  if (effect.kind === "failed" && effect.createRetentionGap) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO gaps (
          id, owner_id, week_number, kind, review_id, attempt_id, resolved_at, notes, created_at, updated_at
        )
        SELECT ?, ?, ?, 'retention', ?, NULL, NULL, ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM reviews WHERE id = ? AND completed_at = ?)`,
      ).bind(
        gapId,
        ownerId,
        input.weekNumber,
        row.id,
        input.notes ?? "Retention review failed",
        now,
        now,
        row.id,
        now,
      ),
    );
  }

  const batch = await env.DB.batch(statements);
  const upd = batch[0]?.meta as { changes?: number } | undefined;
  if ((upd?.changes ?? 0) !== 1) {
    throw new AppError("conflict", "Review already completed", 409);
  }

  const wp = await getOrCreateWeekProgress(env, ownerId, input.weekNumber);
  return reviewCompleteResponseSchema.parse({
    weekNumber: input.weekNumber,
    reviewOffset: input.reviewOffset,
    passed: input.passed,
    completedAt: now,
    weekStatus: wp.status,
    gapCreated: effect.kind === "failed",
  });
}

export async function addTimeEntry(
  env: AppBindings,
  ownerId: string,
  input: {
    weekNumber: number;
    minutes: number;
    note?: string;
    occurredOn: string;
  },
) {
  await assertWeekWrite(env, ownerId, input.weekNumber, "time_entry");
  if (input.minutes < 1 || input.minutes > 24 * 60) {
    throw new AppError("validation_error", "Invalid minutes", 400);
  }
  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const id = createId("time_");
  await db
    .insert(timeEntries)
    .values({
      id,
      ownerId,
      weekNumber: input.weekNumber,
      minutes: input.minutes,
      note: input.note ?? null,
      occurredOn: input.occurredOn,
      createdAt: now,
    })
    .run();
  return { id, ...input, createdAt: now };
}

export async function confirmPrerequisite(
  env: AppBindings,
  ownerId: string,
  input: {
    prerequisiteId: string;
    passed: boolean;
    evidenceNotes?: string;
    attemptNotes?: string;
  },
) {
  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(prerequisites)
    .where(
      and(
        eq(prerequisites.ownerId, ownerId),
        eq(prerequisites.prerequisiteId, input.prerequisiteId),
      ),
    )
    .get();

  if (existing) {
    await db
      .update(prerequisites)
      .set({
        passed: input.passed,
        confirmedAt: input.passed ? now : null,
        evidenceNotes: input.evidenceNotes ?? existing.evidenceNotes,
        attemptNotes: input.attemptNotes ?? existing.attemptNotes,
        updatedAt: now,
      })
      .where(eq(prerequisites.id, existing.id))
      .run();
    return { id: existing.id, prerequisiteId: input.prerequisiteId, passed: input.passed };
  }

  const id = createId("pre_");
  const kind =
    input.prerequisiteId === "python_w24"
      ? "python"
      : input.prerequisiteId === "systems_w48"
        ? "systems"
        : input.prerequisiteId === "gpu_w76"
          ? "hardware_gpu"
          : input.prerequisiteId === "pilot_consent"
            ? "consent"
            : "diagnostic";

  await db
    .insert(prerequisites)
    .values({
      id,
      ownerId,
      prerequisiteId: input.prerequisiteId,
      kind,
      passed: input.passed,
      confirmedAt: input.passed ? now : null,
      evidenceNotes: input.evidenceNotes ?? null,
      attemptNotes: input.attemptNotes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return { id, prerequisiteId: input.prerequisiteId, passed: input.passed };
}
