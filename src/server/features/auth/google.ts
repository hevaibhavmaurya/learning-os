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

export function getAppOrigin(c: Context<AppEnv>): string {
  const configured = c.env.APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    return new URL(c.req.url).origin;
  } catch {
    return "http://localhost";
  }
}

export function redirectUri(origin: string): string {
  const base = origin || "http://localhost";
  return new URL(CALLBACK_PATH, `${base.replace(/\/$/, "")}/`).toString();
}

export function flowCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, FLOW_COOKIE);
}

export function setFlowCookie(c: Context<AppEnv>, state: string): void {
  const origin = getAppOrigin(c);
  setCookie(c, FLOW_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "Lax",
    path: CALLBACK_PATH,
    maxAge: 600,
  });
}

export function clearFlowCookie(c: Context<AppEnv>): void {
  deleteCookie(c, FLOW_COOKIE, { path: CALLBACK_PATH });
}

export async function exchangeAndVerify(c: Context<AppEnv>, code: string, verifier: string, nonce: string): Promise<{
  email: string; subject: string; name: string | null;
}> {
  const env = c.env;
  const origin = getAppOrigin(c);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(origin),
        code_verifier: verifier,
      }),
    });
  } catch (error) {
    throw new AppError("google_network_error", `Google token request failed: ${String(error)}`, 502);
  }

  if (!tokenResponse.ok) {
    throw new AppError("google_exchange_failed", `Google rejected OAuth code (${tokenResponse.status})`, 401);
  }

  const payload = (await tokenResponse.json()) as { id_token?: string };
  if (!payload.id_token) throw new AppError("google_exchange_failed", "Google response did not contain an id_token", 401);

  return verifyIdToken(payload.id_token, env.GOOGLE_CLIENT_ID, nonce);
}

export async function verifyIdToken(idToken: string, expectedAudience: string, expectedNonce?: string): Promise<{
  email: string; subject: string; name: string | null;
}> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new AppError("google_invalid_token", "Malformed ID token", 401);
  const [headerJson, claimsJson, signatureBytes] = [
    new TextDecoder().decode(decodeBase64url(parts[0])),
    new TextDecoder().decode(decodeBase64url(parts[1])),
    decodeBase64url(parts[2]),
  ];
  const header = JSON.parse(headerJson) as { alg?: string; kid?: string };
  const claims = JSON.parse(claimsJson) as {
    iss?: string; aud?: string | string[]; exp?: number;
    email?: string; email_verified?: boolean; sub?: string; nonce?: string; name?: string;
  };
  if (header.alg !== "RS256" || !header.kid) {
    throw new AppError("google_invalid_token", "Unsupported Google signing algorithm", 401);
  }
  const audMatches = Array.isArray(claims.aud) ? claims.aud.includes(expectedAudience) : claims.aud === expectedAudience;
  if (!audMatches) throw new AppError("google_invalid_token", "Google token could not be verified (audience mismatch)", 401);
  if (!["https://accounts.google.com", "accounts.google.com"].includes(claims.iss ?? "")) {
    throw new AppError("google_invalid_token", "Google token could not be verified (issuer mismatch)", 401);
  }
  const now = Math.floor(Date.now() / 1000);
  if (!claims.exp || claims.exp < now - 60) throw new AppError("google_invalid_token", "Google token could not be verified (expired)", 401);
  if (expectedNonce && claims.nonce !== expectedNonce) throw new AppError("google_invalid_token", "Google token could not be verified (nonce mismatch)", 401);
  if (!claims.email || claims.email_verified !== true) {
    throw new AppError("google_unverified_email", "Google token could not be verified (email unverified)", 403);
  }
  if (!claims.sub) throw new AppError("google_invalid_token", "Missing Google account subject", 401);

  const jwksResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!jwksResponse.ok) throw new AppError("google_network_error", "Failed to retrieve Google public keys", 502);
  const jwks = (await jwksResponse.json()) as { keys?: Array<{ kid: string; n: string; e: string; kty: string }> };
  const key = jwks.keys?.find((k) => k.kid === header.kid);
  if (!key) throw new AppError("google_invalid_token", "Matching Google public key not found", 401);

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    { kty: key.kty, n: key.n, e: key.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signatureBytes, signedData);
  if (!verified) throw new AppError("google_invalid_token", "Signature check failed", 401);

  return { email: claims.email.toLowerCase(), subject: claims.sub, name: claims.name ?? null };
}

export const verifyGoogleIdToken = verifyIdToken;
