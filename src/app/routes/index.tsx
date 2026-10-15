import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveLegacyRedirect } from "@/app/legacy-redirect";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    const legacy = resolveLegacyRedirect(
      location.searchStr.startsWith("?")
        ? location.searchStr.slice(1)
        : location.searchStr,
      location.hash,
    );
    throw redirect({ to: legacy ?? "/today", replace: true });
  },
});
