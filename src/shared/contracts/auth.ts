import { z } from "zod";

export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  owner: z
    .object({
      id: z.string(),
      email: z.string().email(),
      displayName: z.string().nullable().optional(),
    })
    .nullable(),
  expiresAt: z.string().nullable().optional(),
});

export const logoutResponseSchema = z.object({
  ok: z.literal(true),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
