import { createFileRoute, redirect } from "@tanstack/react-router";

/** `/weeks/:n` → `/weeks/:n/overview` */
export const Route = createFileRoute("/_authenticated/weeks/$weekNumber/")({
  beforeLoad: ({ params }) => {
    const n = Number(params.weekNumber);
    const weekNumber = Number.isFinite(n)
      ? String(Math.min(91, Math.max(1, Math.trunc(n))))
      : "1";
    throw redirect({
      to: "/weeks/$weekNumber/$tab",
      params: { weekNumber, tab: "overview" },
      replace: true,
    });
  },
});
