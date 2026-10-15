import { z } from "zod";
import { cursorPageSchema } from "./common";

export const postStatusSchema = z.enum([
  "idea",
  "draft",
  "ready",
  "published",
]);

export const studioPlatformSchema = z.enum(["li", "x", "ig"]);

export const postListQuerySchema = cursorPageSchema.extend({
  q: z.string().max(200).optional(),
  status: postStatusSchema.or(z.literal("all")).or(z.literal("trash")).optional(),
});

export const postListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: postStatusSchema,
  preview: z.string(),
  platforms: z.array(studioPlatformSchema),
  weekNumber: z.number().int().nullable(),
  projectId: z.string().nullable().optional(),
  plannedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  imageCount: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  trashedAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const postListResponseSchema = z.object({
  items: z.array(postListItemSchema),
  nextCursor: z.string().nullable(),
  counts: z
    .object({
      idea: z.number().int().nonnegative(),
      draft: z.number().int().nonnegative(),
      ready: z.number().int().nonnegative(),
      published: z.number().int().nonnegative(),
    })
    .optional(),
});

export const platformCopySchema = z.object({
  platform: studioPlatformSchema,
  body: z.string(),
  charCount: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
});

export const postDetailResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: postStatusSchema,
  weekNumber: z.number().int().nullable(),
  projectId: z.string().nullable(),
  plannedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  urls: z.record(z.string(), z.string()),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
    }),
  ),
  copy: z.object({
    li: z.string(),
    x: z.string(),
    ig: z.string(),
  }),
  revision: z.number().int().nonnegative(),
  trashedAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const postUpdateSchema = z.object({
  expectedRevision: z.number().int().nonnegative(),
  title: z.string().max(500).optional(),
  status: postStatusSchema.optional(),
  weekNumber: z.number().int().min(1).max(91).nullable().optional(),
  projectId: z.string().nullable().optional(),
  plannedAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  urls: z.record(z.string(), z.string()).optional(),
  copy: z
    .object({
      li: z.string().max(20_000).optional(),
      x: z.string().max(20_000).optional(),
      ig: z.string().max(20_000).optional(),
    })
    .optional(),
});

export const postUpdateResponseSchema = z.object({
  id: z.string(),
  revision: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

export type PostStatus = z.infer<typeof postStatusSchema>;
export type StudioPlatform = z.infer<typeof studioPlatformSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type PostListItem = z.infer<typeof postListItemSchema>;
export type PostListResponse = z.infer<typeof postListResponseSchema>;
export type PostDetailResponse = z.infer<typeof postDetailResponseSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
export type PostUpdateResponse = z.infer<typeof postUpdateResponseSchema>;
