import { describe, expect, it } from "vitest";
import {
  buildIndependenceOk,
  evaluateGates,
  gatesQualify,
  validateGateRanges,
} from "../../src/shared/domain/gates";

describe("gates", () => {
  it("rejects out-of-range scores", () => {
    const issues = validateGateRanges({
      recall: 5,
      build: 3,
      debug: 3,
      transfer: 3,
    });
    expect(issues.some((i) => i.code === "out_of_range")).toBe(true);
  });

  it("rejects zero as not assessed", () => {
    const result = evaluateGates({
      recall: 0,
      build: 3,
      debug: 3,
      transfer: 3,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "not_assessed")).toBe(true);
  });

  it("requires each gate ≥3 with no averaging", () => {
    expect(
      gatesQualify({ recall: 4, build: 4, debug: 4, transfer: 2 }),
    ).toBe(false);
    expect(
      gatesQualify({ recall: 3, build: 3, debug: 3, transfer: 3 }),
    ).toBe(true);
  });

  it("blocks AI-authored Build ≥3 independence", () => {
    expect(
      buildIndependenceOk(
        { recall: 3, build: 3, debug: 3, transfer: 3 },
        true,
      ),
    ).toBe(false);
    expect(
      buildIndependenceOk(
        { recall: 3, build: 3, debug: 3, transfer: 3 },
        false,
      ),
    ).toBe(true);
  });
});
