import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createDb } from "../db/client";
import { owners, sessions } from "../db/schema";
import {
  SESSION_COOKIE,
  type AppEnv,
  type OwnerContext,
  type SessionContext,
} from "../env";
import { hashSessionToken } from "../lib/crypto";
import { AppError } from "./errors";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeOrigin(value: string): string {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return value.replace(/\/$/, "");
  }
}

/** Reject cross-site mutations (cookie + Origin check). */
export function originCheckMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (!MUTATING.has(c.req.method)) {
      await next();
      return;
    }
    // Auth bootstrap endpoints still need Origin protection.
    const expected = normalizeOrigin(c.env.APP_ORIGIN);
    const origin = c.req.header("origin");
    const referer = c.req.header("referer");
    const candidate = origin
      ? normalizeOrigin(origin)
      : referer
        ? normalizeOrigin(new URL(referer).origin)
        : null;

    if (!candidate || candidate !== expected) {
      throw new AppError(
        "forbidden_origin",
        "Mutation rejected: Origin does not match APP_ORIGIN",
        403,
      );
    }
    await next();
  };
}

async function loadSession(
  c: Parameters<MiddlewareHandler<AppEnv>>[0],
): Promise<{ owner: OwnerContext; session: SessionContext } | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;

  const digest = await hashSessionToken(c.env.SESSION_PEPPER, token);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();

  const row = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
      ownerId: owners.id,
      email: owners.email,
      displayName: owners.displayName,
    })
    .from(sessions)
    .innerJoin(owners, eq(sessions.ownerId, owners.id))
    .where(
      and(
        eq(sessions.tokenDigest, digest),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
      ),
    )
    .get();

  if (!row) return null;

  // Touch last_seen (best-effort; not in critical path of mutations).
  void db
    .update(sessions)
    .set({ lastSeenAt: now })
    .where(eq(sessions.id, row.sessionId))
    .run();

  return {
    owner: {
      id: row.ownerId,
      email: row.email,
      displayName: row.displayName,
    },
    session: {
      id: row.sessionId,
      expiresAt: row.expiresAt,
    },
  };
}

/** Optional session attach (does not fail if anonymous). */
export function optionalAuthMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const loaded = await loadSession(c);
    if (loaded) {
      c.set("owner", loaded.owner);
      c.set("session", loaded.session);
    }
    await next();
  };
}

/** Require authenticated owner for private APIs. */
export function requireAuthMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const loaded = await loadSession(c);
    if (!loaded) {
      throw new AppError("unauthenticated", "Authentication required", 401);
    }
    c.set("owner", loaded.owner);
    c.set("session", loaded.session);
    await next();
  };
}

export function requireOwner(c: {
  get: (key: "owner") => OwnerContext | null;
}): OwnerContext {
  const owner = c.get("owner");
  if (!owner) {
    throw new AppError("unauthenticated", "Authentication required", 401);
  }
  return owner;
}
