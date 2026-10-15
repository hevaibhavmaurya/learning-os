import { useQuery } from "@tanstack/react-query";
import { studioApi } from "@/features/studio/api";
import { studioKeys } from "@/features/studio/query-keys";
import type { PostListQuery } from "@/shared/contracts/posts";

export function usePostsList(params: PostListQuery) {
  return useQuery({
    queryKey: studioKeys.list(params),
    queryFn: () => studioApi.list(params),
  });
}

export function usePost(itemId: string) {
  return useQuery({
    queryKey: studioKeys.detail(itemId),
    queryFn: () => studioApi.get(itemId),
    enabled: Boolean(itemId),
  });
}
