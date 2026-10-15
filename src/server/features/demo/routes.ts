/**
 * Isolated demo adapter — in-memory only.
 * Never reads or writes production D1 tables / R2.
 * Demo mode cannot bypass production auth in real env.
 */
import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../../env";
import { AppError, parseJson } from "../../middleware/errors";

export const DEMO_SNAPSHOTS = [
  "fresh",
  "mid",
  "failed",
  "review",
  "ready",
  "verified",
] as const;

export type DemoSnapshotId = (typeof DEMO_SNAPSHOTS)[number];

type DemoWeek = {
  status: "PLANNED" | "ATTEMPTED" | "DONE" | "VERIFIED";
  revision: number;
  title: string;
  gates?: { recall: number; build: number; debug: number; transfer: number };
  verifiedAt?: string | null;
};

type DemoState = {
  snapshot: DemoSnapshotId;
  weeks: Record<number, DemoWeek>;
  notes: Array<{ id: string; title: string; body: string }>;
  gaps: Array<{ week: number; gate: string; title: string }>;
  reviewsDue: number;
  resetCount: number;
};

const store = new Map<string, DemoState>();

const SNAPSHOT_LABELS: Record<DemoSnapshotId, string> = {
  fresh: "New learner",
  mid: "Mid-progress",
  failed: "Assessment failed",
  review: "Review due",
  ready: "Ready to verify",
  verified: "Verified week",
};

const SNAPSHOT_BLURBS: Record<DemoSnapshotId, string> = {
  fresh: "Day one, nothing verified",
  mid: "Weeks 1-8 verified, Week 9 in progress",
  failed: "Week 9 Debug gate at 2, gap opened",
  review: "Two retention reviews waiting",
  ready: "Week 9 passing, evidence in, verify pending",
  verified: "Week 9 just verified, Week 10 unlocked",
};

function demoKey(env: AppEnv["Bindings"], snapshot: DemoSnapshotId): string {
  return `demo:${env.OWNER_EMAIL}:${snapshot}`;
}

function activeKey(env: AppEnv["Bindings"]): string {
  return `demo:active:${env.OWNER_EMAIL}`;
}

function buildSnapshot(snapshot: DemoSnapshotId): DemoState {
  const now = new Date().toISOString();
  const baseVerified = (): Record<number, DemoWeek> => {
    const weeks: Record<number, DemoWeek> = {};
    for (let n = 1; n <= 8; n++) {
      weeks[n] = {
        status: "VERIFIED",
        revision: 1,
        title: `Demo Week ${n}`,
        gates: { recall: 3, build: 3, debug: 3, transfer: 3 },
        verifiedAt: now,
      };
    }
    return weeks;
  };

  switch (snapshot) {
    case "fresh":
      return {
        snapshot,
        weeks: {
          1: { status: "PLANNED", revision: 0, title: "Demo Week 1" },
        },
        notes: [],
        gaps: [],
        reviewsDue: 0,
        resetCount: 0,
      };
    case "mid": {
      const weeks = baseVerified();
      weeks[9] = {
        status: "PLANNED",
        revision: 0,
        title: "Transactions and concurrency",
        verifiedAt: null,
      };
      return {
        snapshot,
        weeks,
        notes: [
          {
            id: "demo_note_1",
            title: "Isolation levels, in my own words",
            body: "Isolated demo body",
          },
        ],
        gaps: [],
        reviewsDue: 0,
        resetCount: 0,
      };
    }
    case "failed": {
      const weeks = baseVerified();
      weeks[9] = {
        status: "ATTEMPTED",
        revision: 1,
        title: "Transactions and concurrency",
        gates: { recall: 3, build: 4, debug: 2, transfer: 3 },
        verifiedAt: null,
      };
      return {
        snapshot,
        weeks,
        notes: [
          {
            id: "demo_note_1",
            title: "Isolation levels, in my own words",
            body: "Isolated demo body",
          },
        ],
        gaps: [
          {
            week: 9,
            gate: "debug",
            title: "Debug gap in Week 9: Transactions and concurrency",
          },
        ],
        reviewsDue: 0,
        resetCount: 0,
      };
    }
    case "review": {
      const weeks = baseVerified();
      weeks[9] = {
        status: "PLANNED",
        revision: 0,
        title: "Transactions and concurrency",
        verifiedAt: null,
      };
      return {
        snapshot,
        weeks,
        notes: [],
        gaps: [],
        reviewsDue: 2,
        resetCount: 0,
      };
    }
    case "ready": {
      const weeks = baseVerified();
      weeks[9] = {
        status: "DONE",
        revision: 2,
        title: "Transactions and concurrency",
        gates: { recall: 3, build: 4, debug: 3, transfer: 4 },
        verifiedAt: null,
      };
      return {
        snapshot,
        weeks,
        notes: [],
        gaps: [],
        reviewsDue: 0,
        resetCount: 0,
      };
    }
    case "verified": {
      const weeks = baseVerified();
      weeks[9] = {
        status: "VERIFIED",
        revision: 2,
        title: "Transactions and concurrency",
        gates: { recall: 3, build: 4, debug: 3, transfer: 4 },
        verifiedAt: now,
      };
      weeks[10] = {
        status: "PLANNED",
        revision: 0,
        title: "Demo Week 10",
        verifiedAt: null,
      };
      return {
        snapshot,
        weeks,
        notes: [],
        gaps: [],
        reviewsDue: 0,
        resetCount: 0,
      };
    }
  }
}

