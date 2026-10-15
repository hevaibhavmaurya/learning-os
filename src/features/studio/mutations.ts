import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studioApi } from "@/features/studio/api";
import { studioKeys } from "@/features/studio/query-keys";
import type { PostUpdate } from "@/shared/contracts/posts";

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => studioApi.create({ title: "Untitled", status: "idea" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
    },
  });
}

export function useUpdatePost(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PostUpdate) => studioApi.update(itemId, body),
    onSuccess: () => {
      // The editor owns the live draft; refetching here can replace newer input.
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
    },
  });
}

export function useDuplicatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.duplicate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
    },
  });
}

export function useTrashPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.trash(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
    },
  });
}

export function useRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.restore(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: studioKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: studioKeys.lists() });
    },
  });
}
