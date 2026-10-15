import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const ProgressScreen = lazy(() =>
  import("@/features/progress/screens/ProgressScreen").then((m) => ({
    default: m.ProgressScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/progress")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <ProgressScreen />
    </Suspense>
  ),
});
