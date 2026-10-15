/**
 * Verification eligibility: latest attempt, prerequisites, bounded-core,
 * assistance/independence, hardware, and evidence completeness.
 *
 * Evidence submission → DONE; explicit confirmation → VERIFIED.
 * Attempts / autosave never verify automatically.
 */

import {
  buildIndependenceOk,
  evaluateGates,
  type GateScores,
} from "./gates";
import type { WeekStatus } from "./locking";
import {
  prerequisiteBlockersForWeek,
  type PrerequisiteState,
} from "./prerequisites";

/** Bounded-core weeks from content/roadmap.json policies.boundedCoreWeeks */
export const BOUNDED_CORE_WEEKS = [
  26, 28, 31, 63, 64, 65, 73, 76, 77, 78, 79, 83, 84, 87, 88, 89,
] as const;

export type BoundedCoreWeek = (typeof BOUNDED_CORE_WEEKS)[number];

export type TestOutcome = "pass" | "fail" | "not_applicable";

export interface EvidenceSnapshot {
  artifactRef?: string | null;
  reproducibleSteps?: string | null;
  testOutcome?: TestOutcome | null;
  testOutputs?: string | null;
  failureRootCause?: string | null;
  transferCondition?: string | null;
  transferResult?: string | null;
  explanation?: string | null;
  measurementContext?: string | null;
  measurementNa?: boolean;
  limitation?: string | null;
  helpUsed?: string | null;
  coreAiAuthored: boolean;
  externalReviewStatus?: string | null;
  prerequisiteEvidence?: string | null;
  boundedCoreEvidence?: string | null;
  hardwareEvidence?: string | null;
  submittedAt?: string | null;
}

export interface AttemptSnapshot extends GateScores {
  coreAiAuthored: boolean;
  externallyReviewed?: boolean;
  reviewLabel?: string | null;
}

export interface EligibilityInput {
  weekNumber: number;
  status: WeekStatus;
  latestAttempt: AttemptSnapshot | null;
  evidence: EvidenceSnapshot | null;
  prerequisites: readonly PrerequisiteState[];
  /** Verbatim minimum-to-pass text when week is bounded-core. */
  minimumToPass?: string | null;
  /** Explicit learner confirmation for DONE → VERIFIED. */
  learnerConfirmed: boolean;
  /** Expected revision for conditional transition. */
  revision: number;
  expectedRevision: number;
  overrideActive?: boolean;
  /** Weeks 83–84 may use modeled/referenced evidence labels. */
  allowsModeledHardwareEvidence?: boolean;
  /** Pilot mode ready when relevant to W43. */
  pilotModeReady?: boolean;
}

export type EligibilityCode =
  | "not_done"
  | "already_verified"
  | "stale_revision"
  | "missing_attempt"
  | "gates_failed"
  | "ai_authored_build"
  | "evidence_incomplete"
  | "evidence_not_submitted"
  | "tests_not_passing"
  | "bounded_core_incomplete"
  | "prerequisite_blocked"
  | "hardware_blocked"
  | "override_active"
  | "confirmation_required"
  | "ok";

export interface EligibilityIssue {
  code: EligibilityCode;
  message: string;
  field?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  issues: EligibilityIssue[];
  /** True when evidence may move ATTEMPTED → DONE. */
  canSubmitEvidence: boolean;
  /** True when DONE + confirmation may move to VERIFIED. */
  canVerify: boolean;
}

function nonempty(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function isBoundedCoreWeek(weekNumber: number): boolean {
  return (BOUNDED_CORE_WEEKS as readonly number[]).includes(weekNumber);
}

/**
 * Structured evidence completeness for verification.
 * Justified N/A is allowed where executable checks do not apply.
 */
export function evaluateEvidenceCompleteness(
  evidence: EvidenceSnapshot,
  weekNumber: number,
  options?: { allowsModeledHardwareEvidence?: boolean },
): EligibilityIssue[] {
  const issues: EligibilityIssue[] = [];

  if (!evidence.submittedAt) {
    issues.push({
      code: "evidence_not_submitted",
      message: "Evidence must be submitted before verification",
    });
  }

  if (!nonempty(evidence.artifactRef) && !nonempty(evidence.explanation)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Artifact reference or conceptual explanation is required",
      field: "artifactRef",
    });
  }

  if (!nonempty(evidence.reproducibleSteps)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Reproducible command/steps are required",
      field: "reproducibleSteps",
    });
  }

  if (!evidence.testOutcome) {
    issues.push({
      code: "evidence_incomplete",
      message: "Test outcome (pass | fail | not_applicable) is required",
      field: "testOutcome",
    });
  } else if (evidence.testOutcome === "fail") {
    issues.push({
      code: "tests_not_passing",
      message: "Required executable checks must be reported passing",
      field: "testOutcome",
    });
  } else if (
    evidence.testOutcome === "pass" &&
    !nonempty(evidence.testOutputs)
  ) {
    issues.push({
      code: "evidence_incomplete",
      message: "Passing tests require recorded outputs",
      field: "testOutputs",
    });
  }

  if (!nonempty(evidence.transferCondition) || !nonempty(evidence.transferResult)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Fresh transfer condition and result are required",
      field: "transferCondition",
    });
  }

  if (!nonempty(evidence.explanation)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Explanation record is required",
      field: "explanation",
    });
  }

  if (!evidence.measurementNa && !nonempty(evidence.measurementContext)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Measurement/context or justified N/A is required",
      field: "measurementContext",
    });
  }

  if (!nonempty(evidence.limitation)) {
    issues.push({
      code: "evidence_incomplete",
      message: "Limitation statement is required",
      field: "limitation",
    });
  }

  // External review absence is allowed with honest label.
  if (
    !evidence.externalReviewStatus ||
    !nonempty(evidence.externalReviewStatus)
  ) {
    issues.push({
      code: "evidence_incomplete",
      message:
        "External-review status is required (e.g. NOT EXTERNALLY REVIEWED)",
      field: "externalReviewStatus",
    });
  }

  if (isBoundedCoreWeek(weekNumber) && !nonempty(evidence.boundedCoreEvidence)) {
    issues.push({
      code: "bounded_core_incomplete",
      message:
        "Bounded-core / minimum-to-pass evidence is required for this week",
      field: "boundedCoreEvidence",
    });
  }

  if (weekNumber === 76) {
    const modeledOk = options?.allowsModeledHardwareEvidence === true;
    if (!modeledOk && !nonempty(evidence.hardwareEvidence)) {
      issues.push({
        code: "hardware_blocked",
        message:
          "Week 76 measured GPU work requires hardware evidence (simulation alternatives are not accepted here)",
        field: "hardwareEvidence",
      });
    }
  }

  // Weeks 83–84: modeled/referenced evidence allowed when labeled.
  if (
    (weekNumber === 83 || weekNumber === 84) &&
    options?.allowsModeledHardwareEvidence &&
    nonempty(evidence.hardwareEvidence) === false &&
    nonempty(evidence.limitation) === false
  ) {
    issues.push({
      code: "evidence_incomplete",
      message:
        "Modeled/referenced hardware evidence must retain its label and limitations",
      field: "hardwareEvidence",
    });
  }

  return issues;
}

