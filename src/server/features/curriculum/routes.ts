import { Hono } from "hono";
import type { AppEnv } from "../../env";
import { curriculum, getProject, getWeek } from "../../lib/curriculum";
import { requireAuthMiddleware } from "../../middleware/auth";
import { AppError } from "../../middleware/errors";

export const curriculumRoutes = new Hono<AppEnv>();
curriculumRoutes.use("*", requireAuthMiddleware());

curriculumRoutes.get("/", (c) => {
  return c.json({
    meta: curriculum.meta,
    stages: curriculum.stages,
    blocks: curriculum.blocks,
    weekCount: curriculum.weeks.length,
    projectCount: curriculum.projects.length,
    milestones: curriculum.milestones,
  });
});

curriculumRoutes.get("/policies", (c) => {
  return c.json({
    assessment: curriculum.policies.assessment,
    prerequisites: curriculum.policies.prerequisites,
    boundedCoreWeeks: curriculum.policies.boundedCoreWeeks,
    examinationProtocolSourceLines:
      curriculum.policies.examinationProtocolSourceLines ?? null,
    pilotSourceLines: curriculum.policies.pilotSourceLines ?? null,
  });
});

curriculumRoutes.get("/templates", (c) => {
  return c.json({ templates: curriculum.policies.templates });
});

curriculumRoutes.get("/weeks/:weekNumber", (c) => {
  const weekNumber = Number(c.req.param("weekNumber"));
  const week = getWeek(weekNumber);
  if (!week) throw new AppError("not_found", `Week ${weekNumber} not found`, 404);
  return c.json(week);
});

curriculumRoutes.get("/projects", (c) => {
  return c.json({
    items: curriculum.projects.map((p) => ({
      id: p.id,
      title: p.title,
      optional: p.optional,
      weekStart: p.weekStart ?? null,
      weekEnd: p.weekEnd ?? null,
    })),
  });
});

curriculumRoutes.get("/projects/:projectId", (c) => {
  const project = getProject(c.req.param("projectId"));
  if (!project) {
    throw new AppError("not_found", "Project not found", 404);
  }
  return c.json(project);
});
