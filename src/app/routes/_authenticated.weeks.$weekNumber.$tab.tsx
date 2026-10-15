import { lazy, Suspense } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";
import { WEEK_TABS, type WeekTab } from "@/app/shell/nav";

const WeekScreen = lazy(() =>
  import("@/features/weeks/screens/WeekScreen").then((m) => ({
    default: m.WeekScreen,
  })),
);

function parseWeek(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(91, Math.max(1, Math.trunc(n)));
}

function parseTab(raw: string): WeekTab {
  return (WEEK_TABS as readonly string[]).includes(raw)
    ? (raw as WeekTab)
    : "overview";
}

export const Route = createFileRoute("/_authenticated/weeks/$weekNumber/$tab")({
  beforeLoad: ({ params }) => {
    const weekNumber = String(parseWeek(params.weekNumber));
    const tab = parseTab(params.tab);
    if (weekNumber !== params.weekNumber || tab !== params.tab) {
      throw redirect({
        to: "/weeks/$weekNumber/$tab",
        params: { weekNumber, tab },
        replace: true,
      });
    }
  },
  component: WeekRoute,
});

function WeekRoute() {
  const { weekNumber, tab } = Route.useParams();
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <WeekScreen weekNumber={parseWeek(weekNumber)} tab={parseTab(tab)} />
    </Suspense>
  );
}
