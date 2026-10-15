import { lazy, Suspense } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authApi } from "@/features/auth/api";
import { Skeleton } from "@/components/ui/Skeleton";

const LoginScreen = lazy(() =>
  import("@/features/auth/screens/LoginScreen").then((m) => ({
    default: m.LoginScreen,
  })),
);

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if ((await authApi.session()).authenticated) {
      throw redirect({ to: "/today" });
    }
  },
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <LoginScreen />
    </Suspense>
  );
}