function assertDemoAllowed(env: AppEnv["Bindings"]) {
  const isProd = (env.ENVIRONMENT ?? "").toLowerCase() === "production";
  if (isProd) {
    throw new AppError(
      "demo_disabled",
      "Demo mode is disabled in production",
      403,
    );
  }
}

function getActiveSnapshot(env: AppEnv["Bindings"]): DemoSnapshotId {
  const raw = store.get(activeKey(env));
  if (raw && DEMO_SNAPSHOTS.includes(raw.snapshot)) return raw.snapshot;
  return "mid";
}

function loadState(env: AppEnv["Bindings"], snapshot: DemoSnapshotId): DemoState {
  const key = demoKey(env, snapshot);
  const existing = store.get(key);
  if (existing) return existing;
  const state = buildSnapshot(snapshot);
  store.set(key, state);
  return state;
}

export const demoRoutes = new Hono<AppEnv>();

demoRoutes.use("*", async (c, next) => {
  assertDemoAllowed(c.env);
  await next();
});

demoRoutes.get("/snapshots", (c) => {
  return c.json({
    namespace: "demo",
    isolated: true,
    writesRealTables: false,
    active: getActiveSnapshot(c.env),
    items: DEMO_SNAPSHOTS.map((id) => ({
      id,
      label: SNAPSHOT_LABELS[id],
      blurb: SNAPSHOT_BLURBS[id],
      modeKey: `demo:${id}`,
    })),
  });
});

demoRoutes.get("/state", (c) => {
  const snapshot = getActiveSnapshot(c.env);
  const state = loadState(c.env, snapshot);
  store.set(activeKey(c.env), state);
  return c.json({
    namespace: "demo",
    isolated: true,
    writesRealTables: false,
    snapshot,
    modeKey: `demo:${snapshot}`,
    state,
  });
});

demoRoutes.post("/snapshot", async (c) => {
  const body = await parseJson(
    c,
    z.object({
      snapshot: z.enum(DEMO_SNAPSHOTS),
    }),
  );
  const state = loadState(c.env, body.snapshot);
  store.set(activeKey(c.env), state);
  return c.json({
    ok: true,
    snapshot: body.snapshot,
    modeKey: `demo:${body.snapshot}`,
    isolated: true,
    writesRealTables: false,
  });
});

demoRoutes.post("/mode", async (c) => {
  const body = await parseJson(
    c,
    z.object({
      mode: z.union([
        z.literal("real"),
        z.enum([
          "demo:fresh",
          "demo:mid",
          "demo:failed",
          "demo:review",
          "demo:ready",
          "demo:verified",
        ]),
      ]),
    }),
  );
  if (body.mode === "real") {
    return c.json({
      ok: true,
      mode: "real",
      isolated: true,
      writesRealTables: false,
      note: "Switched client to real records; demo store untouched",
    });
  }
  const snapshot = body.mode.slice("demo:".length) as DemoSnapshotId;
  const state = loadState(c.env, snapshot);
  store.set(activeKey(c.env), state);
  return c.json({
    ok: true,
    mode: body.mode,
    snapshot,
    isolated: true,
    writesRealTables: false,
  });
});

demoRoutes.post("/reset", async (c) => {
  const snapshot = getActiveSnapshot(c.env);
  const key = demoKey(c.env, snapshot);
  const prev = store.get(key);
  const state = buildSnapshot(snapshot);
  state.resetCount = (prev?.resetCount ?? 0) + 1;
  store.set(key, state);
  store.set(activeKey(c.env), state);
  return c.json({ ok: true, snapshot, resetCount: state.resetCount });
});

demoRoutes.post("/weeks/:weekNumber/status", async (c) => {
  const body = await parseJson(
    c,
    z.object({
      status: z.enum(["PLANNED", "ATTEMPTED", "DONE", "VERIFIED"]),
    }),
  );
  const weekNumber = Number(c.req.param("weekNumber"));
  const snapshot = getActiveSnapshot(c.env);
  const state = loadState(c.env, snapshot);
  const week = state.weeks[weekNumber] ?? {
    status: "PLANNED" as const,
    revision: 0,
    title: `Demo Week ${weekNumber}`,
  };
  week.status = body.status;
  week.revision += 1;
  state.weeks[weekNumber] = week;
  store.set(demoKey(c.env, snapshot), state);
  store.set(activeKey(c.env), state);
  return c.json({ weekNumber, ...week, writesRealTables: false });
});

/** Explicit proof that demo never touches c.env.DB. */
demoRoutes.get("/health", (c) => {
  return c.json({
    ok: true,
    adapter: "demo-memory",
    dbBindingPresent: Boolean(c.env.DB),
    usesDbBinding: false,
  });
});
