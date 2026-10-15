import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/features/library/api";
import { libraryKeys } from "@/features/library/query-keys";
import type { NoteCreate, NoteUpdate } from "@/shared/contracts/notes";
import type { TemplateId } from "@/shared/content/curriculum";
import {
  getTemplateBody,
  getTemplateTitle,
} from "@/shared/content/curriculum";

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NoteCreate) => libraryApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function useUpdateNote(noteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NoteUpdate) => libraryApi.update(noteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: libraryKeys.detail(noteId) });
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function useArchiveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.archive(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: libraryKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function useUnarchiveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.unarchive(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: libraryKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function useTrashNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.trash(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function useRestoreNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.restore(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: libraryKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

export function usePurgeNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.purge(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: libraryKeys.lists() });
    },
  });
}

/** User-invoked curriculum template → new Library note. */
export function useCreateFromTemplate() {
  const create = useCreateNote();
  return useMutation({
    mutationFn: async (templateId: TemplateId) => {
      const { markdownToEditorState } = await import(
        "@/shared/lib/markdown-to-lexical"
      );
      const title = getTemplateTitle(templateId);
      const plainText = getTemplateBody(templateId);
      return create.mutateAsync({
        kind: "note",
        title,
        plainText,
        editorState: plainText ? markdownToEditorState(plainText) : undefined,
        tags: ["template", templateId],
        templateId,
        schemaVersion: 1,
      });
    },
  });
}
