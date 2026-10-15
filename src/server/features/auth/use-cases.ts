import { and, eq, isNull } from "drizzle-orm";
import type { SessionResponse } from "../../../shared/contracts/auth";
import { createDb } from "../../db/client";
import { owners, sessions, settings } from "../../db/schema";
import { RULE_VERSION, SESSION_TTL_MS, type AppBindings } from "../../env";
import { curriculumHash } from "../../lib/curriculum";
import { generateSessionToken, hashSessionToken } from "../../lib/crypto";
import { createId } from "../../lib/ids";
import { AppError } from "../../middleware/errors";

export async function createGoogleSession(env: AppBindings, identity: {
  email: string; subject: string; name: string | null;
}): Promise<{ sessionToken: string; expiresAt: string }> {
  const email = identity.email.trim().toLowerCase();
  if (email !== env.OWNER_EMAIL.trim().toLowerCase()) {
    throw new AppError("account_not_allowed", "This Google account is not authorized", 403);
  }
  const db = createDb(env.DB);
  const now = new Date().toISOString();
  const existing = await db.select().from(owners).where(eq(owners.email, email)).get();
  let ownerId: string;
  if (existing) {
    ownerId = existing.id;
    const claimed = await env.DB.prepare(
      "UPDATE owners SET google_subject = ?, updated_at = ? WHERE id = ? AND (google_subject IS NULL OR google_subject = ?)",
    ).bind(identity.subject, now, ownerId, identity.subject).run();
    if (claimed.meta.changes !== 1) {
      throw new AppError("account_not_allowed", "This owner is linked to another Google account", 403);
    }
  } else {
    ownerId = createId("own_");
    await env.DB.prepare(
      "INSERT OR IGNORE INTO owners (id, email, google_subject, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(ownerId, email, identity.subject, identity.name, now, now).run();
    const row = await db.select().from(owners).where(eq(owners.email, email)).get();
    if (!row || row.googleSubject !== identity.subject) {
      throw new AppError("account_not_allowed", "This owner is linked to another Google account", 403);
    }
    ownerId = row.id;
  }
  await db.insert(settings).values({
    ownerId, planStartDate: null, timezone: "UTC", lockingEnabled: true,
    theme: "system", curriculumHash: curriculumHash(), ruleVersion: RULE_VERSION,
    createdAt: now, updatedAt: now,
  }).onConflictDoNothing().run();

  const sessionToken = generateSessionToken();
  const tokenDigest = await hashSessionToken(env.SESSION_PEPPER, sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await db.insert(sessions).values({
    id: createId("ses_"), ownerId, tokenDigest, expiresAt,
    revokedAt: null, createdAt: now, lastSeenAt: now,
  }).run();
  return { sessionToken, expiresAt };
}

export async function logoutSession(env: AppBindings, sessionId: string | null): Promise<void> {
  if (!sessionId) return;
  await createDb(env.DB).update(sessions).set({ revokedAt: new Date().toISOString() })
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt))).run();
}

export function meResponse(
  owner: { id: string; email: string; displayName: string | null } | null,
  session: { expiresAt: string } | null,
): SessionResponse {
  if (!owner || !session) return { authenticated: false, owner: null, expiresAt: null };
  return { authenticated: true, owner, expiresAt: session.expiresAt };
}
