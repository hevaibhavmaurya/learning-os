import { env } from "cloudflare:test";
import { seedOwnerAndSettings } from "../../src/server/db/seed";
import { generateSessionToken, hashSessionToken } from "../../src/server/lib/crypto";
import { createId } from "../../src/server/lib/ids";

export async function testSessionCookie(): Promise<string> {
  const { ownerId } = await seedOwnerAndSettings(env);
  const token = generateSessionToken();
  const digest = await hashSessionToken(env.SESSION_PEPPER, token);
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 60_000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, owner_id, token_digest, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  ).bind(createId("ses_"), ownerId, digest, expires, now).run();
  return `los_session=${token}`;
}
