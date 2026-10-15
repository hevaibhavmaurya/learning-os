/**
 * Learning OS — Drizzle schema for Cloudflare D1 (SQLite).
 * Owner-scoped private learning data. Timestamps are ISO-8601 UTC text unless noted.
 */
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Week status progression. */
export const WEEK_STATUSES = ["PLANNED", "ATTEMPTED", "DONE", "VERIFIED"] as const;
export type WeekStatus = (typeof WEEK_STATUSES)[number];

/** Gate scores: 0 = not assessed; pass requires ≥3. */
export const GATE_MIN = 0;
export const GATE_MAX = 4;
export const GATE_PASS = 3;

export const REVIEW_OFFSETS = [7, 28, 56, 112] as const;
export type ReviewOffset = (typeof REVIEW_OFFSETS)[number];

export const PILOT_MODES = ["REAL", "SIMULATED"] as const;
export type PilotMode = (typeof PILOT_MODES)[number];

export const TEST_OUTCOMES = ["pass", "fail", "not_applicable"] as const;
export type TestOutcome = (typeof TEST_OUTCOMES)[number];

export const MEDIA_STATUSES = ["pending", "ready", "failed", "orphaned"] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

// ─── Identity ───────────────────────────────────────────────────────────────

export const owners = sqliteTable("owners", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  googleSubject: text("google_subject").unique(),
  displayName: text("display_name"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const googleLoginAttempts = sqliteTable("google_login_attempts", {
  stateDigest: text("state_digest").primaryKey(),
  nonce: text("nonce").notNull(),
  verifier: text("verifier").notNull(),
  expiresAt: text("expires_at").notNull(),
  consumedAt: text("consumed_at"),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    tokenDigest: text("token_digest").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    revokedAt: text("revoked_at"),
    createdAt: text("created_at").notNull(),
    lastSeenAt: text("last_seen_at"),
  },
  (t) => [
    index("sessions_owner_idx").on(t.ownerId),
    index("sessions_expires_idx").on(t.expiresAt),
  ],
);

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").references(() => owners.id),
    bucketKey: text("bucket_key").notNull(),
    windowStartedAt: text("window_started_at").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("rate_limits_bucket_uidx").on(t.bucketKey, t.windowStartedAt),
    index("rate_limits_owner_idx").on(t.ownerId),
  ],
);

// ─── Learning ───────────────────────────────────────────────────────────────

export const settings = sqliteTable("settings", {
  ownerId: text("owner_id")
    .primaryKey()
    .references(() => owners.id),
  planStartDate: text("plan_start_date"),
  timezone: text("timezone").notNull().default("UTC"),
  lockingEnabled: integer("locking_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  theme: text("theme").notNull().default("system"),
  curriculumHash: text("curriculum_hash"),
  ruleVersion: integer("rule_version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const weekProgress = sqliteTable(
  "week_progress",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    status: text("status").notNull().default("PLANNED"),
    revision: integer("revision").notNull().default(0),
    latestAttemptId: text("latest_attempt_id"),
    verifiedAt: text("verified_at"),
    curriculumHash: text("curriculum_hash"),
    ruleVersion: integer("rule_version"),
    overrideActive: integer("override_active", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("week_progress_owner_week_uidx").on(t.ownerId, t.weekNumber),
    index("week_progress_owner_updated_idx").on(t.ownerId, t.updatedAt),
    index("week_progress_owner_status_idx").on(t.ownerId, t.status),
  ],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    recall: integer("recall").notNull(),
    build: integer("build").notNull(),
    debug: integer("debug").notNull(),
    transfer: integer("transfer").notNull(),
    assistanceNotes: text("assistance_notes"),
    coreAiAuthored: integer("core_ai_authored", { mode: "boolean" })
      .notNull()
      .default(false),
    externallyReviewed: integer("externally_reviewed", { mode: "boolean" })
      .notNull()
      .default(false),
    reviewLabel: text("review_label"),
    notes: text("notes"),
    /** Immutable once inserted. */
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("attempts_owner_week_idx").on(t.ownerId, t.weekNumber),
    index("attempts_owner_created_idx").on(t.ownerId, t.createdAt),
  ],
);

export const evidence = sqliteTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    attemptId: text("attempt_id").references(() => attempts.id),
    revision: integer("revision").notNull().default(0),
    submittedAt: text("submitted_at"),
    artifactRef: text("artifact_ref"),
    reproducibleSteps: text("reproducible_steps"),
    testOutcome: text("test_outcome"),
    testOutputs: text("test_outputs"),
    failureRootCause: text("failure_root_cause"),
    transferCondition: text("transfer_condition"),
    transferResult: text("transfer_result"),
    explanation: text("explanation"),
    measurementContext: text("measurement_context"),
    measurementNa: integer("measurement_na", { mode: "boolean" })
      .notNull()
      .default(false),
    limitation: text("limitation"),
    helpUsed: text("help_used"),
    coreAiAuthored: integer("core_ai_authored", { mode: "boolean" })
      .notNull()
      .default(false),
    externalReviewStatus: text("external_review_status"),
    prerequisiteEvidence: text("prerequisite_evidence"),
    boundedCoreEvidence: text("bounded_core_evidence"),
    hardwareEvidence: text("hardware_evidence"),
    /** Extra structured fields as JSON text. */
    extrasJson: text("extras_json"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("evidence_owner_week_uidx").on(t.ownerId, t.weekNumber),
    index("evidence_owner_updated_idx").on(t.ownerId, t.updatedAt),
  ],
);

export const prerequisites = sqliteTable(
  "prerequisites",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    /** Stable id: diagnostic_w1 | python_w24 | systems_w48 | gpu_w76 | pilot_consent */
    prerequisiteId: text("prerequisite_id").notNull(),
    kind: text("kind").notNull(),
    passed: integer("passed", { mode: "boolean" }).notNull().default(false),
    confirmedAt: text("confirmed_at"),
    evidenceNotes: text("evidence_notes"),
    attemptNotes: text("attempt_notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("prerequisites_owner_prereq_uidx").on(
      t.ownerId,
      t.prerequisiteId,
    ),
    index("prerequisites_owner_idx").on(t.ownerId),
  ],
);

