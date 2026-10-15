import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  settingsPatchSchema,
  settingsResponseSchema,
} from "../../../shared/contracts/settings";
import {
  evaluatePilotActivation,
  evaluatePilotClock,
  PILOT_ACTIVATION_WEEK,
} from "../../../shared/domain/pilot";
import { systemClock } from "../../../shared/domain/clock";
import { expectedNextWritableWeek } from "../../../shared/domain/locking";
import { createDb } from "../../db/client";
import {
  auditEvents,
  overrides,
  pilotInterruptions,
  pilotRecords,
  settings,
} from "../../db/schema";
import type { AppEnv } from "../../env";
import { createId } from "../../lib/ids";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { AppError, parseJson } from "../../middleware/errors";
import { loadLockingContext } from "../weeks/queries";

export const settingsRoutes = new Hono<AppEnv>();
settingsRoutes.use("*", requireAuthMiddleware());

async function loadSettings(env: AppEnv["Bindings"], ownerId: string, email: string) {
  const db = createDb(env.DB);
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.ownerId, ownerId))
    .get();
  if (!row) {
    throw new AppError("settings_missing", "Settings not seeded", 500);
  }
  return settingsResponseSchema.parse({
    planStartDate: row.planStartDate,
    timezone: row.timezone,
    lockingEnabled: row.lockingEnabled,
    theme: row.theme as "system" | "light" | "dark",
    curriculumHash: row.curriculumHash,
    ruleVersion: row.ruleVersion,
    ownerEmail: email,
    updatedAt: row.updatedAt,
  });
}

settingsRoutes.get("/", async (c) => {
  const owner = requireOwner(c);
  return c.json(await loadSettings(c.env, owner.id, owner.email));
});

settingsRoutes.patch("/", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(c, settingsPatchSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.ownerId, owner.id))
    .get();
  if (!existing) throw new AppError("settings_missing", "Settings not seeded", 500);

  // Plan-start changes must not move activation timestamps (invariant).
  await db
    .update(settings)
    .set({
      planStartDate:
        body.planStartDate !== undefined
          ? body.planStartDate
          : existing.planStartDate,
      timezone: body.timezone ?? existing.timezone,
      lockingEnabled:
        body.lockingEnabled !== undefined
          ? body.lockingEnabled
          : existing.lockingEnabled,
      theme: body.theme ?? existing.theme,
      updatedAt: now,
    })
    .where(eq(settings.ownerId, owner.id))
    .run();

  if (
    body.lockingEnabled !== undefined &&
    body.lockingEnabled !== existing.lockingEnabled
  ) {
    await db
      .insert(auditEvents)
      .values({
        id: createId("aud_"),
        ownerId: owner.id,
        action: body.lockingEnabled ? "locking_enabled" : "locking_disabled",
        entityType: "settings",
        entityId: owner.id,
        weekNumber: null,
        operationId: null,
        detailJson: JSON.stringify({ previous: existing.lockingEnabled }),
        createdAt: now,
      })
      .run();
  }

  return c.json(await loadSettings(c.env, owner.id, owner.email));
});

settingsRoutes.post("/overrides", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      weekNumber: z.number().int().min(1).max(91),
      reason: z.string().min(1).max(2000),
    }),
  );
  const now = new Date().toISOString();
  const id = createId("ovr_");

  await envBatchCreateOverride(c.env.DB, {
    id,
    ownerId: owner.id,
    weekNumber: body.weekNumber,
    reason: body.reason,
    now,
  });

  return c.json({ id, weekNumber: body.weekNumber, active: true }, 201);
});

async function envBatchCreateOverride(
  d1: D1Database,
  input: {
    id: string;
    ownerId: string;
    weekNumber: number;
    reason: string;
    now: string;
  },
) {
  await d1.batch([
    d1
      .prepare(
        `INSERT INTO overrides (id, owner_id, week_number, reason, active, created_at, revoked_at)
         VALUES (?, ?, ?, ?, 1, ?, NULL)`,
      )
      .bind(
        input.id,
        input.ownerId,
        input.weekNumber,
        input.reason,
        input.now,
      ),
    d1
      .prepare(
        `INSERT INTO week_progress (
          id, owner_id, week_number, status, revision, latest_attempt_id, verified_at,
          curriculum_hash, rule_version, override_active, created_at, updated_at
        ) VALUES (?, ?, ?, 'PLANNED', 0, NULL, NULL, NULL, NULL, 1, ?, ?)
        ON CONFLICT(owner_id, week_number) DO UPDATE SET
          override_active = 1, updated_at = excluded.updated_at`,
      )
      .bind(
        `wp_${input.ownerId.slice(-8)}_${input.weekNumber}`,
        input.ownerId,
        input.weekNumber,
        input.now,
        input.now,
      ),
    d1
      .prepare(
        `INSERT INTO audit_events (
          id, owner_id, action, entity_type, entity_id, week_number, operation_id, detail_json, created_at
        ) VALUES (?, ?, 'override_created', 'week', ?, ?, NULL, ?, ?)`,
      )
      .bind(
        createId("aud_"),
        input.ownerId,
        String(input.weekNumber),
        input.weekNumber,
        JSON.stringify({ reason: input.reason }),
        input.now,
      ),
  ]);
}

