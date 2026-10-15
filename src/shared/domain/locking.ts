import type { Clock } from "./clock";

export type WeekStatus = "PLANNED" | "ATTEMPTED" | "DONE" | "VERIFIED";

export interface WeekLockState {
  weekNumber: number;
  status: WeekStatus;
  overrideActive: boolean;
}

export interface LockingSettings {
  lockingEnabled: boolean;
}

export type WriteKind =
  | "attempt"
  | "evidence"
  | "submit_evidence"
  | "verify"
  | "time_entry"
  | "note"
  | "other";

export interface LockDecision {
  /** Whether the write is allowed. */
  allowed: boolean;
  /** Week is locked for mutation (read-ahead still readable). */
  locked: boolean;
  /** Active override opens the week for work but never counts as verification. */
  viaOverride: boolean;
  /** When locking is off and work is out of order, an audit event is required. */
  requiresOutOfOrderAudit: boolean;
  reason?: string;
  code?:
    | "ok"
    | "locked"
    | "verified_immutable"
    | "override_not_verification"
    | "python_unlock_blocked";
}

export interface OutOfOrderAuditEvent {
  action: "out_of_order_write";
  weekNumber: number;
  writeKind: WriteKind;
  expectedNextWeek: number;
  createdAt: string;
  detail: {
    lockingEnabled: false;
    message: string;
  };
}

/**
 * Highest week number that is "open" under sequential locking:
 * next after last verified, with Python W25 unlock respected.
 */
export function expectedNextWritableWeek(
  weeks: readonly WeekLockState[],
  options?: { pythonCheckpointPassed?: boolean },
): number {
  const verified = weeks
    .filter((w) => w.status === "VERIFIED")
    .map((w) => w.weekNumber);
  const maxVerified = verified.length > 0 ? Math.max(...verified) : 0;
  let next = Math.min(91, maxVerified + 1);

  // Python checkpoint: remain on W24 until passed; do not unlock W25.
  if (
    next >= 25 &&
    options?.pythonCheckpointPassed === false &&
    !verified.includes(24)
  ) {
    next = 24;
  }
  if (next === 25 && options?.pythonCheckpointPassed === false) {
    return 24;
  }

  return next === 0 ? 1 : next;
}

/**
 * Decide whether a week-scoped write is allowed.
 * Overrides never count toward verification totals and cannot bypass
 * evidence / independence / mandatory prerequisites / consent / hardware
 * (those checks live in eligibility). Overrides only unlock write access.
 */
export function evaluateWeekWriteAccess(input: {
  targetWeek: number;
  writeKind: WriteKind;
  weeks: readonly WeekLockState[];
  settings: LockingSettings;
  pythonCheckpointPassed?: boolean;
  clock?: Clock;
}): LockDecision {
  const { targetWeek, writeKind, weeks, settings } = input;
  const target = weeks.find((w) => w.weekNumber === targetWeek);
  const status = target?.status ?? "PLANNED";

  if (status === "VERIFIED" && writeKind !== "note" && writeKind !== "time_entry") {
    // Verified attempts/evidence/verify are immutable; notes/time may still attach.
    if (
      writeKind === "attempt" ||
      writeKind === "evidence" ||
      writeKind === "submit_evidence" ||
      writeKind === "verify"
    ) {
      return {
        allowed: false,
        locked: true,
        viaOverride: false,
        requiresOutOfOrderAudit: false,
        code: "verified_immutable",
        reason: `Week ${targetWeek} is VERIFIED and immutable for ${writeKind}`,
      };
    }
  }

  if (writeKind === "verify" && target?.overrideActive) {
    return {
      allowed: false,
      locked: false,
      viaOverride: true,
      requiresOutOfOrderAudit: false,
      code: "override_not_verification",
      reason:
        "Overrides never count as verification; clear override and satisfy eligibility",
    };
  }

  const expected = expectedNextWritableWeek(weeks, {
    pythonCheckpointPassed: input.pythonCheckpointPassed,
  });

  if (!settings.lockingEnabled) {
    const outOfOrder = targetWeek !== expected && status !== "VERIFIED";
    return {
      allowed: true,
      locked: false,
      viaOverride: false,
      requiresOutOfOrderAudit: outOfOrder,
      code: "ok",
    };
  }

  // Locking on: only expected week (or already in-progress non-verified) writable,
  // unless an active override opens this week.
  const inSequence =
    targetWeek === expected ||
    (targetWeek < expected && status !== "VERIFIED" && status !== "PLANNED");

  if (target?.overrideActive) {
    return {
      allowed: writeKind !== "verify",
      locked: false,
      viaOverride: true,
      requiresOutOfOrderAudit: false,
      code: writeKind === "verify" ? "override_not_verification" : "ok",
      reason:
        writeKind === "verify"
          ? "Overrides never count as verification"
          : undefined,
    };
  }

  if (inSequence || targetWeek === expected) {
    if (
      targetWeek === 25 &&
      input.pythonCheckpointPassed === false &&
      writeKind !== "note"
    ) {
      return {
        allowed: false,
        locked: true,
        viaOverride: false,
        requiresOutOfOrderAudit: false,
        code: "python_unlock_blocked",
        reason: "Week 25 unlocks only after the Python checkpoint passes",
      };
    }
    return {
      allowed: true,
      locked: false,
      viaOverride: false,
      requiresOutOfOrderAudit: false,
      code: "ok",
    };
  }

  return {
    allowed: false,
    locked: true,
    viaOverride: false,
    requiresOutOfOrderAudit: false,
    code: "locked",
    reason: `Week ${targetWeek} is locked; expected writable week is ${expected}`,
  };
}

/** Build the audit payload required when locking is off and work is out of order. */
export function buildOutOfOrderAudit(input: {
  weekNumber: number;
  writeKind: WriteKind;
  expectedNextWeek: number;
  clock: Clock;
}): OutOfOrderAuditEvent {
  return {
    action: "out_of_order_write",
    weekNumber: input.weekNumber,
    writeKind: input.writeKind,
    expectedNextWeek: input.expectedNextWeek,
    createdAt: input.clock.nowIso(),
    detail: {
      lockingEnabled: false,
      message: `Out-of-order ${input.writeKind} on week ${input.weekNumber} while expected week is ${input.expectedNextWeek}`,
    },
  };
}

/**
 * Override contribution: never include override weeks in verification totals.
 */
export function countVerifiedWeeks(
  weeks: readonly WeekLockState[],
): number {
  return weeks.filter(
    (w) => w.status === "VERIFIED" && !w.overrideActive,
  ).length;
}
