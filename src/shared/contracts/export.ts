import { z } from "zod";

export const exportRequestSchema = z.object({
  includeMediaManifest: z.boolean().default(true),
  includeAudit: z.boolean().default(true),
});

export const exportResponseSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  curriculumHash: z.string().nullable(),
  ruleVersion: z.number().int(),
  owner: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
  /** Opaque versioned payload; structure validated at restore time. */
  payload: z.record(z.string(), z.unknown()),
  mediaManifest: z
    .array(
      z.object({
        id: z.string(),
        r2Key: z.string(),
        contentType: z.string().nullable(),
        byteSize: z.number().int().nullable(),
        checksum: z.string().nullable(),
        status: z.string(),
      }),
    )
    .optional(),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type ExportResponse = z.infer<typeof exportResponseSchema>;
