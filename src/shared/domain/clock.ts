/** Injectable clock for pure domain rules and deterministic tests. */
export interface Clock {
  /** Current instant as UTC ISO-8601 string. */
  nowIso(): string;
  /** Current instant as epoch milliseconds. */
  nowMs(): number;
}

/** System wall clock (UTC ISO via Date). */
export function systemClock(): Clock {
  return {
    nowIso() {
      return new Date().toISOString();
    },
    nowMs() {
      return Date.now();
    },
  };
}

/** Fixed clock for tests and screenshots. */
export function fixedClock(isoOrMs: string | number): Clock {
  const ms =
    typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(ms)) {
    throw new Error(`fixedClock: invalid instant ${String(isoOrMs)}`);
  }
  const iso = new Date(ms).toISOString();
  return {
    nowIso: () => iso,
    nowMs: () => ms,
  };
}

/** Add whole days to an ISO instant; returns UTC ISO. */
export function addDaysIso(iso: string, days: number): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) {
    throw new Error(`addDaysIso: invalid instant ${iso}`);
  }
  return new Date(ms + days * 86_400_000).toISOString();
}

/** Elapsed whole days between two ISO instants (floor). */
export function elapsedDays(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    throw new Error("elapsedDays: invalid instant");
  }
  return Math.floor((to - from) / 86_400_000);
}
