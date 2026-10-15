/**
 * Curriculum prerequisite / checkpoint rules.
 * Source: content/roadmap.json policies.prerequisites
 */

export const PREREQUISITE_IDS = [
  "diagnostic_w1",
  "python_w24",
  "systems_w48",
  "gpu_w76",
  "pilot_consent",
] as const;

export type PrerequisiteId = (typeof PREREQUISITE_IDS)[number];

export type PrerequisiteKind =
  | "diagnostic"
  | "python"
  | "systems"
  | "hardware_gpu"
  | "consent";

export interface PrerequisiteDefinition {
  id: PrerequisiteId;
  label: string;
  kind: PrerequisiteKind;
  /** Week that cannot be verified until this passes (when applicable). */
  gatesWeek: number;
  /** Week unlocked only after pass (Python → W25). */
  unlocksWeek?: number;
}

export const PREREQUISITE_DEFINITIONS: readonly PrerequisiteDefinition[] = [
  {
    id: "diagnostic_w1",
    label: "Week 1 two-hour diagnostic",
    kind: "diagnostic",
    gatesWeek: 1,
  },
  {
    id: "python_w24",
    label: "Python checkpoint before Week 24 verification",
    kind: "python",
    gatesWeek: 24,
    unlocksWeek: 25,
  },
  {
    id: "systems_w48",
    label: "Systems-language checkpoint before Stage 2 assessed work",
    kind: "systems",
    gatesWeek: 48,
  },
  {
    id: "gpu_w76",
    label: "Measured GPU evidence for Week 76",
    kind: "hardware_gpu",
    gatesWeek: 76,
  },
  {
    id: "pilot_consent",
    label: "Real-data consent or SIMULATED pilot mode",
    kind: "consent",
    gatesWeek: 43,
  },
] as const;

export interface PrerequisiteState {
  prerequisiteId: PrerequisiteId;
  passed: boolean;
  confirmedAt?: string | null;
  evidenceNotes?: string | null;
}

export interface PrerequisiteBlocker {
  prerequisiteId: PrerequisiteId;
  code: string;
  message: string;
}

const byId = new Map(
  PREREQUISITE_DEFINITIONS.map((d) => [d.id, d] as const),
);

export function getPrerequisiteDefinition(
  id: PrerequisiteId,
): PrerequisiteDefinition {
  const def = byId.get(id);
  if (!def) throw new Error(`Unknown prerequisite ${id}`);
  return def;
}

function findState(
  states: readonly PrerequisiteState[],
  id: PrerequisiteId,
): PrerequisiteState | undefined {
  return states.find((s) => s.prerequisiteId === id);
}

function isPassed(
  states: readonly PrerequisiteState[],
  id: PrerequisiteId,
): boolean {
  return findState(states, id)?.passed === true;
}

/**
 * Blockers that prevent verifying `weekNumber`.
 * Does not invent pass from neighboring week verification.
 */
export function prerequisiteBlockersForWeek(
  weekNumber: number,
  states: readonly PrerequisiteState[],
  options?: {
    /** Week 76 measured-GPU path; false when modeled/referenced N/A is not this week. */
    requiresMeasuredGpu?: boolean;
    /** Pilot activation consent handled separately; when verifying W43 week work. */
    pilotModeReady?: boolean;
  },
): PrerequisiteBlocker[] {
  const blockers: PrerequisiteBlocker[] = [];

  if (weekNumber === 1 && !isPassed(states, "diagnostic_w1")) {
    blockers.push({
      prerequisiteId: "diagnostic_w1",
      code: "diagnostic_required",
      message:
        "Week 1 two-hour diagnostic must be recorded and confirmed before verification",
    });
  }

  if (weekNumber === 24 && !isPassed(states, "python_w24")) {
    blockers.push({
      prerequisiteId: "python_w24",
      code: "python_checkpoint_required",
      message:
        "Python checkpoint must pass before Week 24 can be verified",
    });
  }

  if (weekNumber >= 48 && !isPassed(states, "systems_w48")) {
    blockers.push({
      prerequisiteId: "systems_w48",
      code: "systems_checkpoint_required",
      message:
        "Systems-language checkpoint must pass before Stage 2 assessed verification",
    });
  }

  const requiresGpu =
    options?.requiresMeasuredGpu ?? weekNumber === 76;
  if (requiresGpu && weekNumber === 76 && !isPassed(states, "gpu_w76")) {
    blockers.push({
      prerequisiteId: "gpu_w76",
      code: "gpu_hardware_required",
      message:
        "Week 76 cannot be verified as measured GPU work without required GPU evidence",
    });
  }

  if (
    weekNumber === 43 &&
    options?.pilotModeReady === false &&
    !isPassed(states, "pilot_consent")
  ) {
    blockers.push({
      prerequisiteId: "pilot_consent",
      code: "pilot_consent_required",
      message:
        "Pilot requires documented consent/data boundaries or explicit SIMULATED mode",
    });
  }

  return blockers;
}

/**
 * Whether Week 25 (and subsequent unlock under locking) is unlocked by Python checkpoint.
 * Missing checkpoint keeps the learner on Week 24; do not add a numbered week.
 */
export function pythonUnlocksWeek25(
  states: readonly PrerequisiteState[],
): boolean {
  return isPassed(states, "python_w24");
}

/**
 * Stage 2 assessed work/verification is gated; read-ahead may remain available.
 */
export function systemsAllowsStage2Verification(
  states: readonly PrerequisiteState[],
): boolean {
  return isPassed(states, "systems_w48");
}

export function isPrerequisiteId(value: string): value is PrerequisiteId {
  return (PREREQUISITE_IDS as readonly string[]).includes(value);
}
