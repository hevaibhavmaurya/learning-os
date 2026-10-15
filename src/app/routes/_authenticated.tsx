import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/app/shell/AppShell";
import { authApi } from "@/features/auth/api";
import { sessionProfile } from "@/features/auth/session";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await authApi.session();
    if (!session.authenticated) {
      throw redirect({ to: "/login" });
    }
    return { profile: sessionProfile(session) };
  },
  component: AppShell,
});
