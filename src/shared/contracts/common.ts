import { z } from "zod";

export const weekStatusSchema = z.enum([
  "PLANNED",
  "ATTEMPTED",
  "DONE",
  "VERIFIED",
]);

export const gateScoreSchema = z
  .number()
  .int()
  .min(0)
  .max(4);

export const gateScoresSchema = z.object({
  recall: gateScoreSchema,
  build: gateScoreSchema,
  debug: gateScoreSchema,
  transfer: gateScoreSchema,
});

/** Accepts UTC ISO-8601 timestamps (with offset or Z). */
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const cursorPageSchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

/** Consistent API error shape. */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  requestId: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type WeekStatusDto = z.infer<typeof weekStatusSchema>;
export type GateScoresDto = z.infer<typeof gateScoresSchema>;
