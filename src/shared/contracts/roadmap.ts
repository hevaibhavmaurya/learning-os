import { z } from "zod";
import { weekStatusSchema } from "./common";
import { weekNumberSchema } from "./weeks";

export const roadmapWeekCellSchema = z.object({
  weekNumber: weekNumberSchema,
  status: weekStatusSchema,
  locked: z.boolean(),
  verifiedAt: z.string().nullable(),
  plannedDate: z.string().nullable(),
});

export const roadmapResponseSchema = z.object({
  isDemo: z.boolean(),
  currentWeek: weekNumberSchema,
  verifiedCount: z.number().int().min(0).max(91),
  lockingEnabled: z.boolean(),
  variance: z.object({
    currentWeek: weekNumberSchema,
    plannedWeek: z.number().int().min(1).max(91),
    diffWeeks: z.number().int(),
    message: z.string(),
  }),
  weeks: z.array(roadmapWeekCellSchema).length(91),
  reviewDueWeeks: z.array(weekNumberSchema),
  gapWeeks: z.array(weekNumberSchema),
});

export type RoadmapResponse = z.infer<typeof roadmapResponseSchema>;
export type RoadmapWeekCell = z.infer<typeof roadmapWeekCellSchema>;
