import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import {
  weekDetailResponseSchema,
  weekNumberSchema,
  weekTabSchema,
  type WeekDetailResponse,
  type WeekTabName,
} from "@/shared/contracts/weeks";
import {
  noteListResponseSchema,
  type NoteListResponse,
} from "@/shared/contracts/notes";
import { weekKeys } from "./query-keys";

export function validateWeekNumber(n: number): number {
  return weekNumberSchema.parse(n);
}

export function validateWeekTab(tab: string): WeekTabName {
  return weekTabSchema.parse(tab);
}

export async function fetchWeekDetail(
  weekNumber: number,
): Promise<WeekDetailResponse> {
  const n = validateWeekNumber(weekNumber);
  const data = await apiFetch<unknown>(`/api/weeks/${n}`);
  return weekDetailResponseSchema.parse(data);
}

export async function fetchWeekNotes(
  weekNumber: number,
): Promise<NoteListResponse> {
  const n = validateWeekNumber(weekNumber);
  const data = await apiFetch<unknown>(
    `/api/notes?weekNumber=${n}&limit=50`,
  );
  return noteListResponseSchema.parse(data);
}

export function useWeekDetailQuery(weekNumber: number) {
  const n = validateWeekNumber(weekNumber);
  return useQuery({
    queryKey: weekKeys.detail(n),
    queryFn: () => fetchWeekDetail(n),
  });
}

export function useWeekNotesQuery(weekNumber: number, enabled = true) {
  const n = validateWeekNumber(weekNumber);
  return useQuery({
    queryKey: weekKeys.notes(n),
    queryFn: () => fetchWeekNotes(n),
    enabled,
  });
}
