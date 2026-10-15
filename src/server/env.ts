/** Hono bindings and per-request variables for the Learning OS Worker. */

export type AppBindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  OWNER_EMAIL: string;
  APP_ORIGIN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_PEPPER: string;
  E2E_AUTH_FIXTURE?: string;
  ENVIRONMENT?: string;
};

export type OwnerContext = {
  id: string;
  email: string;
  displayName: string | null;
};

export type SessionContext = {
  id: string;
  expiresAt: string;
};

export type AppVariables = {
  requestId: string;
  owner: OwnerContext | null;
  session: SessionContext | null;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: AppVariables;
};

export const SESSION_COOKIE = "los_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const RULE_VERSION = 1;
