import { describe, expect, it } from "vitest";
import {
  buildOutOfOrderAudit,
  countVerifiedWeeks,
  evaluateWeekWriteAccess,
  expectedNextWritableWeek,
  type WeekLockState,
} from "../../src/shared/domain/locking";
import { fixedClock } from "../../src/shared/domain/clock";

function weeks(
  entries: Array<[number, WeekLockState["status"], boolean?]>,
): WeekLockState[] {
  return entries.map(([weekNumber, status, overrideActive = false]) => ({
    weekNumber,
    status,
    overrideActive,
  }));
}

describe("locking overrides", () => {
  it("blocks future weeks when locking is enabled without override", () => {
    const state = weeks([
      [1, "VERIFIED"],
      [2, "PLANNED"],
      [5, "PLANNED"],
    ]);
    const decision = evaluateWeekWriteAccess({
      targetWeek: 5,
      writeKind: "attempt",
      weeks: state,
      settings: { lockingEnabled: true },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("locked");
    expect(decision.viaOverride).toBe(false);
  });

  it("opens an overridden week for attempts but never for verify", () => {
    const state = weeks([
      [1, "VERIFIED"],
      [2, "PLANNED"],
      [8, "PLANNED", true],
    ]);
    const attempt = evaluateWeekWriteAccess({
      targetWeek: 8,
      writeKind: "attempt",
      weeks: state,
      settings: { lockingEnabled: true },
    });
    expect(attempt.allowed).toBe(true);
    expect(attempt.viaOverride).toBe(true);

    const verify = evaluateWeekWriteAccess({
      targetWeek: 8,
      writeKind: "verify",
      weeks: state,
      settings: { lockingEnabled: true },
    });
    expect(verify.allowed).toBe(false);
    expect(verify.code).toBe("override_not_verification");
  });

  it("requires out-of-order audit when locking is off", () => {
    const state = weeks([
      [1, "VERIFIED"],
      [2, "PLANNED"],
      [6, "PLANNED"],
    ]);
    const decision = evaluateWeekWriteAccess({
      targetWeek: 6,
      writeKind: "evidence",
      weeks: state,
      settings: { lockingEnabled: false },
    });
    expect(decision.allowed).toBe(true);
    expect(decision.requiresOutOfOrderAudit).toBe(true);

    const expected = expectedNextWritableWeek(state);
    const audit = buildOutOfOrderAudit({
      weekNumber: 6,
      writeKind: "evidence",
      expectedNextWeek: expected,
      clock: fixedClock("2026-03-01T12:00:00.000Z"),
    });
    expect(audit.action).toBe("out_of_order_write");
    expect(audit.detail.lockingEnabled).toBe(false);
    expect(audit.expectedNextWeek).toBe(2);
  });

  it("keeps verified weeks immutable for attempts and evidence", () => {
    const state = weeks([[3, "VERIFIED"]]);
    for (const writeKind of ["attempt", "evidence", "submit_evidence", "verify"] as const) {
      const decision = evaluateWeekWriteAccess({
        targetWeek: 3,
        writeKind,
        weeks: state,
        settings: { lockingEnabled: true },
      });
      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe("verified_immutable");
    }
  });

  it("excludes override-active weeks from verified totals", () => {
    expect(
      countVerifiedWeeks(
        weeks([
          [1, "VERIFIED"],
          [2, "VERIFIED", true],
          [3, "DONE"],
        ]),
      ),
    ).toBe(1);
  });
});
