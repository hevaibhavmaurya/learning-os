import { z } from "zod";

export const settingsResponseSchema = z.object({
  planStartDate: z.string().nullable(),
  timezone: z.string(),
  lockingEnabled: z.boolean(),
  theme: z.enum(["system", "light", "dark"]),
  curriculumHash: z.string().nullable(),
  ruleVersion: z.number().int(),
  ownerEmail: z.string().email(),
  updatedAt: z.string(),
});

export const settingsPatchSchema = z
  .object({
    planStartDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    timezone: z.string().min(1).max(64).optional(),
    lockingEnabled: z.boolean().optional(),
    theme: z.enum(["system", "light", "dark"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one settings field is required",
  });

export const settingsPatchResponseSchema = settingsResponseSchema;

export type SettingsResponse = z.infer<typeof settingsResponseSchema>;
export type SettingsPatch = z.infer<typeof settingsPatchSchema>;
