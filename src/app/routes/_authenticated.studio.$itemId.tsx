import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const StudioItemScreen = lazy(() =>
  import("@/features/studio/screens/StudioItemScreen").then((m) => ({
    default: m.StudioItemScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/studio/$itemId")({
  component: StudioItemRoute,
});

function StudioItemRoute() {
  const { itemId } = Route.useParams();
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <StudioItemScreen itemId={itemId} />
    </Suspense>
  );
}
