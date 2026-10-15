import { z } from "zod";
import { gateScoresSchema, weekStatusSchema } from "./common";

export const weekNumberSchema = z.number().int().min(1).max(91);

export const weekTabSchema = z.enum([
  "overview",
  "learn",
  "practise",
  "build",
  "verify",
  "notes",
]);

export const attemptCreateSchema = z.object({
  weekNumber: weekNumberSchema,
  recall: gateScoresSchema.shape.recall,
  build: gateScoresSchema.shape.build,
  debug: gateScoresSchema.shape.debug,
  transfer: gateScoresSchema.shape.transfer,
  assistanceNotes: z.string().max(4000).optional(),
  /** independent | docs-only | assisted */
  assistanceLevel: z
    .enum(["independent", "docs-only", "assisted"])
    .optional(),
  coreAiAuthored: z.boolean().default(false),
  externallyReviewed: z.boolean().default(false),
  reviewLabel: z.string().max(200).optional(),
  notes: z.string().max(8000).optional(),
  expectedRevision: z.number().int().nonnegative(),
});

export const attemptCreateResponseSchema = z.object({
  attemptId: z.string(),
  weekNumber: weekNumberSchema,
  status: weekStatusSchema,
  revision: z.number().int().nonnegative(),
  gapCreated: z.boolean().optional(),
});

export const testOutcomeSchema = z.enum(["pass", "fail", "not_applicable"]);

export const evidenceFieldsSchema = z.object({
  artifactRef: z.string().max(2000).nullable().optional(),
  reproducibleSteps: z.string().max(20000).nullable().optional(),
  testOutcome: testOutcomeSchema.nullable().optional(),
  testOutputs: z.string().max(20000).nullable().optional(),
  failureRootCause: z.string().max(8000).nullable().optional(),
  transferCondition: z.string().max(4000).nullable().optional(),
  transferResult: z.string().max(4000).nullable().optional(),
  explanation: z.string().max(8000).nullable().optional(),
  measurementContext: z.string().max(4000).nullable().optional(),
  measurementNa: z.boolean().optional(),
  limitation: z.string().max(4000).nullable().optional(),
  helpUsed: z.string().max(4000).nullable().optional(),
  coreAiAuthored: z.boolean().optional(),
  externalReviewStatus: z.string().max(200).nullable().optional(),
  prerequisiteEvidence: z.string().max(8000).nullable().optional(),
  boundedCoreEvidence: z.string().max(8000).nullable().optional(),
  hardwareEvidence: z.string().max(8000).nullable().optional(),
  extrasJson: z.string().max(20000).nullable().optional(),
  /** Learner-authored acceptance checks (Practise tab). */
  acceptanceChecks: z.string().max(8000).nullable().optional(),
});

export const evidenceUpsertSchema = evidenceFieldsSchema.extend({
  weekNumber: weekNumberSchema,
  expectedRevision: z.number().int().nonnegative(),
});

export const evidenceSubmitSchema = z.object({
  weekNumber: weekNumberSchema,
  expectedRevision: z.number().int().nonnegative(),
});

export const evidenceResponseSchema = z.object({
  id: z.string(),
  weekNumber: weekNumberSchema,
  revision: z.number().int().nonnegative(),
  submittedAt: z.string().nullable(),
  status: weekStatusSchema,
});

export const verifySchema = z.object({
  weekNumber: weekNumberSchema,
  expectedRevision: z.number().int().nonnegative(),
  learnerConfirmed: z.literal(true),
});

export const verifyResponseSchema = z.object({
  weekNumber: weekNumberSchema,
  status: z.literal("VERIFIED"),
  revision: z.number().int().nonnegative(),
  verifiedAt: z.string(),
  operationId: z.string(),
  reviewsCreated: z.literal(4),
});

export const reviewCompleteSchema = z.object({
  weekNumber: weekNumberSchema,
  reviewOffset: z.union([
    z.literal(7),
    z.literal(28),
    z.literal(56),
    z.literal(112),
  ]),
  passed: z.boolean(),
  notes: z.string().max(4000).optional(),
});

