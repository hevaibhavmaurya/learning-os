import { z } from "zod";
import { weekStatusSchema } from "./common";

export const roadmapProjectIdSchema = z.enum([
  "P01",
  "P02",
  "P03",
  "P04",
  "P05",
  "P06",
  "P07",
  "P08",
  "P09",
  "P10",
]);

export const projectListItemSchema = z.object({
  projectId: roadmapProjectIdSchema,
  title: z.string(),
  optional: z.boolean(),
  status: weekStatusSchema,
  learnerConfirmed: z.boolean(),
  skipped: z.boolean(),
  verifiedAt: z.string().nullable(),
  updatedAt: z.string(),
});

export const projectListResponseSchema = z.object({
  roadmap: z.array(projectListItemSchema),
  personal: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string().nullable(),
      status: z.string(),
      trashedAt: z.string().nullable(),
      updatedAt: z.string(),
    }),
  ),
});

export const projectDetailResponseSchema = z.object({
  projectId: roadmapProjectIdSchema,
  title: z.string(),
  optional: z.boolean(),
  status: weekStatusSchema,
  acceptanceEvidence: z.string().nullable(),
  learnerConfirmed: z.boolean(),
  skipped: z.boolean(),
  verifiedAt: z.string().nullable(),
  revision: z.number().int().nonnegative(),
  purpose: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  acceptanceChecks: z.array(z.string()).optional(),
  logs: z.array(
    z.object({
      id: z.string(),
      body: z.string(),
      loggedAt: z.string(),
    }),
  ),
  decisions: z.array(
    z.object({
      id: z.string(),
      decision: z.string(),
      rationale: z.string().nullable(),
      decidedAt: z.string(),
    }),
  ),
  links: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      label: z.string().nullable(),
    }),
  ),
});

export const projectVerifySchema = z.object({
  projectId: roadmapProjectIdSchema,
  expectedRevision: z.number().int().nonnegative(),
  acceptanceEvidence: z.string().min(1).max(20000),
  learnerConfirmed: z.literal(true),
});

export const projectSkipSchema = z.object({
  projectId: z.literal("P02"),
  expectedRevision: z.number().int().nonnegative(),
  skipped: z.literal(true),
});

export const personalProjectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  weekNumber: z.number().int().min(1).max(91).nullable().optional(),
  repoUrl: z.string().max(500).optional(),
  demoUrl: z.string().max(500).optional(),
  notesPlainText: z.string().max(500_000).optional(),
  notesEditorState: z.unknown().optional(),
  fromIdeaId: z.string().optional(),
});

export const personalProjectUpdateSchema = z.object({
  expectedRevision: z.number().int().nonnegative().optional(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(2000).nullable().optional(),
  status: z.enum(["Active", "Paused", "Complete", "active", "paused", "complete"]).optional(),
  milestone: z.string().max(500).nullable().optional(),
  repoUrl: z.string().max(500).nullable().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
  notesPlainText: z.string().max(500_000).optional(),
  notesEditorState: z.unknown().nullable().optional(),
  notesSchemaVersion: z.number().int().positive().optional(),
  weekNumber: z.number().int().min(1).max(91).nullable().optional(),
  weekNumbers: z.array(z.number().int().min(1).max(91)).optional(),
});

export const personalProjectDetailResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  status: z.string(),
  weekNumber: z.number().int().nullable(),
  milestone: z.string().nullable(),
  notesPlainText: z.string(),
  notesEditorState: z.unknown().nullable(),
  notesSchemaVersion: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  logs: z.array(
    z.object({
      id: z.string(),
      body: z.string(),
      loggedAt: z.string(),
    }),
  ),
  decisions: z.array(
    z.object({
      id: z.string(),
      decision: z.string(),
      rationale: z.string().nullable(),
      decidedAt: z.string(),
    }),
  ),
  links: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      label: z.string().nullable(),
    }),
  ),
  trashedAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const ideaSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ideaListResponseSchema = z.object({
  items: z.array(ideaSchema),
});

export const ideaCreateSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const projectLogCreateSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const projectDecisionCreateSchema = z.object({
  decision: z.string().min(1).max(4000),
  rationale: z.string().max(4000).nullable().optional(),
});

export const projectLinksUpdateSchema = z.object({
  repoUrl: z.string().max(500).nullable().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;
export type ProjectDetailResponse = z.infer<typeof projectDetailResponseSchema>;
export type PersonalProjectCreate = z.infer<typeof personalProjectCreateSchema>;
export type PersonalProjectDetailResponse = z.infer<
  typeof personalProjectDetailResponseSchema
>;
export type PersonalProjectUpdate = z.infer<typeof personalProjectUpdateSchema>;
export type IdeaListResponse = z.infer<typeof ideaListResponseSchema>;
export type Idea = z.infer<typeof ideaSchema>;
export type ProjectVerify = z.infer<typeof projectVerifySchema>;
export type ProjectSkip = z.infer<typeof projectSkipSchema>;
