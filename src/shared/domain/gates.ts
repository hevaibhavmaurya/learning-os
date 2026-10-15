/** Four assessment gates: Recall, Build, Debug, Transfer. */

export const GATE_NAMES = ["recall", "build", "debug", "transfer"] as const;
export type GateName = (typeof GATE_NAMES)[number];

export const GATE_SCORE_MIN = 0;
export const GATE_SCORE_MAX = 4;
/** Minimum score to pass a gate (no averaging across gates). */
export const GATE_PASS_THRESHOLD = 3;

export interface GateScores {
  recall: number;
  build: number;
  debug: number;
  transfer: number;
}

export type GateIssueCode =
  | "out_of_range"
  | "not_assessed"
  | "below_threshold";

export interface GateIssue {
  gate: GateName;
  code: GateIssueCode;
  message: string;
}

export interface GateEvaluation {
  ok: boolean;
  /** True when all four gates are assessed (>0) and each ≥ pass threshold. */
  allPassed: boolean;
  issues: GateIssue[];
}

function isIntInRange(n: number): boolean {
  return Number.isInteger(n) && n >= GATE_SCORE_MIN && n <= GATE_SCORE_MAX;
}

/** Validate score ranges (0–4 integers). */
export function validateGateRanges(scores: GateScores): GateIssue[] {
  const issues: GateIssue[] = [];
  for (const gate of GATE_NAMES) {
    const value = scores[gate];
    if (!isIntInRange(value)) {
      issues.push({
        gate,
        code: "out_of_range",
        message: `${gate} must be an integer ${GATE_SCORE_MIN}–${GATE_SCORE_MAX}`,
      });
    }
  }
  return issues;
}

/**
 * Evaluate gates for a completed attempt submission.
 * Zero means not assessed and cannot be submitted as completed.
 * Each gate must be ≥3; scores are never averaged.
 */
export function evaluateGates(scores: GateScores): GateEvaluation {
  const issues = validateGateRanges(scores);
  if (issues.length > 0) {
    return { ok: false, allPassed: false, issues };
  }

  for (const gate of GATE_NAMES) {
    const value = scores[gate];
    if (value === 0) {
      issues.push({
        gate,
        code: "not_assessed",
        message: `${gate} is 0 (not assessed) and cannot be submitted as completed`,
      });
    } else if (value < GATE_PASS_THRESHOLD) {
      issues.push({
        gate,
        code: "below_threshold",
        message: `${gate} is ${value}; requires ≥${GATE_PASS_THRESHOLD}`,
      });
    }
  }

  const allPassed = issues.length === 0;
  return { ok: allPassed, allPassed, issues };
}

/** True when Build ≥3 is claimed with independent (non-AI-authored) core work. */
export function buildIndependenceOk(
  scores: GateScores,
  coreAiAuthored: boolean,
): boolean {
  if (scores.build < GATE_PASS_THRESHOLD) return false;
  return !coreAiAuthored;
}

/** Whether scores alone qualify (ranges + thresholds), ignoring assistance. */
export function gatesQualify(scores: GateScores): boolean {
  return evaluateGates(scores).allPassed;
}
