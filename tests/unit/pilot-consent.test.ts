import { describe, expect, it } from "vitest";
import {
  evaluatePilotActivation,
  evaluatePilotClock,
  planStartChangePreservesActivation,
  PILOT_ACTIVATION_WEEK,
} from "../../src/shared/domain/pilot";
import { fixedClock } from "../../src/shared/domain/clock";
import { prerequisiteBlockersForWeek } from "../../src/shared/domain/prerequisites";

describe("pilot consent", () => {
  it("blocks REAL activation without consent and data-use scope", () => {
    const decision = evaluatePilotActivation({
      mode: "REAL",
      consentDocumented: false,
      dataUseScope: "",
      week43Unlocked: true,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /consent/i.test(b))).toBe(true);
    expect(decision.blockers.some((b) => /data-use/i.test(b))).toBe(true);
  });

  it("allows REAL when consent and scope are documented", () => {
    const decision = evaluatePilotActivation({
      mode: "REAL",
      consentDocumented: true,
      dataUseScope: "Internal study notes only; no third-party share",
      week43Unlocked: true,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.mode).toBe("REAL");
  });

  it("allows SIMULATED without consent", () => {
    const decision = evaluatePilotActivation({
      mode: "SIMULATED",
      consentDocumented: false,
      week43Unlocked: true,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.mode).toBe("SIMULATED");
  });

  it("requires Week 43 unlocked before activation", () => {
    const decision = evaluatePilotActivation({
      mode: "SIMULATED",
      consentDocumented: false,
      week43Unlocked: false,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => b.includes(String(PILOT_ACTIVATION_WEEK)))).toBe(
      true,
    );
  });

  it("surfaces pilot_consent prerequisite when mode is not ready", () => {
    const blockers = prerequisiteBlockersForWeek(43, [], {
      pilotModeReady: false,
    });
    expect(blockers.some((b) => b.prerequisiteId === "pilot_consent")).toBe(
      true,
    );
  });

  it("does not auto-complete when the 28-day clock elapses alone", () => {
    const clock = fixedClock("2026-02-20T00:00:00.000Z");
    const status = evaluatePilotClock(
      {
        activatedAt: "2026-01-01T00:00:00.000Z",
        interruptions: [],
        hasCompletionRecords: false,
        learnerConfirmedComplete: false,
      },
      clock,
    );
    expect(status.periodElapsed).toBe(true);
    expect(status.canMarkComplete).toBe(false);
    expect(status.blockers.length).toBeGreaterThan(0);
  });

  it("subtracts partial-day interruptions and does not double-count overlaps", () => {
    const status = evaluatePilotClock({
      activatedAt: "2026-01-01T00:00:00.000Z",
      interruptions: [
        { startedAt: "2026-01-03T00:00:00.000Z", endedAt: "2026-01-03T12:00:00.000Z" },
        { startedAt: "2026-01-03T06:00:00.000Z", endedAt: "2026-01-03T18:00:00.000Z" },
        { startedAt: "2026-01-04T00:00:00.000Z", endedAt: "2026-01-04T12:00:00.000Z" },
      ],
      hasCompletionRecords: false,
      learnerConfirmedComplete: false,
    }, fixedClock("2026-01-06T00:00:00.000Z"));
    expect(status.elapsedDays).toBe(3);
  });

  it("preserves activation timestamps when plan-start changes", () => {
    expect(
      planStartChangePreservesActivation(
        "2026-01-10T00:00:00.000Z",
        "2026-01-10T00:00:00.000Z",
      ),
    ).toBe(true);
    expect(
      planStartChangePreservesActivation(
        "2026-01-10T00:00:00.000Z",
        "2026-02-01T00:00:00.000Z",
      ),
    ).toBe(false);
  });
});