export const blockAssessments = sqliteTable(
  "block_assessments",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    blockId: integer("block_id").notNull(),
    weekNumber: integer("week_number").notNull(),
    status: text("status").notNull().default("PLANNED"),
    evidenceNotes: text("evidence_notes"),
    reviewedAt: text("reviewed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("block_assessments_owner_block_uidx").on(t.ownerId, t.blockId),
    index("block_assessments_owner_week_idx").on(t.ownerId, t.weekNumber),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    reviewOffset: integer("review_offset").notNull(),
    dueAt: text("due_at").notNull(),
    completedAt: text("completed_at"),
    passed: integer("passed", { mode: "boolean" }),
    notes: text("notes"),
    verificationOperationId: text("verification_operation_id"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("reviews_owner_week_offset_uidx").on(
      t.ownerId,
      t.weekNumber,
      t.reviewOffset,
    ),
    index("reviews_owner_due_idx").on(t.ownerId, t.dueAt),
    index("reviews_due_incomplete_idx").on(t.ownerId, t.completedAt, t.dueAt),
  ],
);

export const gaps = sqliteTable(
  "gaps",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    /** assessment | retention */
    kind: text("kind").notNull(),
    reviewId: text("review_id").references(() => reviews.id),
    attemptId: text("attempt_id").references(() => attempts.id),
    resolvedAt: text("resolved_at"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("gaps_owner_week_idx").on(t.ownerId, t.weekNumber),
    index("gaps_owner_unresolved_idx").on(t.ownerId, t.resolvedAt),
  ],
);

export const overrides = sqliteTable(
  "overrides",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number").notNull(),
    reason: text("reason").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    revokedAt: text("revoked_at"),
  },
  (t) => [
    index("overrides_owner_week_idx").on(t.ownerId, t.weekNumber),
    index("overrides_owner_active_idx").on(t.ownerId, t.active),
  ],
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    weekNumber: integer("week_number"),
    operationId: text("operation_id"),
    detailJson: text("detail_json"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("audit_events_owner_created_idx").on(t.ownerId, t.createdAt),
    index("audit_events_operation_idx").on(t.operationId),
  ],
);

export const timeEntries = sqliteTable(
  "time_entries",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    weekNumber: integer("week_number"),
    minutes: integer("minutes").notNull(),
    note: text("note"),
    occurredOn: text("occurred_on").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("time_entries_owner_week_idx").on(t.ownerId, t.weekNumber),
    index("time_entries_owner_date_idx").on(t.ownerId, t.occurredOn),
  ],
);

export const pilotRecords = sqliteTable(
  "pilot_records",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    mode: text("mode").notNull(),
    consentDocumented: integer("consent_documented", { mode: "boolean" })
      .notNull()
      .default(false),
    dataUseScope: text("data_use_scope"),
    activatedAt: text("activated_at"),
    completedAt: text("completed_at"),
    clockDays: integer("clock_days").notNull().default(28),
    observations: text("observations"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("pilot_records_owner_idx").on(t.ownerId)],
);

export const pilotInterruptions = sqliteTable(
  "pilot_interruptions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    pilotId: text("pilot_id")
      .notNull()
      .references(() => pilotRecords.id),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    reason: text("reason"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("pilot_interruptions_owner_idx").on(t.ownerId),
    index("pilot_interruptions_pilot_idx").on(t.pilotId),
  ],
);

// ─── Work ───────────────────────────────────────────────────────────────────

export const personalProjects = sqliteTable(
  "personal_projects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    title: text("title").notNull(),
    summary: text("summary"),
    status: text("status").notNull().default("active"),
    weekNumber: integer("week_number"),
    milestone: text("milestone"),
    notesPlainText: text("notes_plain_text").notNull().default(""),
    notesEditorState: text("notes_editor_state"),
    notesSchemaVersion: integer("notes_schema_version").notNull().default(1),
    revision: integer("revision").notNull().default(0),
    trashedAt: text("trashed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("personal_projects_owner_updated_idx").on(t.ownerId, t.updatedAt),
    index("personal_projects_owner_trash_idx").on(t.ownerId, t.trashedAt),
  ],
);

