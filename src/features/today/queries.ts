import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import {
  todayResponseSchema,
  type TodayResponse,
} from "@/shared/contracts/today";
import { todayKeys } from "./query-keys";

export async function fetchToday(): Promise<TodayResponse> {
  const data = await apiFetch<unknown>("/api/today");
  return todayResponseSchema.parse(data);
}

export function useTodayQuery() {
  return useQuery({
    queryKey: todayKeys.summary(),
    queryFn: fetchToday,
  });
}
