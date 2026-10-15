import { addDaysIso, type Clock } from "./clock";

/** Retention offsets from verification (source elapsed 7-day intervals). */
export const REVIEW_OFFSETS_DAYS = [7, 28, 56, 112] as const;
export type ReviewOffsetDays = (typeof REVIEW_OFFSETS_DAYS)[number];

export interface ReviewPlanItem {
  reviewOffset: ReviewOffsetDays;
  dueAt: string;
}

export interface CreateReviewsResult {
  reviews: ReviewPlanItem[];
  verificationAt: string;
}

/**
 * Create exactly four review due dates from a verification instant.
 * Offsets: +7, +28, +56, +112 days.
 */
export function planReviewsFromVerification(
  verifiedAtIso: string,
): CreateReviewsResult {
  const reviews = REVIEW_OFFSETS_DAYS.map((reviewOffset) => ({
    reviewOffset,
    dueAt: addDaysIso(verifiedAtIso, reviewOffset),
  }));
  return { reviews, verificationAt: verifiedAtIso };
}

export type ReviewCompletionEffect =
  | { kind: "passed"; leaveVerifiedIntact: true }
  | {
      kind: "failed";
      leaveVerifiedIntact: true;
      createRetentionGap: true;
    };

/**
 * Completing a retention review never revokes VERIFIED status.
 * Failed retention creates a distinguishable retention gap.
 */
export function retentionReviewEffect(passed: boolean): ReviewCompletionEffect {
  if (passed) {
    return { kind: "passed", leaveVerifiedIntact: true };
  }
  return {
    kind: "failed",
    leaveVerifiedIntact: true,
    createRetentionGap: true,
  };
}

export interface DueReview {
  weekNumber: number;
  reviewOffset: ReviewOffsetDays;
  dueAt: string;
  completedAt?: string | null;
}

/** Reviews that are due (dueAt ≤ now) and not yet completed. */
export function selectDueReviews(
  reviews: readonly DueReview[],
  clock: Clock,
): DueReview[] {
  const now = clock.nowMs();
  return reviews.filter((r) => {
    if (r.completedAt) return false;
    const due = Date.parse(r.dueAt);
    return Number.isFinite(due) && due <= now;
  });
}

/** Post-course reviews (after week 91 programme) stay classifiable; never invent Week 92. */
export function isPostCourseReview(
  weekNumber: number,
  programmeEndWeek = 91,
): boolean {
  return weekNumber >= 1 && weekNumber <= programmeEndWeek;
}
