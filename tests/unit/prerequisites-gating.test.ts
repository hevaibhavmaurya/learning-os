import { describe, expect, it } from "vitest";
import {
  prerequisiteBlockersForWeek,
  pythonUnlocksWeek25,
  systemsAllowsStage2Verification,
  type PrerequisiteState,
} from "../../src/shared/domain/prerequisites";
import {
  evaluateWeekWriteAccess,
  expectedNextWritableWeek,
} from "../../src/shared/domain/locking";
import { evaluateVerificationEligibility } from "../../src/shared/domain/eligibility";
import {
  evaluateProjectAcceptance,
  skippingP02BlocksCurriculum,
} from "../../src/shared/domain/projects";

const passed = (id: PrerequisiteState["prerequisiteId"]): PrerequisiteState => ({
  prerequisiteId: id,
  passed: true,
  confirmedAt: "2026-01-01T00:00:00.000Z",
});

describe("python gating W24/W25", () => {
  it("blocks W24 verify without python checkpoint", () => {
    const blockers = prerequisiteBlockersForWeek(24, []);
    expect(blockers.some((b) => b.prerequisiteId === "python_w24")).toBe(true);
  });

  it("keeps W25 locked until python passes", () => {
    expect(pythonUnlocksWeek25([])).toBe(false);
    expect(pythonUnlocksWeek25([passed("python_w24")])).toBe(true);

    const next = expectedNextWritableWeek(
      [{ weekNumber: 24, status: "VERIFIED", overrideActive: false }],
      { pythonCheckpointPassed: false },
    );
    expect(next).toBe(24);

    const unlocked = expectedNextWritableWeek(
      [{ weekNumber: 24, status: "VERIFIED", overrideActive: false }],
      { pythonCheckpointPassed: true },
    );
    expect(unlocked).toBe(25);
  });
});

describe("systems gating before W48", () => {
  it("blocks Stage 2 verification without systems checkpoint", () => {
    expect(systemsAllowsStage2Verification([])).toBe(false);
    const blockers = prerequisiteBlockersForWeek(48, []);
    expect(blockers.some((b) => b.prerequisiteId === "systems_w48")).toBe(true);
    expect(
      prerequisiteBlockersForWeek(48, [passed("systems_w48")]).length,
    ).toBe(0);
  });
});

describe("W76 hardware", () => {
  it("blocks measured GPU verification without hardware prerequisite", () => {
    const blockers = prerequisiteBlockersForWeek(76, [], {
      requiresMeasuredGpu: true,
    });
    expect(blockers.some((b) => b.prerequisiteId === "gpu_w76")).toBe(true);
  });

  it("eligibility flags hardware_blocked for W76 without evidence", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 76,
      status: "DONE",
      latestAttempt: {
        recall: 3,
        build: 3,
        debug: 3,
        transfer: 3,
        coreAiAuthored: false,
      },
      evidence: {
        artifactRef: "lab/",
        reproducibleSteps: "run",
        testOutcome: "pass",
        testOutputs: "ok",
        transferCondition: "c",
        transferResult: "r",
        explanation: "e",
        measurementContext: "m",
        limitation: "l",
        coreAiAuthored: false,
        externalReviewStatus: "NOT EXTERNALLY REVIEWED",
        submittedAt: "2026-01-01T00:00:00.000Z",
        hardwareEvidence: null,
        boundedCoreEvidence: "mtp",
      },
      prerequisites: [],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
    });
    expect(result.eligible).toBe(false);
    expect(result.issues.some((i) => i.code === "hardware_blocked")).toBe(
      true,
    );
  });
});

describe("overrides never bypass learning requirements", () => {
  it("allows write via override but blocks verify", () => {
    const weeks = [
      { weekNumber: 1, status: "VERIFIED" as const, overrideActive: false },
      { weekNumber: 5, status: "PLANNED" as const, overrideActive: true },
    ];
    const write = evaluateWeekWriteAccess({
      targetWeek: 5,
      writeKind: "attempt",
      weeks,
      settings: { lockingEnabled: true },
      pythonCheckpointPassed: true,
    });
    expect(write.allowed).toBe(true);
    expect(write.viaOverride).toBe(true);

    const verify = evaluateWeekWriteAccess({
      targetWeek: 5,
      writeKind: "verify",
      weeks,
      settings: { lockingEnabled: true },
      pythonCheckpointPassed: true,
    });
    expect(verify.allowed).toBe(false);
    expect(verify.code).toBe("override_not_verification");
  });

  it("eligibility rejects override_active", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 1,
      status: "DONE",
      latestAttempt: {
        recall: 3,
        build: 3,
        debug: 3,
        transfer: 3,
        coreAiAuthored: false,
      },
      evidence: {
        artifactRef: "a",
        reproducibleSteps: "s",
        testOutcome: "pass",
        testOutputs: "o",
        transferCondition: "c",
        transferResult: "r",
        explanation: "e",
        measurementNa: true,
        limitation: "l",
        coreAiAuthored: false,
        externalReviewStatus: "NOT EXTERNALLY REVIEWED",
        submittedAt: "2026-01-01T00:00:00.000Z",
      },
      prerequisites: [passed("diagnostic_w1")],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
      overrideActive: true,
    });
    expect(result.eligible).toBe(false);
    expect(result.issues.some((i) => i.code === "override_active")).toBe(true);
  });
});

describe("W83/84 modeled hardware alternatives", () => {
  it("allows labeled modeled evidence without gpu_w76 prerequisite", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 83,
      status: "DONE",
      latestAttempt: {
        recall: 3,
        build: 3,
        debug: 3,
        transfer: 3,
        coreAiAuthored: false,
      },
      evidence: {
        artifactRef: "script",
        reproducibleSteps: "python collect.py",
        testOutcome: "not_applicable",
        transferCondition: "c",
        transferResult: "r",
        explanation: "modeled collection",
        measurementNa: true,
        limitation: "modeled/referenced — not measured GPU",
        coreAiAuthored: false,
        externalReviewStatus: "NOT EXTERNALLY REVIEWED",
        submittedAt: "2026-01-01T00:00:00.000Z",
        hardwareEvidence: "MODELED: public benchmark table",
        boundedCoreEvidence: "mtp",
      },
      prerequisites: [],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
      allowsModeledHardwareEvidence: true,
    });
    // Still may fail systems gate for stage 2 — but not hardware_blocked
    expect(result.issues.some((i) => i.code === "hardware_blocked")).toBe(
      false,
    );
  });
});

describe("optional P02", () => {
  it("can be skipped without blocking curriculum", () => {
    const skip = evaluateProjectAcceptance({
      projectId: "P02",
      mappedWeeksVerified: false,
      acceptanceEvidence: null,
      learnerConfirmed: false,
      skipped: true,
    });
    expect(skip.canSkip).toBe(true);
    expect(skippingP02BlocksCurriculum(true)).toBe(false);
  });

  it("still requires evidence to verify when not skipped", () => {
    const result = evaluateProjectAcceptance({
      projectId: "P02",
      mappedWeeksVerified: true,
      acceptanceEvidence: "",
      learnerConfirmed: true,
    });
    expect(result.canVerify).toBe(false);
  });
});
