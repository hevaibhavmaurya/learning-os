import { z } from "zod";
import { weekStatusSchema } from "./common";
import { weekNumberSchema } from "./weeks";

export const todayNextStepSchema = z.object({
  label: z.string(),
  tab: z.enum([
    "overview",
    "learn",
    "practise",
    "build",
    "verify",
    "notes",
  ]),
  hint: z.string(),
  icon: z.string(),
});

export const todayReviewDueSchema = z.object({
  weekNumber: weekNumberSchema,
  reviewOffset: z.union([
    z.literal(7),
    z.literal(28),
    z.literal(56),
    z.literal(112),
  ]),
  /** Prototype offsets in weeks: 1, 4, 8, 16 */
  offsetWeeks: z.number().int().positive(),
  dueAt: z.string(),
  title: z.string(),
});

export const todayGapSchema = z.object({
  id: z.string(),
  weekNumber: weekNumberSchema,
  title: z.string(),
  detail: z.string().nullable(),
  retryTask: z.string(),
});

export const todayResponseSchema = z.object({
  isDemo: z.boolean(),
  displayName: z.string(),
  currentWeek: weekNumberSchema,
  weekStatus: weekStatusSchema,
  locked: z.boolean(),
  verifiedCount: z.number().int().min(0).max(91),
  nextStep: todayNextStepSchema,
  reviewsDue: z.array(todayReviewDueSchema),
  nextReviewDueAt: z.string().nullable(),
  openGaps: z.array(todayGapSchema),
  project: z
    .object({
      projectId: z.string(),
      title: z.string(),
      milestoneText: z.string(),
    })
    .nullable(),
  lockingEnabled: z.boolean(),
});

export const captureThoughtSchema = z.object({
  text: z.string().min(1).max(8000),
  weekNumber: weekNumberSchema.optional(),
});

export const captureThoughtResponseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("note"),
    id: z.string(),
    title: z.string(),
  }),
  z.object({
    kind: z.literal("idea"),
    id: z.string(),
    text: z.string(),
  }),
  z.object({
    kind: z.literal("resource"),
    id: z.string(),
    title: z.string(),
    url: z.string(),
  }),
]);

export type TodayResponse = z.infer<typeof todayResponseSchema>;
export type CaptureThought = z.infer<typeof captureThoughtSchema>;
export type CaptureThoughtResponse = z.infer<
  typeof captureThoughtResponseSchema
>;
