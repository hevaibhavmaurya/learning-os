import type { NoteListQuery } from "@/shared/contracts/notes";

export const libraryKeys = {
  all: ["library"] as const,
  lists: () => [...libraryKeys.all, "list"] as const,
  list: (params: NoteListQuery) => [...libraryKeys.lists(), params] as const,
  details: () => [...libraryKeys.all, "detail"] as const,
  detail: (id: string) => [...libraryKeys.details(), id] as const,
  tags: () => [...libraryKeys.all, "tags"] as const,
};
