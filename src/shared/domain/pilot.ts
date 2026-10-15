import type { Clock } from "./clock";

export const PILOT_CLOCK_DAYS = 28;
export const PILOT_ACTIVATION_WEEK = 43;

export type PilotMode = "REAL" | "SIMULATED";

export interface PilotActivationInput {
  mode: PilotMode;
  consentDocumented: boolean;
  dataUseScope?: string | null;
  /** Week 43 must be unlocked before activation. */
  week43Unlocked: boolean;
}

export interface PilotActivationDecision {
  allowed: boolean;
  mode: PilotMode;
  blockers: string[];
}

/**
 * Pilot activation is a separate manual action when Week 43 is unlocked.
 * REAL requires documented consent/data boundaries; otherwise use SIMULATED.
 */
export function evaluatePilotActivation(
  input: PilotActivationInput,
): PilotActivationDecision {
  const blockers: string[] = [];

  if (!input.week43Unlocked) {
    blockers.push("Week 43 must be unlocked before pilot activation");
  }

  if (input.mode === "REAL") {
    if (!input.consentDocumented) {
      blockers.push(
        "REAL pilot requires documented consent and data-use scope",
      );
    }
    if (!(input.dataUseScope ?? "").trim()) {
      blockers.push("REAL pilot requires an explicit data-use scope");
    }
  }

  // SIMULATED is always an explicit mode choice — no consent required.
  return {
    allowed: blockers.length === 0,
    mode: input.mode,
    blockers,
  };
}

export interface PilotClockInput {
  activatedAt: string | null | undefined;
  clockDays?: number;
  interruptions: readonly { startedAt: string; endedAt?: string | null }[];
  /** Confirmation / observation records present. */
  hasCompletionRecords: boolean;
  learnerConfirmedComplete: boolean;
}

export interface PilotClockStatus {
  elapsedDays: number;
  clockDays: number;
  periodElapsed: boolean;
  /** Four verified course units never imply four completed pilot weeks. */
  canMarkComplete: boolean;
  blockers: string[];
}

/**
 * Independent 28-day pilot clock. Interruptions pause effective elapsed time.
 * Completion requires elapsed period plus records/confirmation — not auto on time alone.
 */
export function evaluatePilotClock(
  input: PilotClockInput,
  clock: Clock,
): PilotClockStatus {
  const clockDays = input.clockDays ?? PILOT_CLOCK_DAYS;
  const blockers: string[] = [];

  if (!input.activatedAt) {
    return {
      elapsedDays: 0,
      clockDays,
      periodElapsed: false,
      canMarkComplete: false,
      blockers: ["Pilot is not activated"],
    };
  }

  const start = Date.parse(input.activatedAt);
  const now = clock.nowMs();
  if (!Number.isFinite(start)) throw new Error("Invalid pilot activation date");
  const pauses = input.interruptions
    .map(({ startedAt, endedAt }) => [
      Math.max(start, Date.parse(startedAt)),
      Math.min(now, endedAt ? Date.parse(endedAt) : now),
    ] as const)
    .filter(([from, to]) => Number.isFinite(from) && Number.isFinite(to) && to > from)
    .sort((a, b) => a[0] - b[0]);
  let pausedMs = 0;
  let pauseEnd = start;
  for (const [from, to] of pauses) {
    pausedMs += Math.max(0, to - Math.max(from, pauseEnd));
    pauseEnd = Math.max(pauseEnd, to);
  }
  const elapsed = Math.max(0, Math.floor((now - start - pausedMs) / 86_400_000));
  const periodElapsed = elapsed >= clockDays;

  if (!periodElapsed) {
    blockers.push(
      `Pilot clock has ${elapsed} of ${clockDays} elapsed days`,
    );
  }
  if (!input.hasCompletionRecords) {
    blockers.push("Pilot completion requires observation/completion records");
  }
  if (!input.learnerConfirmedComplete) {
    blockers.push("Pilot completion requires explicit confirmation");
  }

  return {
    elapsedDays: elapsed,
    clockDays,
    periodElapsed,
    canMarkComplete: blockers.length === 0,
    blockers,
  };
}

/**
 * Changing plan-start date must never move actual activation timestamps.
 * This helper documents the invariant for callers.
 */
export function planStartChangePreservesActivation(
  previousActivatedAt: string | null | undefined,
  nextActivatedAt: string | null | undefined,
): boolean {
  return (previousActivatedAt ?? null) === (nextActivatedAt ?? null);
}
