import { z } from "zod";
import { weekStatusSchema } from "./common";

const gateKeySchema = z.enum(["recall", "build", "debug", "transfer"]);

export const progressResponseSchema = z.object({
  asOf: z.string(),
  weeksTracked: z.number().int().nonnegative(),
  weeksTotal: z.number().int().positive(),
  byStatus: z.object({
    PLANNED: z.number().int().nonnegative(),
    ATTEMPTED: z.number().int().nonnegative(),
    DONE: z.number().int().nonnegative(),
    VERIFIED: z.number().int().nonnegative(),
  }),
  verifiedCount: z.number().int().nonnegative(),
  openGaps: z.number().int().nonnegative(),
  reviewsDue: z.number().int().nonnegative(),
  projectsVerified: z.number().int().nonnegative(),
  projectsSkipped: z.number().int().nonnegative(),
  projectsComplete: z.number().int().nonnegative(),
  programmeComplete: z.boolean(),
  currentWeek: z.number().int().min(1).max(91),
  planStartDate: z.string().nullable(),
  hoursInvested: z.number().nonnegative(),
  plannedHours: z.number().nonnegative(),
  reviewsCompleted: z.number().int().nonnegative(),
  reviewRetentionPct: z.number().int().min(0).max(100).nullable(),
  verifiedTimeline: z.array(
    z.object({
      weekNumber: z.number().int(),
      verifiedAt: z.string(),
    }),
  ),
  verifiedWeekNumbers: z.array(z.number().int()),
  gatePerformance: z.object({
    gates: z.array(
      z.object({
        key: gateKeySchema,
        label: z.string(),
        /** Counts for scores 0–4 (index = score). */
        scoreCounts: z.tuple([
          z.number(),
          z.number(),
          z.number(),
          z.number(),
          z.number(),
        ]),
        gapCount: z.number().int().nonnegative(),
      }),
    ),
    firstAttemptPassCount: z.number().int().nonnegative(),
    verifiedWeekCount: z.number().int().nonnegative(),
  }),
  weekStatuses: z.array(
    z.object({
      weekNumber: z.number().int(),
      status: weekStatusSchema,
    }),
  ),
});

export type ProgressResponse = z.infer<typeof progressResponseSchema>;
