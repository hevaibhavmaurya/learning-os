import type { PostListQuery } from "@/shared/contracts/posts";

export const studioKeys = {
  all: ["studio"] as const,
  lists: () => [...studioKeys.all, "list"] as const,
  list: (params: PostListQuery) => [...studioKeys.lists(), params] as const,
  details: () => [...studioKeys.all, "detail"] as const,
  detail: (id: string) => [...studioKeys.details(), id] as const,
};
