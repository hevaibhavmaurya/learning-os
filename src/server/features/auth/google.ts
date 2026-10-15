import { getCookie, deleteCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { AppEnv } from "../../env";
import { AppError } from "../../middleware/errors";

const FLOW_COOKIE = "los_google_flow";
const CALLBACK_PATH = "/api/auth/google/callback";

export function randomUrlToken(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid token encoding");
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
}

export async function sha256(value: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export function redirectUri(origin: string): string {
  return new URL(CALLBACK_PATH, `${origin.replace(/\/$/, "")}/`).toString();
}

export function flowCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, FLOW_COOKIE);
}

export function setFlowCookie(c: Context<AppEnv>, state: string): void {
  setCookie(c, FLOW_COOKIE, state, {
    httpOnly: true, secure: c.env.APP_ORIGIN.startsWith("https://"),
    sameSite: "Lax", path: CALLBACK_PATH, maxAge: 600,
  });
}

export function clearFlowCookie(c: Context<AppEnv>): void {
  deleteCookie(c, FLOW_COOKIE, { path: CALLBACK_PATH });
}

export async function exchangeAndVerify(c: Context<AppEnv>, code: string, verifier: string, nonce: string): Promise<{
  email: string; subject: string; name: string | null;
}> {
  const env = c.env;
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri(env.APP_ORIGIN), grant_type: "authorization_code", code_verifier: verifier,
      }),
    });
  } catch {
    throw new AppError("google_unavailable", "Google sign-in is temporarily unavailable", 502);
  }
  if (!tokenResponse.ok) throw new AppError("google_code_invalid", "Google sign-in expired. Please try again", 401);
  const body = await tokenResponse.json() as { id_token?: unknown };
  if (typeof body.id_token !== "string") throw new AppError("google_token_invalid", "Google sign-in could not be verified", 401);
  return verifyGoogleIdToken(body.id_token, env.GOOGLE_CLIENT_ID, nonce);
}

export async function verifyGoogleIdToken(token: string, clientId: string, nonce: string): Promise<{
  email: string; subject: string; name: string | null;
}> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => part.length > 8192)) throw new Error("Invalid JWT");
    const [encodedHeader, encodedPayload, encodedSignature] = parts as [string, string, string];
    const header = JSON.parse(new TextDecoder().decode(decodeBase64url(encodedHeader))) as { alg?: string; kid?: string };
    if (header.alg !== "RS256" || !header.kid) throw new Error("Invalid algorithm");
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
    if (!response.ok) throw new Error("Google keys unavailable");
    const { keys } = await response.json() as { keys: Array<JsonWebKey & { kid?: string }> };
    const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
    if (!jwk) throw new Error("Unknown key");
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decodeBase64url(encodedSignature), new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
    if (!valid) throw new Error("Invalid signature");
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64url(encodedPayload))) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (!(["https://accounts.google.com", "accounts.google.com"].includes(String(claims.iss))) ||
      claims.aud !== clientId || typeof claims.exp !== "number" || claims.exp <= now ||
      typeof claims.iat !== "number" || claims.iat > now + 60 || claims.nonce !== nonce ||
      claims.email_verified !== true || typeof claims.email !== "string" ||
      typeof claims.sub !== "string" || !claims.sub) throw new Error("Invalid claims");
    return { email: claims.email, subject: claims.sub, name: typeof claims.name === "string" ? claims.name : null };
  } catch {
    throw new AppError("google_token_invalid", "Google sign-in could not be verified", 401);
  }
}
