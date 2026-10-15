-- Learning OS initial schema (D1 / SQLite)
-- Owner-scoped private learning application.

PRAGMA foreign_keys = ON;

-- ─── Identity ───────────────────────────────────────────────────────────────

CREATE TABLE `owners` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `google_subject` text,
  `display_name` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `owners_email_unique` ON `owners` (`email`);
CREATE UNIQUE INDEX `owners_google_subject_unique` ON `owners` (`google_subject`);

CREATE TABLE `google_login_attempts` (
  `state_digest` text PRIMARY KEY NOT NULL,
  `nonce` text NOT NULL,
  `verifier` text NOT NULL,
  `expires_at` text NOT NULL,
  `consumed_at` text
);

CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `token_digest` text NOT NULL,
  `expires_at` text NOT NULL,
  `revoked_at` text,
  `created_at` text NOT NULL,
  `last_seen_at` text
);
CREATE UNIQUE INDEX `sessions_token_digest_unique` ON `sessions` (`token_digest`);
CREATE INDEX `sessions_owner_idx` ON `sessions` (`owner_id`);
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);

CREATE TABLE `rate_limits` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text REFERENCES `owners`(`id`),
  `bucket_key` text NOT NULL,
  `window_started_at` text NOT NULL,
  `count` integer NOT NULL DEFAULT 0,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `rate_limits_bucket_uidx` ON `rate_limits` (`bucket_key`, `window_started_at`);
CREATE INDEX `rate_limits_owner_idx` ON `rate_limits` (`owner_id`);

-- ─── Learning ───────────────────────────────────────────────────────────────

CREATE TABLE `settings` (
  `owner_id` text PRIMARY KEY NOT NULL REFERENCES `owners`(`id`),
  `plan_start_date` text,
  `timezone` text NOT NULL DEFAULT 'UTC',
  `locking_enabled` integer NOT NULL DEFAULT 1,
  `theme` text NOT NULL DEFAULT 'system',
  `curriculum_hash` text,
  `rule_version` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE `week_progress` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `status` text NOT NULL DEFAULT 'PLANNED'
    CHECK (`status` IN ('PLANNED', 'ATTEMPTED', 'DONE', 'VERIFIED')),
  `revision` integer NOT NULL DEFAULT 0,
  `latest_attempt_id` text,
  `verified_at` text,
  `curriculum_hash` text,
  `rule_version` integer,
  `override_active` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  CHECK (`week_number` >= 1 AND `week_number` <= 91)
);
CREATE UNIQUE INDEX `week_progress_owner_week_uidx` ON `week_progress` (`owner_id`, `week_number`);
CREATE INDEX `week_progress_owner_updated_idx` ON `week_progress` (`owner_id`, `updated_at`);
CREATE INDEX `week_progress_owner_status_idx` ON `week_progress` (`owner_id`, `status`);

CREATE TABLE `attempts` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `recall` integer NOT NULL CHECK (`recall` BETWEEN 0 AND 4),
  `build` integer NOT NULL CHECK (`build` BETWEEN 0 AND 4),
  `debug` integer NOT NULL CHECK (`debug` BETWEEN 0 AND 4),
  `transfer` integer NOT NULL CHECK (`transfer` BETWEEN 0 AND 4),
  `assistance_notes` text,
  `core_ai_authored` integer NOT NULL DEFAULT 0,
  `externally_reviewed` integer NOT NULL DEFAULT 0,
  `review_label` text,
  `notes` text,
  `created_at` text NOT NULL,
  CHECK (`week_number` >= 1 AND `week_number` <= 91)
);
CREATE INDEX `attempts_owner_week_idx` ON `attempts` (`owner_id`, `week_number`);
CREATE INDEX `attempts_owner_created_idx` ON `attempts` (`owner_id`, `created_at`);

CREATE TABLE `evidence` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `attempt_id` text REFERENCES `attempts`(`id`),
  `revision` integer NOT NULL DEFAULT 0,
  `submitted_at` text,
  `artifact_ref` text,
  `reproducible_steps` text,
  `test_outcome` text CHECK (`test_outcome` IS NULL OR `test_outcome` IN ('pass', 'fail', 'not_applicable')),
  `test_outputs` text,
  `failure_root_cause` text,
  `transfer_condition` text,
  `transfer_result` text,
  `explanation` text,
  `measurement_context` text,
  `measurement_na` integer NOT NULL DEFAULT 0,
  `limitation` text,
  `help_used` text,
  `core_ai_authored` integer NOT NULL DEFAULT 0,
  `external_review_status` text,
  `prerequisite_evidence` text,
  `bounded_core_evidence` text,
  `hardware_evidence` text,
  `extras_json` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  CHECK (`week_number` >= 1 AND `week_number` <= 91)
);
CREATE UNIQUE INDEX `evidence_owner_week_uidx` ON `evidence` (`owner_id`, `week_number`);
CREATE INDEX `evidence_owner_updated_idx` ON `evidence` (`owner_id`, `updated_at`);