settingsRoutes.post("/overrides/:id/revoke", async (c) => {
  const owner = requireOwner(c);
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const row = await db
    .select()
    .from(overrides)
    .where(and(eq(overrides.id, id), eq(overrides.ownerId, owner.id)))
    .get();
  if (!row) throw new AppError("not_found", "Override not found", 404);

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE overrides SET active = 0, revoked_at = ? WHERE id = ? AND owner_id = ?`,
    ).bind(now, id, owner.id),
    c.env.DB.prepare(
      `UPDATE week_progress SET override_active = 0, updated_at = ?
       WHERE owner_id = ? AND week_number = ?`,
    ).bind(now, owner.id, row.weekNumber),
  ]);

  return c.json({ id, active: false, revokedAt: now });
});

settingsRoutes.get("/overrides", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const items = await db
    .select({
      id: overrides.id,
      weekNumber: overrides.weekNumber,
      reason: overrides.reason,
      active: overrides.active,
      createdAt: overrides.createdAt,
      revokedAt: overrides.revokedAt,
    })
    .from(overrides)
    .where(eq(overrides.ownerId, owner.id))
    .all();
  return c.json({ items });
});

settingsRoutes.get("/pilot", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const pilot = await db
    .select()
    .from(pilotRecords)
    .where(eq(pilotRecords.ownerId, owner.id))
    .get();
  if (!pilot) {
    return c.json({ activated: false, pilot: null, clock: null });
  }
  const interruptions = await db
    .select({
      id: pilotInterruptions.id,
      startedAt: pilotInterruptions.startedAt,
      endedAt: pilotInterruptions.endedAt,
    })
    .from(pilotInterruptions)
    .where(eq(pilotInterruptions.pilotId, pilot.id))
    .all();
  const clock = evaluatePilotClock(
    {
      activatedAt: pilot.activatedAt,
      clockDays: pilot.clockDays,
      interruptions,
      hasCompletionRecords: Boolean(pilot.observations),
      learnerConfirmedComplete: Boolean(pilot.completedAt),
    },
    systemClock(),
  );
  return c.json({
    activated: Boolean(pilot.activatedAt),
    pilot: {
      id: pilot.id,
      mode: pilot.mode,
      consentDocumented: pilot.consentDocumented,
      dataUseScope: pilot.dataUseScope,
      activatedAt: pilot.activatedAt,
      completedAt: pilot.completedAt,
      observations: pilot.observations,
      interruptionCount: interruptions.length,
      activeInterruptionId: interruptions.find((item) => !item.endedAt)?.id ?? null,
    },
    clock,
  });
});

settingsRoutes.post("/pilot/activate", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      mode: z.enum(["REAL", "SIMULATED"]),
      consentDocumented: z.boolean().default(false),
      dataUseScope: z.string().max(4000).optional(),
    }),
  );
  const ctx = await loadLockingContext(c.env, owner.id);
  const next = expectedNextWritableWeek(ctx.weeks, {
    pythonCheckpointPassed: ctx.pythonCheckpointPassed,
  });
  const week43Unlocked =
    next > PILOT_ACTIVATION_WEEK ||
    ctx.weeks.some(
      (w) =>
        w.weekNumber === PILOT_ACTIVATION_WEEK && w.status !== "PLANNED",
    ) ||
    ctx.weeks.some(
      (w) => w.weekNumber >= PILOT_ACTIVATION_WEEK && w.status === "VERIFIED",
    ) ||
    !ctx.lockingEnabled;

  const decision = evaluatePilotActivation({
    mode: body.mode,
    consentDocumented: body.consentDocumented,
    dataUseScope: body.dataUseScope,
    week43Unlocked,
  });
  if (!decision.allowed) {
    throw new AppError(
      "pilot_blocked",
      decision.blockers.join("; "),
      400,
    );
  }

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(pilotRecords)
    .where(eq(pilotRecords.ownerId, owner.id))
    .get();
  if (existing?.activatedAt) {
    throw new AppError("pilot_already_active", "Pilot already activated", 409);
  }

  const id = existing?.id ?? createId("pilot_");
  if (existing) {
    await db
      .update(pilotRecords)
      .set({
        mode: body.mode,
        consentDocumented: body.consentDocumented,
        dataUseScope: body.dataUseScope ?? null,
        activatedAt: now,
        updatedAt: now,
      })
      .where(eq(pilotRecords.id, id))
      .run();
  } else {
    await db
      .insert(pilotRecords)
      .values({
        id,
        ownerId: owner.id,
        mode: body.mode,
        consentDocumented: body.consentDocumented,
        dataUseScope: body.dataUseScope ?? null,
        activatedAt: now,
        completedAt: null,
        clockDays: 28,
        observations: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  return c.json({ id, mode: body.mode, activatedAt: now }, 201);
});

settingsRoutes.post("/pilot/interruptions", async (c) => {
  const owner = requireOwner(c);
  const body = await parseJson(
    c,
    z.object({
      reason: z.string().max(2000).optional(),
    }),
  );
  const db = createDb(c.env.DB);
  const pilot = await db
    .select()
    .from(pilotRecords)
    .where(eq(pilotRecords.ownerId, owner.id))
    .get();
  if (!pilot?.activatedAt) {
    throw new AppError("pilot_inactive", "Pilot is not activated", 400);
  }
  const active = await db.select({ id: pilotInterruptions.id })
    .from(pilotInterruptions)
    .where(and(eq(pilotInterruptions.pilotId, pilot.id), isNull(pilotInterruptions.endedAt)))
    .get();
  if (active) throw new AppError("pilot_already_paused", "Resume the current interruption first", 409);
  const now = new Date().toISOString();
  const id = createId("pint_");
  await db
    .insert(pilotInterruptions)
    .values({
      id,
      ownerId: owner.id,
      pilotId: pilot.id,
      startedAt: now,
      endedAt: null,
      reason: body.reason ?? null,
      createdAt: now,
    })
    .run();
  return c.json({ id, startedAt: now }, 201);
});

settingsRoutes.post("/pilot/interruptions/resume", async (c) => {
  const owner = requireOwner(c);
  const db = createDb(c.env.DB);
  const pilot = await db.select({ id: pilotRecords.id, activatedAt: pilotRecords.activatedAt })
    .from(pilotRecords).where(eq(pilotRecords.ownerId, owner.id)).get();
  if (!pilot?.activatedAt) throw new AppError("pilot_inactive", "Pilot is not activated", 400);
  const active = await db.select({ id: pilotInterruptions.id })
    .from(pilotInterruptions)
    .where(and(eq(pilotInterruptions.pilotId, pilot.id), isNull(pilotInterruptions.endedAt)))
    .orderBy(desc(pilotInterruptions.startedAt)).get();
  if (!active) throw new AppError("pilot_not_paused", "No active interruption", 409);
  const endedAt = new Date().toISOString();
  await db.update(pilotInterruptions).set({ endedAt })
    .where(and(eq(pilotInterruptions.id, active.id), eq(pilotInterruptions.ownerId, owner.id), isNull(pilotInterruptions.endedAt)))
    .run();
  return c.json({ id: active.id, endedAt });
});

settingsRoutes.get("/audit", async (c) => {
  const owner = requireOwner(c);
  const limitRaw = Number(c.req.query("limit") ?? 30);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(100, Math.max(1, Math.trunc(limitRaw)))
    : 30;
  const db = createDb(c.env.DB);
  const items = await db
    .select({
      id: auditEvents.id,
      action: auditEvents.action,
      detailJson: auditEvents.detailJson,
      weekNumber: auditEvents.weekNumber,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .where(eq(auditEvents.ownerId, owner.id))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit)
    .all();

  return c.json({
    items: items.map((a) => {
      let detail = "";
      if (a.detailJson) {
        try {
          const parsed = JSON.parse(a.detailJson) as unknown;
          if (typeof parsed === "string") detail = parsed;
          else if (
            parsed &&
            typeof parsed === "object" &&
            "message" in parsed &&
            typeof (parsed as { message: unknown }).message === "string"
          ) {
            detail = (parsed as { message: string }).message;
          } else if (
            parsed &&
            typeof parsed === "object" &&
            "reason" in parsed &&
            typeof (parsed as { reason: unknown }).reason === "string"
          ) {
            detail = (parsed as { reason: string }).reason;
          } else detail = a.detailJson;
        } catch {
          detail = a.detailJson;
        }
      }
      return {
        id: a.id,
        action: a.action,
        detail,
        weekNumber: a.weekNumber,
        createdAt: a.createdAt,
      };
    }),
  });
});
