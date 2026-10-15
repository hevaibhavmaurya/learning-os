import { describe, expect, it } from "vitest";
import { evaluateVerificationEligibility } from "../../src/shared/domain/eligibility";
import {
  prerequisiteBlockersForWeek,
  type PrerequisiteState,
} from "../../src/shared/domain/prerequisites";

const baseAttempt = {
  recall: 3,
  build: 3,
  debug: 3,
  transfer: 3,
  coreAiAuthored: false,
} as const;

const baseEvidence = {
  artifactRef: "labs/w76/",
  reproducibleSteps: "run benchmark",
  testOutcome: "pass",
  testOutputs: "ok",
  transferCondition: "c",
  transferResult: "r",
  explanation: "measured",
  measurementContext: "device X",
  limitation: "single GPU",
  coreAiAuthored: false,
  externalReviewStatus: "NOT EXTERNALLY REVIEWED",
  submittedAt: "2026-01-01T00:00:00.000Z",
  boundedCoreEvidence: "mtp satisfied",
} as const;

const passed = (id: PrerequisiteState["prerequisiteId"]): PrerequisiteState => ({
  prerequisiteId: id,
  passed: true,
  confirmedAt: "2026-01-01T00:00:00.000Z",
});

describe("W76 hardware", () => {
  it("requires gpu_w76 prerequisite for measured GPU work", () => {
    const blockers = prerequisiteBlockersForWeek(76, [], {
      requiresMeasuredGpu: true,
    });
    expect(blockers.some((b) => b.prerequisiteId === "gpu_w76")).toBe(true);

    // Stage 2 also requires systems_w48; both must pass to clear blockers.
    const remaining = prerequisiteBlockersForWeek(
      76,
      [passed("gpu_w76"), passed("systems_w48")],
      { requiresMeasuredGpu: true },
    );
    expect(remaining.some((b) => b.prerequisiteId === "gpu_w76")).toBe(false);
    expect(remaining).toEqual([]);
  });

  it("blocks eligibility without hardware evidence", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 76,
      status: "DONE",
      latestAttempt: { ...baseAttempt },
      evidence: { ...baseEvidence, hardwareEvidence: null },
      prerequisites: [passed("gpu_w76"), passed("systems_w48")],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
    });
    expect(result.eligible).toBe(false);
    expect(result.issues.some((i) => i.code === "hardware_blocked")).toBe(
      true,
    );
  });

  it("does not accept unlabeled simulation as measured evidence", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 76,
      status: "DONE",
      latestAttempt: { ...baseAttempt },
      evidence: {
        ...baseEvidence,
        hardwareEvidence: null,
        limitation: "simulated only",
      },
      prerequisites: [passed("gpu_w76"), passed("systems_w48")],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
      allowsModeledHardwareEvidence: false,
    });
    expect(result.issues.some((i) => i.code === "hardware_blocked")).toBe(
      true,
    );
  });

  it("passes hardware check when measured evidence is present", () => {
    const result = evaluateVerificationEligibility({
      weekNumber: 76,
      status: "DONE",
      latestAttempt: { ...baseAttempt },
      evidence: {
        ...baseEvidence,
        hardwareEvidence: "Measured on NVIDIA T4; kernel timings attached",
      },
      prerequisites: [passed("gpu_w76"), passed("systems_w48")],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
    });
    expect(result.issues.some((i) => i.code === "hardware_blocked")).toBe(
      false,
    );
  });

  it("allows labeled modeled alternatives on W83 (not W76)", () => {
    const w83 = evaluateVerificationEligibility({
      weekNumber: 83,
      status: "DONE",
      latestAttempt: { ...baseAttempt },
      evidence: {
        ...baseEvidence,
        hardwareEvidence: "MODELED: public table",
        limitation: "modeled — not measured GPU",
        measurementNa: true,
      },
      prerequisites: [passed("systems_w48")],
      learnerConfirmed: true,
      revision: 1,
      expectedRevision: 1,
      allowsModeledHardwareEvidence: true,
    });
    expect(w83.issues.some((i) => i.code === "hardware_blocked")).toBe(false);
  });
});
