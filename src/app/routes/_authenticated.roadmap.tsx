import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const RoadmapScreen = lazy(() =>
  import("@/features/roadmap/screens/RoadmapScreen").then((m) => ({
    default: m.RoadmapScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/roadmap")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <RoadmapScreen />
    </Suspense>
  ),
});
