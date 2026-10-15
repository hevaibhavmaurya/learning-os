import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { logoutResponseSchema, sessionResponseSchema } from "../../../shared/contracts/auth";
import { SESSION_COOKIE, type AppEnv } from "../../env";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { createGoogleSession, logoutSession, meResponse } from "./use-cases";
import { clearFlowCookie, exchangeAndVerify, flowCookie, randomUrlToken, redirectUri, setFlowCookie, sha256 } from "./google";
import { createDb } from "../../db/client";
import { owners } from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateSessionToken, hashSessionToken } from "../../lib/crypto";
import { createId } from "../../lib/ids";
import { SESSION_TTL_MS } from "../../env";

export const authRoutes = new Hono<AppEnv>();

authRoutes.get("/google/start", async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
    return c.redirect("/login?error=not_configured");
  }
  const state = randomUrlToken();
  const nonce = randomUrlToken();
  const verifier = randomUrlToken();
  await c.env.DB.prepare(
    "INSERT INTO google_login_attempts (state_digest, nonce, verifier, expires_at) VALUES (?, ?, ?, ?)",
  ).bind(await sha256(state), nonce, verifier, new Date(Date.now() + 600_000).toISOString()).run();
  setFlowCookie(c, state);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  for (const [key, value] of Object.entries({
    client_id: c.env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri(c.env.APP_ORIGIN || new URL(c.req.url).origin),
    response_type: "code", scope: "openid email profile", state, nonce,
    code_challenge: await sha256(verifier), code_challenge_method: "S256",
  })) url.searchParams.set(key, value);
  return c.redirect(url.toString());
});

authRoutes.get("/google/callback", async (c) => {
  const state = c.req.query("state");
  const cookie = flowCookie(c);
  clearFlowCookie(c);
  if (!state || !cookie || state !== cookie || !/^[A-Za-z0-9_-]{40,60}$/.test(state)) {
    return c.redirect("/login?error=invalid_state");
  }
  const digest = await sha256(state);
  const row = await c.env.DB.prepare(
    "SELECT nonce, verifier FROM google_login_attempts WHERE state_digest = ? AND consumed_at IS NULL AND expires_at > ?",
  ).bind(digest, new Date().toISOString()).first<{ nonce: string; verifier: string }>();
  if (!row) return c.redirect("/login?error=invalid_state");
  const consumed = await c.env.DB.prepare(
    "UPDATE google_login_attempts SET consumed_at = ? WHERE state_digest = ? AND consumed_at IS NULL AND expires_at > ?",
  ).bind(new Date().toISOString(), digest, new Date().toISOString()).run();
  if (consumed.meta.changes !== 1) return c.redirect("/login?error=invalid_state");
  const code = c.req.query("code");
  if (!code || c.req.query("error")) return c.redirect("/login?error=cancelled");
  try {
    const identity = await exchangeAndVerify(c, code, row.verifier, row.nonce);
    const session = await createGoogleSession(c.env, identity);
    setCookie(c, SESSION_COOKIE, session.sessionToken, {
      httpOnly: true, secure: c.env.APP_ORIGIN.startsWith("https://"),
      sameSite: "Lax", path: "/", expires: new Date(session.expiresAt),
    });
    return c.redirect("/today");
  } catch {
    return c.redirect("/login?error=sign_in_failed");
  }
});

authRoutes.post("/logout", optionalAuthMiddleware(), async (c) => {
  await logoutSession(c.env, c.get("session")?.id ?? null);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json(logoutResponseSchema.parse({ ok: true }));
});

authRoutes.get("/me", optionalAuthMiddleware(), (c) =>
  c.json(sessionResponseSchema.parse(meResponse(c.get("owner"), c.get("session")))),
);

/** Local browser-test fixture. The development Worker itself rejects non-local API requests. */
authRoutes.post("/dev-session", async (c) => {
  if (c.env.ENVIRONMENT !== "development" || c.env.E2E_AUTH_FIXTURE !== "true" ||
    !["localhost", "127.0.0.1"].includes(new URL(c.req.url).hostname)) {
    return c.json({ code: "forbidden", message: "Not available", requestId: c.get("requestId") }, 403);
  }
  const { seedOwnerAndSettings } = await import("../../db/seed");
  await seedOwnerAndSettings(c.env);
  const owner = await createDb(c.env.DB).select().from(owners)
    .where(eq(owners.email, c.env.OWNER_EMAIL.trim().toLowerCase())).get();
  if (!owner) return c.json({ code: "owner_missing", message: "Owner missing", requestId: c.get("requestId") }, 500);
  const token = generateSessionToken();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await c.env.DB.prepare("INSERT INTO sessions (id, owner_id, token_digest, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(createId("ses_"), owner.id, await hashSessionToken(c.env.SESSION_PEPPER, token), expiresAt, now).run();
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/", expires: new Date(expiresAt) });
  return c.json({ ok: true });
});
