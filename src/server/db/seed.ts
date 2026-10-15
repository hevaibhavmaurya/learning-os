/**
 * Deterministic empty owner + settings for local/dev.
 * Does not invent learning progress, evidence, or verification.
 */
import { eq } from "drizzle-orm";
import { RULE_VERSION } from "../env";
import { curriculumHash } from "../lib/curriculum";
import { createDb } from "./client";
import { owners, settings } from "./schema";

export const SEED_OWNER_ID = "own_seed_owner_v1";

export type SeedInput = {
  DB: D1Database;
  OWNER_EMAIL: string;
};

export async function seedOwnerAndSettings(env: SeedInput): Promise<{
  ownerId: string;
  email: string;
  created: boolean;
}> {
  const db = createDb(env.DB);
  const email = env.OWNER_EMAIL.trim().toLowerCase();
  const now = "2026-01-01T00:00:00.000Z";

  const existing = await db
    .select({ id: owners.id, email: owners.email })
    .from(owners)
    .where(eq(owners.email, email))
    .get();

  if (existing) {
    const sett = await db
      .select({ ownerId: settings.ownerId })
      .from(settings)
      .where(eq(settings.ownerId, existing.id))
      .get();
    if (!sett) {
      await db
        .insert(settings)
        .values({
          ownerId: existing.id,
          planStartDate: null,
          timezone: "UTC",
          lockingEnabled: true,
          theme: "system",
          curriculumHash: curriculumHash(),
          ruleVersion: RULE_VERSION,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
    return { ownerId: existing.id, email: existing.email, created: false };
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO owners (id, email, display_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(SEED_OWNER_ID, email, "Vaibhav", now, now),
    env.DB.prepare(
      `INSERT INTO settings (
        owner_id, plan_start_date, timezone, locking_enabled, theme,
        curriculum_hash, rule_version, created_at, updated_at
      ) VALUES (?, NULL, 'UTC', 1, 'system', ?, ?, ?, ?)`,
    ).bind(SEED_OWNER_ID, curriculumHash(), RULE_VERSION, now, now),
  ]);

  return { ownerId: SEED_OWNER_ID, email, created: true };
}
