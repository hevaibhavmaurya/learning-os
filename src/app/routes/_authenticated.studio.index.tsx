import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const StudioScreen = lazy(() =>
  import("@/features/studio/screens/StudioScreen").then((m) => ({
    default: m.StudioScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/studio/")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <StudioScreen />
    </Suspense>
  ),
});
