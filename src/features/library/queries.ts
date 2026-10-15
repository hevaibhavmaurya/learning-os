import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "@/features/library/api";
import { libraryKeys } from "@/features/library/query-keys";
import type { NoteListQuery } from "@/shared/contracts/notes";

export function useNotesList(params: NoteListQuery) {
  return useQuery({
    queryKey: libraryKeys.list(params),
    queryFn: () => libraryApi.list(params),
  });
}

export function useNote(noteId: string) {
  return useQuery({
    queryKey: libraryKeys.detail(noteId),
    queryFn: () => libraryApi.get(noteId),
    enabled: Boolean(noteId),
  });
}
