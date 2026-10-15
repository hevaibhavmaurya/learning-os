import { apiErrorSchema, type ApiError } from "@/shared/contracts/common";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }

  get code(): string {
    return this.body.code;
  }
}

export function isApiRequestError(err: unknown): err is ApiRequestError {
  return err instanceof ApiRequestError;
}

export function isStaleRevisionError(err: unknown): boolean {
  return (
    isApiRequestError(err) &&
    (err.code === "STALE_REVISION" || err.status === 409)
  );
}

type JsonValue = unknown;

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: JsonValue;
  rawBody?: BodyInit;
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, rawBody, headers, ...rest } = options;
  // Cast: Cloudflare Worker RequestInit typings omit browser `credentials`.
  const res = await globalThis.fetch(path, {
    credentials: "same-origin",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
  } as RequestInit);

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const fallback: ApiError = {
      code: res.status === 409 ? "STALE_REVISION" : "HTTP_ERROR",
      message:
        typeof parsed === "object" &&
        parsed &&
        "message" in parsed &&
        typeof (parsed as { message: unknown }).message === "string"
          ? (parsed as { message: string }).message
          : res.statusText || `Request failed (${res.status})`,
      requestId: crypto.randomUUID(),
    };
    const bodyErr = apiErrorSchema.safeParse(parsed);
    throw new ApiRequestError(res.status, bodyErr.success ? bodyErr.data : fallback);
  }

  return parsed as T;
}
