import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const LibraryScreen = lazy(() =>
  import("@/features/library/screens/LibraryScreen").then((m) => ({
    default: m.LibraryScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/library/")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <LibraryScreen />
    </Suspense>
  ),
});
