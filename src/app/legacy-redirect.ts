/**
 * Maps legacy `/?view=` query routes and reference hash routes to canonical paths.
 * Reference hashes: `#/today`, `#/week/9/overview`, `#/library/:id`, etc.
 */

const VIEW_MAP: Record<string, string> = {
  login: "/login",
  today: "/today",
  roadmap: "/roadmap",
  week: "/weeks",
  projects: "/projects",
  library: "/library",
  studio: "/studio",
  content: "/studio",
  progress: "/progress",
  settings: "/settings",
};

const WEEK_TABS = new Set([
  "overview",
  "learn",
  "practise",
  "build",
  "verify",
  "notes",
]);

function weekPath(week: string | null | undefined, tab?: string | null): string {
  const n = Math.min(91, Math.max(1, Number(week) || 1));
  const t = tab && WEEK_TABS.has(tab) ? tab : "overview";
  return `/weeks/${n}/${t}`;
}

/** Resolve a reference-style hash (`#/week/9/overview`) to a path. */
export function pathFromHash(hash: string): string | null {
  const raw = hash.replace(/^#\/?/, "").trim();
  if (!raw) return null;
  const [p, ...rest] = raw.split("/").filter(Boolean);
  if (!p) return null;

  switch (p) {
    case "login":
      return "/login";
    case "today":
      return "/today";
    case "roadmap":
      return "/roadmap";
    case "progress":
      return "/progress";
    case "settings":
      return "/settings";
    case "week": {
      const week = rest[0];
      const tab = rest[1];
      return weekPath(week, tab);
    }
    case "projects":
      return rest[0] ? `/projects/${rest[0]}` : "/projects";
    case "library":
      return rest[0] ? `/library/notes/${rest[0]}` : "/library";
    case "studio":
    case "content":
      return rest[0] ? `/studio/${rest[0]}` : "/studio";
    default:
      return null;
  }
}

/**
 * Resolve legacy `/?view=` (+ optional week/tab/id) or a lingering hash to a
 * canonical path. Returns null when the URL is already canonical / unknown.
 */
export function resolveLegacyRedirect(
  search: URLSearchParams | string,
  hash = "",
): string | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;

  const view = params.get("view");
  if (view) {
    const base = VIEW_MAP[view];
    if (!base) return null;

    if (view === "week") {
      return weekPath(params.get("week"), params.get("tab"));
    }
    if (view === "projects" && params.get("id")) {
      return `/projects/${params.get("id")}`;
    }
    if (view === "library" && params.get("id")) {
      return `/library/notes/${params.get("id")}`;
    }
    if ((view === "studio" || view === "content") && params.get("id")) {
      return `/studio/${params.get("id")}`;
    }
    return base;
  }

  const normalizedHash = hash.replace(/^#/, "").replace(/^\//, "");
  if (normalizedHash) {
    return pathFromHash(hash);
  }

  return null;
}
