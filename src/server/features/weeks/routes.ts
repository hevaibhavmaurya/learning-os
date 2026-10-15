import { Hono } from "hono";
import { z } from "zod";
import {
  attemptCreateSchema,
  evidenceSubmitSchema,
  evidenceUpsertSchema,
  reviewCompleteSchema,
  verifySchema,
  weekDetailResponseSchema,
  weekNumberSchema,
} from "../../../shared/contracts/weeks";
import type { AppEnv } from "../../env";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { parseJson } from "../../middleware/errors";
import { listGaps, listTimeEntries, loadWeekDetail } from "./queries";
import {
  addTimeEntry,
  completeReview,
  confirmPrerequisite,
  recordAttempt,
  reopenEvidence,
  submitEvidence,
  upsertEvidence,
  verifyWeek,
} from "./use-cases";

export const weeksRoutes = new Hono<AppEnv>();
weeksRoutes.use("*", requireAuthMiddleware());

// Static paths before :weekNumber
weeksRoutes.post("/prerequisites/confirm", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      prerequisiteId: z.string().min(1).max(64),
      passed: z.boolean(),
      evidenceNotes: z.string().max(8000).optional(),
      attemptNotes: z.string().max(8000).optional(),
    }),
  );
  const result = await confirmPrerequisite(c.env, owner.id, body);
  return c.json(result);
});

weeksRoutes.get("/:weekNumber", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const detail = await loadWeekDetail(c.env, owner.id, weekNumber);
  return c.json(weekDetailResponseSchema.parse(detail));
});

weeksRoutes.post("/:weekNumber/attempts", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(c, attemptCreateSchema.omit({ weekNumber: true }));
  const result = await recordAttempt(c.env, owner.id, { ...body, weekNumber });
  return c.json(result, 201);
});

weeksRoutes.put("/:weekNumber/evidence", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(c, evidenceUpsertSchema.omit({ weekNumber: true }));
  const result = await upsertEvidence(c.env, owner.id, { ...body, weekNumber });
  return c.json(result);
});

weeksRoutes.post("/:weekNumber/evidence/submit", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(c, evidenceSubmitSchema.omit({ weekNumber: true }));
  const result = await submitEvidence(c.env, owner.id, { ...body, weekNumber });
  return c.json(result);
});

weeksRoutes.post("/:weekNumber/evidence/reopen", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(c, evidenceSubmitSchema.omit({ weekNumber: true }));
  const result = await reopenEvidence(c.env, owner.id, { ...body, weekNumber });
  return c.json(result);
});

weeksRoutes.post("/:weekNumber/verify", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(c, verifySchema.omit({ weekNumber: true }));
  const result = await verifyWeek(c.env, owner.id, { ...body, weekNumber });
  return c.json(result);
});

weeksRoutes.post("/:weekNumber/reviews/complete", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(
    c,
    reviewCompleteSchema.omit({ weekNumber: true }),
  );
  const result = await completeReview(c.env, owner.id, { ...body, weekNumber });
  return c.json(result);
});

weeksRoutes.get("/:weekNumber/gaps", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const items = await listGaps(c.env, owner.id, weekNumber);
  return c.json({ items });
});

weeksRoutes.get("/:weekNumber/time", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const items = await listTimeEntries(c.env, owner.id, weekNumber);
  return c.json({ items });
});

weeksRoutes.post("/:weekNumber/time", async (c) => {
  const owner = requireOwner(c);
  const weekNumber = weekNumberSchema.parse(Number(c.req.param("weekNumber")));
  const body = await parseJson(
    c,
    z.object({
      minutes: z.number().int().min(1).max(24 * 60),
      note: z.string().max(2000).optional(),
      occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  );
  const result = await addTimeEntry(c.env, owner.id, { ...body, weekNumber });
  return c.json(result, 201);
});
