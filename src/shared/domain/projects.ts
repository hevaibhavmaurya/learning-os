/** Roadmap project acceptance — separate from week verification. */

export const ROADMAP_PROJECT_IDS = [
  "P01",
  "P02",
  "P03",
  "P04",
  "P05",
  "P06",
  "P07",
  "P08",
  "P09",
  "P10",
] as const;

export type RoadmapProjectId = (typeof ROADMAP_PROJECT_IDS)[number];

/** Optional P02 does not block Week 24 or P01. */
export const OPTIONAL_PROJECT_IDS: readonly RoadmapProjectId[] = ["P02"];

export interface ProjectProgressInput {
  projectId: RoadmapProjectId;
  /** Mapped weeks verified — insufficient alone. */
  mappedWeeksVerified: boolean;
  acceptanceEvidence: string | null | undefined;
  learnerConfirmed: boolean;
  skipped?: boolean;
}

export interface ProjectAcceptanceResult {
  projectId: RoadmapProjectId;
  optional: boolean;
  canVerify: boolean;
  canSkip: boolean;
  blockers: string[];
}

export function isOptionalProject(projectId: RoadmapProjectId): boolean {
  return OPTIONAL_PROJECT_IDS.includes(projectId);
}

export function isRoadmapProjectId(value: string): value is RoadmapProjectId {
  return (ROADMAP_PROJECT_IDS as readonly string[]).includes(value);
}

/**
 * Project-wide completion requires core contract evidence and explicit
 * learner confirmation. Mapped verified weeks alone are not enough.
 */
export function evaluateProjectAcceptance(
  input: ProjectProgressInput,
): ProjectAcceptanceResult {
  const optional = isOptionalProject(input.projectId);
  const blockers: string[] = [];

  if (input.skipped) {
    if (!optional) {
      blockers.push(`${input.projectId} is required and cannot be skipped`);
      return {
        projectId: input.projectId,
        optional,
        canVerify: false,
        canSkip: false,
        blockers,
      };
    }
    return {
      projectId: input.projectId,
      optional,
      canVerify: false,
      canSkip: true,
      blockers: [],
    };
  }

  const evidence = (input.acceptanceEvidence ?? "").trim();
  if (!evidence) {
    blockers.push("Core acceptance evidence is required");
  }
  if (!input.learnerConfirmed) {
    blockers.push("Explicit learner confirmation is required");
  }
  // mappedWeeksVerified is informational only — never sufficient alone.
  if (input.mappedWeeksVerified && blockers.length > 0) {
    blockers.push(
      "Mapped verified weeks alone do not establish project completion",
    );
  }

  return {
    projectId: input.projectId,
    optional,
    canVerify: blockers.length === 0,
    canSkip: optional,
    blockers,
  };
}

/**
 * Whether skipping optional P02 blocks curriculum progress (it must not).
 */
export function skippingP02BlocksCurriculum(skippedP02: boolean): boolean {
  void skippedP02;
  return false;
}

/**
 * Week 91 requires a defensible submitted contribution label — not a guaranteed merge.
 */
export function week91ContributionHonest(label: string | null | undefined): boolean {
  const t = (label ?? "").trim().toLowerCase();
  if (!t) return false;
  if (t.includes("merged") && !t.includes("submitted")) {
    // Prefer honest submitted / educational labels over invented merge claims.
    return false;
  }
  return (
    t.includes("submitted") ||
    t.includes("educational") ||
    t.includes("contribution")
  );
}
