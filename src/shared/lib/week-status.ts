import type { WeekStatusDto } from "@/shared/contracts/common";

/** Display / heatmap state including lock overlay. */
export type WeekDisplayState = WeekStatusDto | "LOCKED";

export const WEEK_STATE_COLORS: Record<WeekDisplayState, string> = {
  VERIFIED: "var(--forest)",
  DONE: "color-mix(in srgb,var(--forest) 45%,transparent)",
  ATTEMPTED: "var(--amber)",
  PLANNED: "color-mix(in srgb,var(--forest) 18%,var(--line))",
  LOCKED: "color-mix(in srgb,var(--line) 55%,transparent)",
};

export const WEEK_STATE_LEGEND: { state: WeekDisplayState; label: string }[] = [
  { state: "VERIFIED", label: "Verified" },
  { state: "DONE", label: "Done, awaiting your verification" },
  { state: "ATTEMPTED", label: "Attempted" },
  { state: "PLANNED", label: "Unlocked" },
  { state: "LOCKED", label: "Locked" },
];

export function statusChipMeta(state: WeekDisplayState): {
  tone: "v" | "a" | "g" | "d" | "default";
  icon: string;
  label: string;
} {
  switch (state) {
    case "VERIFIED":
      return { tone: "v", icon: "badge-check", label: "Verified" };
    case "DONE":
      return { tone: "d", icon: "circle-check", label: "Done, not verified" };
    case "ATTEMPTED":
      return { tone: "a", icon: "pencil-line", label: "Attempted" };
    case "PLANNED":
      return { tone: "default", icon: "circle-dashed", label: "Planned" };
    case "LOCKED":
      return { tone: "default", icon: "lock", label: "Locked" };
  }
}
