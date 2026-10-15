import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import {
  captureThoughtResponseSchema,
  type CaptureThought,
  type CaptureThoughtResponse,
} from "@/shared/contracts/today";
import {
  reviewCompleteResponseSchema,
  type ReviewComplete,
} from "@/shared/contracts/weeks";
import { todayKeys } from "./query-keys";

export async function captureThought(
  input: CaptureThought,
): Promise<CaptureThoughtResponse> {
  const data = await apiFetch<unknown>("/api/today/capture", {
    method: "POST",
    body: input,
  });
  return captureThoughtResponseSchema.parse(data);
}

export async function completeReview(input: ReviewComplete) {
  const data = await apiFetch<unknown>(
    `/api/weeks/${input.weekNumber}/reviews/complete`,
    {
      method: "POST",
      body: {
        reviewOffset: input.reviewOffset,
        passed: input.passed,
        notes: input.notes,
      },
    },
  );
  return reviewCompleteResponseSchema.parse(data);
}

export function useCaptureThoughtMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: captureThought,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: todayKeys.all });
    },
  });
}

export function useCompleteReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeReview,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: todayKeys.all });
      void qc.invalidateQueries({ queryKey: ["roadmap"] });
      void qc.invalidateQueries({ queryKey: ["weeks"] });
    },
  });
}
