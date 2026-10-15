import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import {
  roadmapResponseSchema,
  type RoadmapResponse,
} from "@/shared/contracts/roadmap";
import { roadmapKeys } from "./query-keys";

export async function fetchRoadmap(): Promise<RoadmapResponse> {
  const data = await apiFetch<unknown>("/api/roadmap");
  return roadmapResponseSchema.parse(data);
}

export function useRoadmapQuery() {
  return useQuery({
    queryKey: roadmapKeys.summary(),
    queryFn: fetchRoadmap,
  });
}
