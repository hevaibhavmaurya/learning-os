import { describe, expect, it } from "vitest";
import {
  evaluateProjectAcceptance,
  isOptionalProject,
  skippingP02BlocksCurriculum,
  week91ContributionHonest,
} from "../../src/shared/domain/projects";

describe("project P02 optional", () => {
  it("marks P02 as the only optional project", () => {
    expect(isOptionalProject("P02")).toBe(true);
    expect(isOptionalProject("P01")).toBe(false);
    expect(isOptionalProject("P10")).toBe(false);
  });

  it("allows skipping P02 without blocking curriculum progress", () => {
    const result = evaluateProjectAcceptance({
      projectId: "P02",
      mappedWeeksVerified: false,
      acceptanceEvidence: null,
      learnerConfirmed: false,
      skipped: true,
    });
    expect(result.optional).toBe(true);
    expect(result.canSkip).toBe(true);
    expect(result.canVerify).toBe(false);
    expect(result.blockers).toEqual([]);
    expect(skippingP02BlocksCurriculum(true)).toBe(false);
  });

  it("rejects skipping a required project", () => {
    const result = evaluateProjectAcceptance({
      projectId: "P01",
      mappedWeeksVerified: true,
      acceptanceEvidence: "shipped",
      learnerConfirmed: true,
      skipped: true,
    });
    expect(result.canSkip).toBe(false);
    expect(result.canVerify).toBe(false);
    expect(result.blockers.some((b) => /cannot be skipped/i.test(b))).toBe(
      true,
    );
  });

  it("requires acceptance evidence and confirmation even when mapped weeks are verified", () => {
    const result = evaluateProjectAcceptance({
      projectId: "P02",
      mappedWeeksVerified: true,
      acceptanceEvidence: "  ",
      learnerConfirmed: false,
    });
    expect(result.canVerify).toBe(false);
    expect(result.blockers.some((b) => /evidence/i.test(b))).toBe(true);
    expect(result.blockers.some((b) => /confirmation/i.test(b))).toBe(true);
    expect(
      result.blockers.some((b) => /Mapped verified weeks alone/i.test(b)),
    ).toBe(true);
  });

  it("verifies P02 when evidence and confirmation are present", () => {
    const result = evaluateProjectAcceptance({
      projectId: "P02",
      mappedWeeksVerified: false,
      acceptanceEvidence: "Optional lab notes + acceptance checklist",
      learnerConfirmed: true,
    });
    expect(result.canVerify).toBe(true);
    expect(result.canSkip).toBe(true);
  });
});

describe("week 91 contribution honesty", () => {
  it("rejects merge claims without a submitted label", () => {
    expect(week91ContributionHonest("PR merged upstream")).toBe(false);
  });

  it("accepts submitted / educational / contribution labels", () => {
    expect(week91ContributionHonest("Submitted PR (educational)")).toBe(true);
    expect(week91ContributionHonest("Educational contribution only")).toBe(
      true,
    );
  });
});
