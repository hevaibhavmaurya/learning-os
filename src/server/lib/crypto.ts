/**
 * Session token hashing with a pepper secret.
 * Digests are hex-encoded HMAC-SHA-256; plaintext never stored.
 */

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (const b of view) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

async function hmacSha256(pepper: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toHex(sig);
}

/** Opaque session token (32 bytes → 64 hex chars). */
export function generateSessionToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return toHex(buf);
}

export async function hashSessionToken(
  pepper: string,
  token: string,
): Promise<string> {
  return hmacSha256(pepper, token);
}
