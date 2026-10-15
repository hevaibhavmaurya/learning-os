import type { Context, ErrorHandler, MiddlewareHandler, Next } from "hono";
import { ZodError } from "zod";
import type { AppEnv } from "../env";
import { createRequestId } from "../lib/ids";

export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId: string;
};

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    status = 400,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function requestIdMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const incoming = c.req.header("x-request-id");
    const requestId =
      incoming && /^[A-Za-z0-9_-]{8,64}$/.test(incoming)
        ? incoming
        : createRequestId();
    c.set("requestId", requestId);
    c.set("owner", null);
    c.set("session", null);
    await next();
    c.header("x-request-id", requestId);
  };
}

function errorBody(
  c: Context<AppEnv>,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ApiErrorBody {
  return {
    code,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
    requestId: c.get("requestId") ?? createRequestId(),
  };
}

export function zodFieldErrors(err: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      errorBody(c, err.code, err.message, err.fieldErrors),
      err.status as 400,
    );
  }
  if (err instanceof ZodError) {
    return c.json(
      errorBody(c, "validation_error", "Invalid request", zodFieldErrors(err)),
      400,
    );
  }
  console.error("unhandled_error", {
    requestId: c.get("requestId"),
    message: err instanceof Error ? err.message : String(err),
  });
  return c.json(
    errorBody(c, "internal_error", "Internal server error"),
    500,
  );
};

/** Parse JSON body with a Zod schema; throw AppError on failure. */
export async function parseJson<T>(
  c: Context<AppEnv>,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new AppError("invalid_json", "Request body must be JSON", 400);
  }
  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(
        "validation_error",
        "Invalid request",
        400,
        zodFieldErrors(err),
      );
    }
    throw err;
  }
}

export async function notFoundHandler(c: Context<AppEnv>, next: Next) {
  await next();
  if (c.res.status === 404 && c.req.path.startsWith("/api/")) {
    return c.json(
      errorBody(c, "not_found", `No route for ${c.req.method} ${c.req.path}`),
      404,
    );
  }
}
