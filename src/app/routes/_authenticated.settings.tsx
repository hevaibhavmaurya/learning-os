import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const SettingsScreen = lazy(() =>
  import("@/features/settings/screens/SettingsScreen").then((m) => ({
    default: m.SettingsScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/settings")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <SettingsScreen />
    </Suspense>
  ),
});
