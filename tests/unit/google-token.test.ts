import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyGoogleIdToken } from "../../src/server/features/auth/google";

function b64url(value: Uint8Array): string {
  return btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("Google ID token verification", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("accepts a signed verified identity and rejects altered claims", async () => {
    const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
    const publicKey = { ...await crypto.subtle.exportKey("jwk", pair.publicKey), kid: "test-key" };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ keys: [publicKey] }), { status: 200 })));
    const sign = async (claims: Record<string, unknown>) => {
      const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", kid: "test-key" })));
      const payload = b64url(new TextEncoder().encode(JSON.stringify(claims)));
      const bytes = new TextEncoder().encode(`${header}.${payload}`);
      const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, bytes);
      return `${header}.${payload}.${b64url(new Uint8Array(signature))}`;
    };
    const claims = {
      iss: "https://accounts.google.com", aud: "client-id", sub: "google-subject",
      email: "owner@example.com", email_verified: true, nonce: "nonce",
      iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300,
    };
    expect(await verifyGoogleIdToken(await sign(claims), "client-id", "nonce")).toMatchObject({ email: "owner@example.com", subject: "google-subject" });
    await expect(verifyGoogleIdToken(await sign({ ...claims, email_verified: false }), "client-id", "nonce")).rejects.toThrow("could not be verified");
    await expect(verifyGoogleIdToken(await sign(claims), "wrong-client", "nonce")).rejects.toThrow("could not be verified");
    await expect(verifyGoogleIdToken(await sign(claims), "client-id", "wrong-nonce")).rejects.toThrow("could not be verified");
    await expect(verifyGoogleIdToken(await sign({ ...claims, exp: 1 }), "client-id", "nonce")).rejects.toThrow("could not be verified");
  });
});
