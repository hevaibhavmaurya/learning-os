import { z } from "zod";
import { cursorPageSchema } from "./common";

export const noteKindSchema = z.enum(["note", "resource"]);

export const noteListFilterSchema = z.enum([
  "all",
  "note",
  "resource",
  "archived",
  "trash",
]);

export const noteListQuerySchema = cursorPageSchema.extend({
  q: z.string().max(200).optional(),
  tag: z.string().max(64).optional(),
  weekNumber: z.number().int().min(1).max(91).optional(),
  filter: noteListFilterSchema.optional(),
  includeArchived: z.boolean().optional(),
  includeTrashed: z.boolean().optional(),
});

export const noteListItemSchema = z.object({
  id: z.string(),
  kind: noteKindSchema.default("note"),
  title: z.string(),
  plainTextPreview: z.string(),
  url: z.string().nullable().optional(),
  tags: z.array(z.string()),
  weekNumber: z.number().int().nullable(),
  projectId: z.string().nullable().optional(),
  revision: z.number().int().nonnegative(),
  archivedAt: z.string().nullable(),
  trashedAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const noteListResponseSchema = z.object({
  items: z.array(noteListItemSchema),
  nextCursor: z.string().nullable(),
});

export const richNoteEnvelopeSchema = z.object({
  schemaVersion: z.number().int().positive(),
  editorState: z.unknown(),
});

export const noteDetailResponseSchema = z.object({
  id: z.string(),
  kind: noteKindSchema.default("note"),
  title: z.string(),
  schemaVersion: z.number().int().positive(),
  editorState: z.unknown().nullable(),
  plainText: z.string(),
  url: z.string().nullable().optional(),
  tags: z.array(z.string()),
  weekNumber: z.number().int().nullable(),
  projectId: z.string().nullable().optional(),
  revision: z.number().int().nonnegative(),
  archivedAt: z.string().nullable(),
  trashedAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const noteCreateSchema = z.object({
  kind: noteKindSchema.optional(),
  title: z.string().max(500).optional(),
  schemaVersion: z.number().int().positive().optional(),
  editorState: z.unknown().optional(),
  plainText: z.string().max(500_000).optional(),
  url: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  weekNumber: z.number().int().min(1).max(91).nullable().optional(),
  projectId: z.string().nullable().optional(),
  templateId: z
    .enum(["evidence", "project", "block", "paper"])
    .optional(),
});

export const noteUpdateSchema = z.object({
  expectedRevision: z.number().int().nonnegative(),
  kind: noteKindSchema.optional(),
  title: z.string().max(500).optional(),
  schemaVersion: z.number().int().positive().optional(),
  editorState: z.unknown().optional(),
  plainText: z.string().max(500_000).optional(),
  url: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  weekNumber: z.number().int().min(1).max(91).nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export const noteUpdateResponseSchema = z.object({
  id: z.string(),
  revision: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

export type NoteListQuery = z.infer<typeof noteListQuerySchema>;
export type NoteListFilter = z.infer<typeof noteListFilterSchema>;
export type NoteKind = z.infer<typeof noteKindSchema>;
export type NoteDetailResponse = z.infer<typeof noteDetailResponseSchema>;
export type NoteCreate = z.infer<typeof noteCreateSchema>;
export type NoteUpdate = z.infer<typeof noteUpdateSchema>;
export type NoteListItem = z.infer<typeof noteListItemSchema>;
export type NoteListResponse = z.infer<typeof noteListResponseSchema>;
export type NoteUpdateResponse = z.infer<typeof noteUpdateResponseSchema>;