/**
 * Full verification eligibility. Does not perform writes.
 */
export function evaluateVerificationEligibility(
  input: EligibilityInput,
): EligibilityResult {
  const issues: EligibilityIssue[] = [];

  if (input.overrideActive) {
    issues.push({
      code: "override_active",
      message: "Active overrides never count as verification",
    });
  }

  if (input.status === "VERIFIED") {
    issues.push({
      code: "already_verified",
      message: "Week is already VERIFIED",
    });
  }

  if (input.revision !== input.expectedRevision) {
    issues.push({
      code: "stale_revision",
      message: `Stale revision: got ${input.revision}, expected ${input.expectedRevision}`,
    });
  }

  if (!input.latestAttempt) {
    issues.push({
      code: "missing_attempt",
      message: "Latest attempt is required",
    });
  } else {
    const gateEval = evaluateGates(input.latestAttempt);
    if (!gateEval.allPassed) {
      issues.push({
        code: "gates_failed",
        message: gateEval.issues.map((i) => i.message).join("; "),
      });
    }
    if (
      !buildIndependenceOk(
        input.latestAttempt,
        input.latestAttempt.coreAiAuthored ||
          input.evidence?.coreAiAuthored === true,
      )
    ) {
      issues.push({
        code: "ai_authored_build",
        message:
          "An AI-authored core solution cannot support independent Build ≥3",
      });
    }
  }

  const canSubmitEvidence =
    Boolean(input.latestAttempt) &&
    evaluateGates(
      input.latestAttempt ?? { recall: 0, build: 0, debug: 0, transfer: 0 },
    ).issues.filter((i) => i.code === "out_of_range").length === 0 &&
    input.status !== "VERIFIED";

  if (!input.evidence) {
    issues.push({
      code: "evidence_incomplete",
      message: "Structured evidence is required",
    });
  } else {
    issues.push(
      ...evaluateEvidenceCompleteness(input.evidence, input.weekNumber, {
        allowsModeledHardwareEvidence:
          input.allowsModeledHardwareEvidence ??
          (input.weekNumber === 83 || input.weekNumber === 84),
      }),
    );
  }

  if (
    isBoundedCoreWeek(input.weekNumber) &&
    input.minimumToPass &&
    input.evidence &&
    !nonempty(input.evidence.boundedCoreEvidence)
  ) {
    // Already covered; keep MTP text available to callers via minimumToPass.
  }

  const prereqBlockers = prerequisiteBlockersForWeek(
    input.weekNumber,
    input.prerequisites,
    {
      requiresMeasuredGpu: input.weekNumber === 76,
      pilotModeReady: input.pilotModeReady,
    },
  );
  for (const b of prereqBlockers) {
    issues.push({
      code:
        b.prerequisiteId === "gpu_w76"
          ? "hardware_blocked"
          : "prerequisite_blocked",
      message: b.message,
      field: b.prerequisiteId,
    });
  }

  if (input.status !== "DONE") {
    issues.push({
      code: "not_done",
      message:
        "Evidence submission must move the week to DONE before verification",
    });
  }

  if (!input.learnerConfirmed) {
    issues.push({
      code: "confirmation_required",
      message: "Explicit checked confirmation is required to verify",
    });
  }

  const blocking = issues.filter((i) => i.code !== "ok");
  const canVerify =
    blocking.length === 0 &&
    input.status === "DONE" &&
    input.learnerConfirmed;

  return {
    eligible: canVerify,
    issues: blocking,
    canSubmitEvidence,
    canVerify,
  };
}

/**
 * Whether an attempt may be recorded as a completed scored attempt
 * (all gates assessed; zeros rejected). Does not verify.
 */
export function canRecordCompletedAttempt(scores: GateScores): boolean {
  return evaluateGates(scores).ok;
}
