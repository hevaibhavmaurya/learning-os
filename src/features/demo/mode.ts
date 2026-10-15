export const DEMO_MODE_STORAGE_KEY = "los.mode";

export type DemoSnapshotId =
  | "fresh"
  | "mid"
  | "failed"
  | "review"
  | "ready"
  | "verified";

export type AppDataMode = "real" | `demo:${DemoSnapshotId}`;

export const DEMO_SNAPSHOT_META: Record<
  DemoSnapshotId,
  { label: string; blurb: string }
> = {
  fresh: { label: "New learner", blurb: "Day one, nothing verified" },
  mid: {
    label: "Mid-progress",
    blurb: "Weeks 1-8 verified, Week 9 in progress",
  },
  failed: {
    label: "Assessment failed",
    blurb: "Week 9 Debug gate at 2, gap opened",
  },
  review: {
    label: "Review due",
    blurb: "Two retention reviews waiting",
  },
  ready: {
    label: "Ready to verify",
    blurb: "Week 9 passing, evidence in, verify pending",
  },
  verified: {
    label: "Verified week",
    blurb: "Week 9 just verified, Week 10 unlocked",
  },
};

export function readDataMode(): AppDataMode {
  try {
    const raw = localStorage.getItem(DEMO_MODE_STORAGE_KEY) || "real";
    if (raw === "real") return "real";
    if (raw.startsWith("demo:")) return raw as AppDataMode;
  } catch {
    /* ignore */
  }
  return "real";
}

export function writeDataMode(mode: AppDataMode): void {
  localStorage.setItem(DEMO_MODE_STORAGE_KEY, mode);
}

export function isDemoMode(mode: AppDataMode = readDataMode()): boolean {
  return mode !== "real";
}

export function demoSnapshotOf(mode: AppDataMode): DemoSnapshotId | null {
  if (mode === "real") return null;
  return mode.slice("demo:".length) as DemoSnapshotId;
}
