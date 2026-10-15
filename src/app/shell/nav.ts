export type NavItem = {
  id: string;
  to: string;
  label: string;
  shortLabel: string;
  icon: string;
};

/** Six primary destinations — icons match reference NAV. */
export const NAV_ITEMS: NavItem[] = [
  { id: "today", to: "/today", label: "Today", shortLabel: "Today", icon: "sun" },
  {
    id: "roadmap",
    to: "/roadmap",
    label: "Roadmap",
    shortLabel: "Roadmap",
    icon: "map",
  },
  {
    id: "projects",
    to: "/projects",
    label: "Projects",
    shortLabel: "Projects",
    icon: "folder-kanban",
  },
  {
    id: "library",
    to: "/library",
    label: "Library",
    shortLabel: "Library",
    icon: "library",
  },
  {
    id: "studio",
    to: "/studio",
    label: "Content Studio",
    shortLabel: "Studio",
    icon: "pen-tool",
  },
  {
    id: "progress",
    to: "/progress",
    label: "Progress",
    shortLabel: "Progress",
    icon: "chart-line",
  },
];

export const WEEK_TABS = [
  "overview",
  "learn",
  "practise",
  "build",
  "verify",
  "notes",
] as const;

export type WeekTab = (typeof WEEK_TABS)[number];

export function activeNavId(pathname: string): string | null {
  if (pathname.startsWith("/weeks")) return "roadmap";
  if (pathname.startsWith("/settings")) return "settings";
  const hit = NAV_ITEMS.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return hit?.id ?? null;
}