export const reviewCompleteResponseSchema = z.object({
  weekNumber: weekNumberSchema,
  reviewOffset: z.number().int(),
  passed: z.boolean(),
  completedAt: z.string(),
  /** Failed retention never revokes VERIFIED. */
  weekStatus: weekStatusSchema,
  gapCreated: z.boolean(),
});

export const timeEntryCreateSchema = z.object({
  weekNumber: weekNumberSchema,
  hours: z.number().positive().max(24),
  activity: z.enum(["learn", "practise", "build", "assess"]),
});

export const timeEntryCreateResponseSchema = z.object({
  id: z.string(),
  weekNumber: weekNumberSchema,
  hours: z.number(),
  activity: z.string(),
  loggedAt: z.string(),
});

export const eligibilityIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});

export const attemptHistoryItemSchema = z.object({
  id: z.string(),
  recall: gateScoresSchema.shape.recall,
  build: gateScoresSchema.shape.build,
  debug: gateScoresSchema.shape.debug,
  transfer: gateScoresSchema.shape.transfer,
  assistanceLevel: z.string().nullable().optional(),
  assistanceNotes: z.string().nullable().optional(),
  coreAiAuthored: z.boolean(),
  notes: z.string().nullable().optional(),
  passed: z.boolean(),
  createdAt: z.string(),
});

export const weekEvidenceDetailSchema = evidenceFieldsSchema.extend({
  id: z.string(),
  revision: z.number().int().nonnegative(),
  submittedAt: z.string().nullable(),
});

export const weekGapSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string().nullable(),
  retryTask: z.string(),
  gate: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export const weekPrerequisiteRowSchema = z.object({
  id: z.string(),
  label: z.string(),
  satisfied: z.boolean(),
  kind: z.string().optional(),
});

export const weekDetailResponseSchema = z.object({
  weekNumber: weekNumberSchema,
  status: weekStatusSchema,
  locked: z.boolean(),
  /** First week that may accept writes under current locking (1–91). */
  expectedWritableWeek: weekNumberSchema.optional(),
  lockReason: z.string().nullable().optional(),
  revision: z.number().int().nonnegative(),
  startedAt: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  verifiedAt: z.string().nullable(),
  plannedDate: z.string().nullable().optional(),
  hoursLogged: z.number().nonnegative().optional(),
  overrideActive: z.boolean(),
  isDemo: z.boolean().optional(),
  hasReviewDue: z.boolean().optional(),
  attempts: z.array(attemptHistoryItemSchema),
  latestAttempt: attemptHistoryItemSchema.nullable(),
  evidence: weekEvidenceDetailSchema.nullable(),
  openGaps: z.array(weekGapSchema).optional(),
  prerequisites: z.array(weekPrerequisiteRowSchema).optional(),
  eligibility: z.object({
    canSubmitEvidence: z.boolean(),
    canVerify: z.boolean(),
    issues: z.array(eligibilityIssueSchema),
  }),
  reviews: z.array(
    z.object({
      reviewOffset: z.number().int(),
      offsetWeeks: z.number().int().optional(),
      dueAt: z.string(),
      completedAt: z.string().nullable(),
      passed: z.boolean().nullable(),
    }),
  ),
  minimumToPass: z.string().nullable().optional(),
  isBoundedCore: z.boolean(),
  asOf: z.string(),
  pilot: z
    .object({
      activatedAt: z.string().nullable(),
      simulated: z.boolean(),
      consentDocumented: z.boolean(),
      interruptionCount: z.number().int().nonnegative(),
      dayIndex: z.number().int().min(0).max(28).optional(),
    })
    .nullable()
    .optional(),
});

export type AttemptCreate = z.infer<typeof attemptCreateSchema>;
export type EvidenceUpsert = z.infer<typeof evidenceUpsertSchema>;
export type EvidenceSubmit = z.infer<typeof evidenceSubmitSchema>;
export type VerifyRequest = z.infer<typeof verifySchema>;
export type ReviewComplete = z.infer<typeof reviewCompleteSchema>;
export type WeekDetailResponse = z.infer<typeof weekDetailResponseSchema>;
export type TimeEntryCreate = z.infer<typeof timeEntryCreateSchema>;
export type WeekTabName = z.infer<typeof weekTabSchema>;
