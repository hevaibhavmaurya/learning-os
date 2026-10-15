/**
 * Demo adapter — talks only to `/api/demo/*` and uses `demo:` Query keys.
 * Never mutates real learner records.
 */
import { apiFetch } from "@/shared/lib/api";
import type { AppDataMode, DemoSnapshotId } from "./mode";
import { DEMO_SNAPSHOTS } from "./snapshots";

export type DemoStatePayload = {
  namespace: "demo";
  isolated: true;
  writesRealTables: false;
  snapshot: DemoSnapshotId;
  modeKey: string;
  state: {
    snapshot: DemoSnapshotId;
    weeks: Record<
      number,
      {
        status: string;
        revision: number;
        title: string;
        gates?: Record<string, number>;
        verifiedAt?: string | null;
      }
    >;
    notes: Array<{ id: string; title: string; body: string }>;
    gaps: Array<{ week: number; gate: string; title: string }>;
    reviewsDue: number;
    resetCount: number;
  };
};

export type DemoSnapshotsPayload = {
  namespace: "demo";
  isolated: true;
  writesRealTables: false;
  active: DemoSnapshotId;
  items: Array<{
    id: DemoSnapshotId;
    label: string;
    blurb: string;
    modeKey: string;
  }>;
};

export const demoAdapter = {
  /** All demo HTTP calls go through this base — never /api/weeks etc. */
  basePath: "/api/demo" as const,

  getState() {
    return apiFetch<DemoStatePayload>(`${this.basePath}/state`);
  },

  listSnapshots() {
    return apiFetch<DemoSnapshotsPayload>(`${this.basePath}/snapshots`);
  },

  async switchMode(mode: AppDataMode) {
    return apiFetch<{
      ok: true;
      mode: string;
      snapshot?: DemoSnapshotId;
      isolated: true;
      writesRealTables: false;
    }>(`${this.basePath}/mode`, {
      method: "POST",
      body: { mode },
    });
  },

  async loadSnapshot(snapshot: DemoSnapshotId) {
    if (!DEMO_SNAPSHOTS.includes(snapshot)) {
      throw new Error(`Unknown demo snapshot: ${snapshot}`);
    }
    return apiFetch<{
      ok: true;
      snapshot: DemoSnapshotId;
      modeKey: string;
      isolated: true;
      writesRealTables: false;
    }>(`${this.basePath}/snapshot`, {
      method: "POST",
      body: { snapshot },
    });
  },

  reset() {
    return apiFetch<{ ok: true; snapshot: DemoSnapshotId; resetCount: number }>(
      `${this.basePath}/reset`,
      { method: "POST" },
    );
  },

  health() {
    return apiFetch<{
      ok: true;
      adapter: string;
      dbBindingPresent: boolean;
      usesDbBinding: false;
    }>(`${this.basePath}/health`);
  },
};
