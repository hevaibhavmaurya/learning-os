import type { SessionResponse } from "@/shared/contracts/auth";
import {
  sessionResponseSchema,
  logoutResponseSchema,
} from "@/shared/contracts/auth";
import { apiFetch } from "@/shared/lib/api";

export const authApi = {
  async session() {
    const data = await apiFetch<SessionResponse>("/api/auth/me");
    return sessionResponseSchema.parse(data);
  },
  async logout() {
    const data = await apiFetch("/api/auth/logout", { method: "POST" });
    return logoutResponseSchema.parse(data);
  },
};