CREATE TABLE `prerequisites` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `prerequisite_id` text NOT NULL,
  `kind` text NOT NULL,
  `passed` integer NOT NULL DEFAULT 0,
  `confirmed_at` text,
  `evidence_notes` text,
  `attempt_notes` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `prerequisites_owner_prereq_uidx` ON `prerequisites` (`owner_id`, `prerequisite_id`);
CREATE INDEX `prerequisites_owner_idx` ON `prerequisites` (`owner_id`);

CREATE TABLE `block_assessments` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `block_id` integer NOT NULL,
  `week_number` integer NOT NULL,
  `status` text NOT NULL DEFAULT 'PLANNED'
    CHECK (`status` IN ('PLANNED', 'ATTEMPTED', 'DONE', 'VERIFIED')),
  `evidence_notes` text,
  `reviewed_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `block_assessments_owner_block_uidx` ON `block_assessments` (`owner_id`, `block_id`);
CREATE INDEX `block_assessments_owner_week_idx` ON `block_assessments` (`owner_id`, `week_number`);

CREATE TABLE `reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `review_offset` integer NOT NULL
    CHECK (`review_offset` IN (7, 28, 56, 112)),
  `due_at` text NOT NULL,
  `completed_at` text,
  `passed` integer,
  `notes` text,
  `verification_operation_id` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  CHECK (`week_number` >= 1 AND `week_number` <= 91)
);
CREATE UNIQUE INDEX `reviews_owner_week_offset_uidx` ON `reviews` (`owner_id`, `week_number`, `review_offset`);
CREATE INDEX `reviews_owner_due_idx` ON `reviews` (`owner_id`, `due_at`);
CREATE INDEX `reviews_due_incomplete_idx` ON `reviews` (`owner_id`, `completed_at`, `due_at`);

CREATE TABLE `gaps` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `kind` text NOT NULL CHECK (`kind` IN ('assessment', 'retention')),
  `review_id` text REFERENCES `reviews`(`id`),
  `attempt_id` text REFERENCES `attempts`(`id`),
  `resolved_at` text,
  `notes` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `gaps_owner_week_idx` ON `gaps` (`owner_id`, `week_number`);
CREATE INDEX `gaps_owner_unresolved_idx` ON `gaps` (`owner_id`, `resolved_at`);

CREATE TABLE `overrides` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer NOT NULL,
  `reason` text NOT NULL,
  `active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL,
  `revoked_at` text,
  CHECK (`week_number` >= 1 AND `week_number` <= 91)
);
CREATE INDEX `overrides_owner_week_idx` ON `overrides` (`owner_id`, `week_number`);
CREATE INDEX `overrides_owner_active_idx` ON `overrides` (`owner_id`, `active`);

CREATE TABLE `audit_events` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `action` text NOT NULL,
  `entity_type` text,
  `entity_id` text,
  `week_number` integer,
  `operation_id` text,
  `detail_json` text,
  `created_at` text NOT NULL
);
CREATE INDEX `audit_events_owner_created_idx` ON `audit_events` (`owner_id`, `created_at`);
CREATE INDEX `audit_events_operation_idx` ON `audit_events` (`operation_id`);

CREATE TABLE `time_entries` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `week_number` integer,
  `minutes` integer NOT NULL,
  `note` text,
  `occurred_on` text NOT NULL,
  `created_at` text NOT NULL
);
CREATE INDEX `time_entries_owner_week_idx` ON `time_entries` (`owner_id`, `week_number`);
CREATE INDEX `time_entries_owner_date_idx` ON `time_entries` (`owner_id`, `occurred_on`);

CREATE TABLE `pilot_records` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `mode` text NOT NULL CHECK (`mode` IN ('REAL', 'SIMULATED')),
  `consent_documented` integer NOT NULL DEFAULT 0,
  `data_use_scope` text,
  `activated_at` text,
  `completed_at` text,
  `clock_days` integer NOT NULL DEFAULT 28,
  `observations` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `pilot_records_owner_idx` ON `pilot_records` (`owner_id`);

CREATE TABLE `pilot_interruptions` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `pilot_id` text NOT NULL REFERENCES `pilot_records`(`id`),
  `started_at` text NOT NULL,
  `ended_at` text,
  `reason` text,
  `created_at` text NOT NULL
);
CREATE INDEX `pilot_interruptions_owner_idx` ON `pilot_interruptions` (`owner_id`);
CREATE INDEX `pilot_interruptions_pilot_idx` ON `pilot_interruptions` (`pilot_id`);

-- ─── Work ───────────────────────────────────────────────────────────────────

CREATE TABLE `personal_projects` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `title` text NOT NULL,
  `summary` text,
  `status` text NOT NULL DEFAULT 'active',
  `week_number` integer,
  `milestone` text,
  `notes_plain_text` text NOT NULL DEFAULT '',
  `notes_editor_state` text,
  `notes_schema_version` integer NOT NULL DEFAULT 1,
  `revision` integer NOT NULL DEFAULT 0,
  `trashed_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `personal_projects_owner_updated_idx` ON `personal_projects` (`owner_id`, `updated_at`);
