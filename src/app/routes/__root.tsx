import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { resolveLegacyRedirect } from "@/app/legacy-redirect";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const legacy = resolveLegacyRedirect(
      location.searchStr.startsWith("?")
        ? location.searchStr.slice(1)
        : location.searchStr,
      location.hash,
    );
    if (legacy && legacy !== location.pathname) {
      throw redirect({ to: legacy, replace: true });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
