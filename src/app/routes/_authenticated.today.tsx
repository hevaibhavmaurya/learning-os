import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const TodayScreen = lazy(() =>
  import("@/features/today/screens/TodayScreen").then((m) => ({
    default: m.TodayScreen,
  })),
);

export const Route = createFileRoute("/_authenticated/today")({
  component: () => (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <TodayScreen />
    </Suspense>
  ),
});
