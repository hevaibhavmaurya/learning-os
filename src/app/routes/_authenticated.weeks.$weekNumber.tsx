import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for /weeks/:weekNumber/* — must NOT redirect here.
 * Parent beforeLoad runs for child tab routes; a redirect would loop.
 * Exact /weeks/:n → overview is handled by the index route.
 */
export const Route = createFileRoute("/_authenticated/weeks/$weekNumber")({
  component: () => <Outlet />,
});
