import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const ProjectsScreen = lazy(() =>
  import("@/features/projects/screens/ProjectsScreen").then((m) => ({
    default: m.ProjectsScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/projects/")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <ProjectsScreen />
    </Suspense>
  ),
});