export const roadmapProjectProgress = sqliteTable(
  "roadmap_project_progress",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    projectId: text("project_id").notNull(),
    status: text("status").notNull().default("PLANNED"),
    acceptanceEvidence: text("acceptance_evidence"),
    learnerConfirmed: integer("learner_confirmed", { mode: "boolean" })
      .notNull()
      .default(false),
    verifiedAt: text("verified_at"),
    revision: integer("revision").notNull().default(0),
    skipped: integer("skipped", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("roadmap_project_progress_owner_project_uidx").on(
      t.ownerId,
      t.projectId,
    ),
    index("roadmap_project_progress_owner_updated_idx").on(
      t.ownerId,
      t.updatedAt,
    ),
  ],
);

export const projectLogs = sqliteTable(
  "project_logs",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    projectRef: text("project_ref").notNull(),
    body: text("body").notNull(),
    loggedAt: text("logged_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("project_logs_owner_project_idx").on(t.ownerId, t.projectRef)],
);

export const projectDecisions = sqliteTable(
  "project_decisions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    projectRef: text("project_ref").notNull(),
    decision: text("decision").notNull(),
    rationale: text("rationale"),
    decidedAt: text("decided_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("project_decisions_owner_project_idx").on(t.ownerId, t.projectRef),
  ],
);

export const projectLinks = sqliteTable(
  "project_links",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    projectRef: text("project_ref").notNull(),
    url: text("url").notNull(),
    label: text("label"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("project_links_owner_project_idx").on(t.ownerId, t.projectRef)],
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    title: text("title").notNull().default(""),
    /** note | resource (bookmark). */
    kind: text("kind").notNull().default("note"),
    url: text("url"),
    projectId: text("project_id"),
    /** Rich envelope schema version (Lexical). */
    schemaVersion: integer("schema_version").notNull().default(1),
    /** Serialized Lexical editor state JSON. */
    editorState: text("editor_state"),
    plainText: text("plain_text").notNull().default(""),
    tagsJson: text("tags_json"),
    weekNumber: integer("week_number"),
    revision: integer("revision").notNull().default(0),
    archivedAt: text("archived_at"),
    trashedAt: text("trashed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("notes_owner_updated_idx").on(t.ownerId, t.updatedAt),
    index("notes_owner_trash_idx").on(t.ownerId, t.trashedAt),
    index("notes_owner_archived_idx").on(t.ownerId, t.archivedAt),
    index("notes_owner_week_idx").on(t.ownerId, t.weekNumber),
  ],
);

export const ideas = sqliteTable(
  "ideas",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    convertedProjectId: text("converted_project_id"),
    trashedAt: text("trashed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("ideas_owner_updated_idx").on(t.ownerId, t.updatedAt),
    index("ideas_owner_trash_idx").on(t.ownerId, t.trashedAt),
  ],
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    title: text("title").notNull(),
    status: text("status").notNull().default("draft"),
    weekNumber: integer("week_number"),
    projectId: text("project_id"),
    plannedAt: text("planned_at"),
    urlsJson: text("urls_json").notNull().default("{}"),
    publishedAt: text("published_at"),
    savedUrl: text("saved_url"),
    trashedAt: text("trashed_at"),
    revision: integer("revision").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("posts_owner_updated_idx").on(t.ownerId, t.updatedAt),
    index("posts_owner_trash_idx").on(t.ownerId, t.trashedAt),
  ],
);

export const platformCopy = sqliteTable(
  "platform_copy",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    platform: text("platform").notNull(),
    /** Plain-text Lexical representation. */
    body: text("body").notNull().default(""),
    charCount: integer("char_count").notNull().default(0),
    revision: integer("revision").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("platform_copy_post_platform_uidx").on(t.postId, t.platform),
    index("platform_copy_owner_idx").on(t.ownerId),
  ],
);

export const mediaObjects = sqliteTable(
  "media_objects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    r2Key: text("r2_key").notNull().unique(),
    contentType: text("content_type"),
    byteSize: integer("byte_size"),
    status: text("status").notNull().default("pending"),
    checksum: text("checksum"),
    linkedEntityType: text("linked_entity_type"),
    linkedEntityId: text("linked_entity_id"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("media_objects_owner_idx").on(t.ownerId),
    index("media_objects_owner_status_idx").on(t.ownerId, t.status),
  ],
);

/** Full schema map for drizzle client. */
export const schema = {
  owners,
  googleLoginAttempts,
  sessions,
  rateLimits,
  settings,
  weekProgress,
  attempts,
  evidence,
  prerequisites,
  blockAssessments,
  reviews,
  gaps,
  overrides,
  auditEvents,
  timeEntries,
  pilotRecords,
  pilotInterruptions,
  personalProjects,
  roadmapProjectProgress,
  projectLogs,
  projectDecisions,
  projectLinks,
  notes,
  ideas,
  posts,
  platformCopy,
  mediaObjects,
};

export type Schema = typeof schema;