CREATE INDEX `personal_projects_owner_trash_idx` ON `personal_projects` (`owner_id`, `trashed_at`);

CREATE TABLE `roadmap_project_progress` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `project_id` text NOT NULL,
  `status` text NOT NULL DEFAULT 'PLANNED'
    CHECK (`status` IN ('PLANNED', 'ATTEMPTED', 'DONE', 'VERIFIED')),
  `acceptance_evidence` text,
  `learner_confirmed` integer NOT NULL DEFAULT 0,
  `verified_at` text,
  `revision` integer NOT NULL DEFAULT 0,
  `skipped` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `roadmap_project_progress_owner_project_uidx`
  ON `roadmap_project_progress` (`owner_id`, `project_id`);
CREATE INDEX `roadmap_project_progress_owner_updated_idx`
  ON `roadmap_project_progress` (`owner_id`, `updated_at`);

CREATE TABLE `project_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `project_ref` text NOT NULL,
  `body` text NOT NULL,
  `logged_at` text NOT NULL,
  `created_at` text NOT NULL
);
CREATE INDEX `project_logs_owner_project_idx` ON `project_logs` (`owner_id`, `project_ref`);

CREATE TABLE `project_decisions` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `project_ref` text NOT NULL,
  `decision` text NOT NULL,
  `rationale` text,
  `decided_at` text NOT NULL,
  `created_at` text NOT NULL
);
CREATE INDEX `project_decisions_owner_project_idx` ON `project_decisions` (`owner_id`, `project_ref`);

CREATE TABLE `project_links` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `project_ref` text NOT NULL,
  `url` text NOT NULL,
  `label` text,
  `created_at` text NOT NULL
);
CREATE INDEX `project_links_owner_project_idx` ON `project_links` (`owner_id`, `project_ref`);

CREATE TABLE `notes` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `title` text NOT NULL DEFAULT '',
  `kind` text NOT NULL DEFAULT 'note',
  `url` text,
  `project_id` text,
  `schema_version` integer NOT NULL DEFAULT 1,
  `editor_state` text,
  `plain_text` text NOT NULL DEFAULT '',
  `tags_json` text,
  `week_number` integer,
  `revision` integer NOT NULL DEFAULT 0,
  `archived_at` text,
  `trashed_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `notes_owner_updated_idx` ON `notes` (`owner_id`, `updated_at`);
CREATE INDEX `notes_owner_trash_idx` ON `notes` (`owner_id`, `trashed_at`);
CREATE INDEX `notes_owner_archived_idx` ON `notes` (`owner_id`, `archived_at`);
CREATE INDEX `notes_owner_week_idx` ON `notes` (`owner_id`, `week_number`);

CREATE TABLE `ideas` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `title` text NOT NULL,
  `body` text NOT NULL DEFAULT '',
  `converted_project_id` text,
  `trashed_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `ideas_owner_updated_idx` ON `ideas` (`owner_id`, `updated_at`);
CREATE INDEX `ideas_owner_trash_idx` ON `ideas` (`owner_id`, `trashed_at`);

CREATE TABLE `posts` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `title` text NOT NULL,
  `status` text NOT NULL DEFAULT 'draft',
  `week_number` integer,
  `project_id` text,
  `planned_at` text,
  `urls_json` text NOT NULL DEFAULT '{}',
  `published_at` text,
  `saved_url` text,
  `trashed_at` text,
  `revision` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX `posts_owner_updated_idx` ON `posts` (`owner_id`, `updated_at`);
CREATE INDEX `posts_owner_trash_idx` ON `posts` (`owner_id`, `trashed_at`);

CREATE TABLE `platform_copy` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `post_id` text NOT NULL REFERENCES `posts`(`id`),
  `platform` text NOT NULL,
  `body` text NOT NULL DEFAULT '',
  `char_count` integer NOT NULL DEFAULT 0,
  `revision` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `platform_copy_post_platform_uidx` ON `platform_copy` (`post_id`, `platform`);
CREATE INDEX `platform_copy_owner_idx` ON `platform_copy` (`owner_id`);

CREATE TABLE `media_objects` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL REFERENCES `owners`(`id`),
  `r2_key` text NOT NULL,
  `content_type` text,
  `byte_size` integer,
  `status` text NOT NULL DEFAULT 'pending'
    CHECK (`status` IN ('pending', 'ready', 'failed', 'orphaned')),
  `checksum` text,
  `linked_entity_type` text,
  `linked_entity_id` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX `media_objects_r2_key_unique` ON `media_objects` (`r2_key`);
CREATE INDEX `media_objects_owner_idx` ON `media_objects` (`owner_id`);
CREATE INDEX `media_objects_owner_status_idx` ON `media_objects` (`owner_id`, `status`);
