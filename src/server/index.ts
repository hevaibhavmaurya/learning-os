import { Hono } from "hono";
import type { AppEnv } from "./env";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./middleware/errors";
import { originCheckMiddleware } from "./middleware/auth";
import { securityHeadersMiddleware } from "./middleware/security-headers";
import { authRoutes } from "./features/auth/routes";
import { curriculumRoutes } from "./features/curriculum/routes";
import { weeksRoutes } from "./features/weeks/routes";
import { todayRoutes } from "./features/today/routes";
import { roadmapRoutes } from "./features/roadmap/routes";
import { progressRoutes } from "./features/progress/routes";
import { projectsRoutes } from "./features/projects/routes";
import { ideasRoutes } from "./features/ideas/routes";
import { notesRoutes } from "./features/notes/routes";
import { studioRoutes } from "./features/studio/routes";
import { settingsRoutes } from "./features/settings/routes";
import { exportRoutes } from "./features/export/routes";
import { demoRoutes } from "./features/demo/routes";
import { mediaRoutes } from "./features/media/routes";

const app = new Hono<AppEnv>();

app.use("*", requestIdMiddleware());
app.use("*", securityHeadersMiddleware());
app.use("/api/*", async (c, next) => {
  const environment = (c.env.ENVIRONMENT ?? "production").toLowerCase();
  const hostname = new URL(c.req.url).hostname;
  if (environment !== "production" && !["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
    return c.json({ code: "development_only", message: "Development API is local-only" }, 503);
  }
  await next();
});
app.use("/api/*", originCheckMiddleware());
app.use("/api/*", notFoundHandler);

app.onError(errorHandler);

app.get("/api/health", (c) =>
  c.json({ ok: true, service: "learning-os", requestId: c.get("requestId") }),
);

app.route("/api/auth", authRoutes);
app.route("/api/curriculum", curriculumRoutes);
app.route("/api/weeks", weeksRoutes);
app.route("/api/today", todayRoutes);
app.route("/api/roadmap", roadmapRoutes);
app.route("/api/progress", progressRoutes);
app.route("/api/projects", projectsRoutes);
app.route("/api/ideas", ideasRoutes);
app.route("/api/notes", notesRoutes);
app.route("/api/studio", studioRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/export", exportRoutes);
app.route("/api/demo", demoRoutes);
app.route("/api/media", mediaRoutes);

export default app;
