import { env, SELF, fetchMock } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { seedOwnerAndSettings } from "../../src/server/db/seed";
import { createGoogleSession } from "../../src/server/features/auth/use-cases";

describe("owner-only Google sessions", () => {
  it("links existing data to the first account and refuses a different Google subject", async () => {
    const { ownerId } = await seedOwnerAndSettings(env);
    const session = await createGoogleSession(env, { email: env.OWNER_EMAIL, subject: "first-subject", name: "Owner" });
    const response = await SELF.fetch("http://localhost/api/auth/me", { headers: { cookie: `los_session=${session.sessionToken}` } });
    expect((await response.json() as { owner: { id: string } }).owner.id).toBe(ownerId);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM owners WHERE email = ?").bind(env.OWNER_EMAIL).first<{ n: number }>();
    expect(count?.n).toBe(1);
    await expect(createGoogleSession(env, { email: env.OWNER_EMAIL, subject: "other-subject", name: null })).rejects.toThrow("linked to another Google account");
    await expect(createGoogleSession(env, { email: "stranger@example.com", subject: "first-subject", name: null })).rejects.toThrow("not authorized");
  });

  it("removes old sign-in endpoints", async () => {
    expect((await SELF.fetch("http://localhost/api/auth/otp/request", { method: "POST", headers: { origin: env.APP_ORIGIN } })).status).toBe(404);
    expect((await SELF.fetch("http://localhost/api/auth/otp/debug-last")).status).toBe(404);
  });

  it("starts a browser-bound login and rejects callbacks without the matching cookie", async () => {
    const started = await SELF.fetch("http://localhost/api/auth/google/start", { redirect: "manual" });
    expect(started.status).toBe(302);
    const location = new URL(started.headers.get("location")!);
    expect(location.hostname).toBe("accounts.google.com");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("nonce")).toBeTruthy();
    expect(started.headers.get("set-cookie")).toContain("HttpOnly");
    const state = location.searchParams.get("state");
    const callback = await SELF.fetch(`http://localhost/api/auth/google/callback?state=${state}&code=unused`, { redirect: "manual" });
    expect(callback.headers.get("location")).toContain("error=invalid_state");
  });

  it("completes the Google callback once and issues a usable session", async () => {
    const started = await SELF.fetch("http://localhost/api/auth/google/start", { redirect: "manual" });
    const auth = new URL(started.headers.get("location")!);
    const state = auth.searchParams.get("state")!;
    const nonce = auth.searchParams.get("nonce")!;
    const flowCookie = started.headers.get("set-cookie")!.split(";")[0]!;
    const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
    const b64 = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const header = b64(new TextEncoder().encode(JSON.stringify({ alg: "RS256", kid: "test-key" })));
    const payload = b64(new TextEncoder().encode(JSON.stringify({
      iss: "https://accounts.google.com", aud: env.GOOGLE_CLIENT_ID,
      sub: "callback-subject", email: env.OWNER_EMAIL, email_verified: true,
      nonce, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300,
    })));
    const signature = b64(new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(`${header}.${payload}`))));
    fetchMock.activate();
    fetchMock.disableNetConnect();
    fetchMock.get("https://oauth2.googleapis.com").intercept({ path: "/token", method: "POST" }).reply(200, { id_token: `${header}.${payload}.${signature}` });
    fetchMock.get("https://www.googleapis.com").intercept({ path: "/oauth2/v3/certs", method: "GET" }).reply(200, { keys: [{ ...await crypto.subtle.exportKey("jwk", pair.publicKey), kid: "test-key" }] });
    const callbackUrl = `http://localhost/api/auth/google/callback?state=${state}&code=provider-code`;
    const completed = await SELF.fetch(callbackUrl, { headers: { cookie: flowCookie }, redirect: "manual" });
    expect(completed.status).toBe(302);
    expect(completed.headers.get("location")).toContain("/today");
    const sessionCookie = completed.headers.get("set-cookie")!.match(/los_session=[^;\s,]+/)?.[0];
    expect(sessionCookie, completed.headers.get("set-cookie") ?? "no cookie").toBeTruthy();
    const me = await SELF.fetch("http://localhost/api/auth/me", { headers: { cookie: sessionCookie } });
    expect((await me.json() as { authenticated: boolean }).authenticated).toBe(true);
    const replay = await SELF.fetch(callbackUrl, { headers: { cookie: flowCookie }, redirect: "manual" });
    expect(replay.headers.get("location")).toContain("error=invalid_state");
    fetchMock.assertNoPendingInterceptors();
  });
});
