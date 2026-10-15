import { useQuery } from "@tanstack/react-query";
import {
  progressResponseSchema,
  type ProgressResponse,
} from "@/shared/contracts/progress";
import { apiFetch } from "@/shared/lib/api";
import { progressKeys } from "./query-keys";

export async function fetchProgress(): Promise<ProgressResponse> {
  const data = await apiFetch<unknown>("/api/progress");
  return progressResponseSchema.parse(data);
}

export function useProgressQuery() {
  return useQuery({
    queryKey: progressKeys.summary(),
    queryFn: fetchProgress,
  });
}
