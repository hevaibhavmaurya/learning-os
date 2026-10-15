import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../env";

/**
 * Baseline security headers on every Worker response.
 * CSP allows same-origin assets + Google Fonts (self-hosting fonts is a follow-up).
 */
export function securityHeadersMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    await next();

    const isProd =
      (c.env.ENVIRONMENT ?? "").toLowerCase() === "production";

    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    c.header("Cross-Origin-Opener-Policy", "same-origin");
    c.header(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "img-src 'self' data: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self'",
        "connect-src 'self'",
        "worker-src 'self' blob:",
      ].join("; "),
    );

    if (isProd) {
      c.header(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }
  };
}
