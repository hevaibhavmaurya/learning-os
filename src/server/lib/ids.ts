/** Opaque ID helpers for D1 primary keys. */

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** URL-safe id with a short prefix (e.g. `own_`, `ses_`). */
export function createId(prefix: string, bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let out = "";
  for (const b of buf) {
    out += ALPHABET[b % ALPHABET.length]!;
  }
  return `${prefix}${out}`;
}

export function createRequestId(): string {
  return createId("req_", 12);
}

export function createOperationId(): string {
  return createId("op_", 16);
}
