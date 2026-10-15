import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const ProjectDetailScreen = lazy(() =>
  import("@/features/projects/screens/ProjectDetailScreen").then((m) => ({
    default: m.ProjectDetailScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectRoute,
});

function ProjectRoute() {
  const { projectId } = Route.useParams();
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <ProjectDetailScreen projectId={projectId} />
    </Suspense>
  );
}
