import roadmapJson from "../../../content/roadmap.json";

export type CurriculumWeek = {
  number: number;
  title: string;
  blockId: number;
  learn: string;
  build: string;
  assignment: string;
  assessment: string;
  evidence: string;
  minimumToPass: string | null;
  isBoundedCore: boolean;
  projectIds: string[];
  educationalDemoOnly?: boolean;
  beginWith?: string | null;
  nextReference?: unknown;
  sourceLine?: number;
};

export type CurriculumProject = {
  id: string;
  title: string;
  optional: boolean;
  weekStart?: number;
  weekEnd?: number;
  purpose?: string;
  /** Source may provide a single prose string or list. */
  functionalRequirements?: string | string[];
  acceptanceTests?: string | string[];
  requiredEvidence?: string | string[];
  milestones?: unknown;
  learningReferences?: unknown;
  exitCondition?: string;
  scope?: string;
};

export type Curriculum = {
  meta: {
    sourceSha256: string;
    schemaVersion: number;
    importVersion: number;
    plannedWeeks: number;
  };
  stages: unknown[];
  blocks: unknown[];
  weeks: CurriculumWeek[];
  projects: CurriculumProject[];
  milestones: unknown[];
  policies: {
    assessment: unknown;
    prerequisites: unknown[];
    templates: Record<string, string>;
    boundedCoreWeeks: number[];
    examinationProtocolSourceLines?: number[];
    pilotSourceLines?: number[];
  };
};

export const curriculum = roadmapJson as unknown as Curriculum;

export function getWeek(weekNumber: number): CurriculumWeek | undefined {
  return curriculum.weeks.find((w) => w.number === weekNumber);
}

export function getProject(projectId: string): CurriculumProject | undefined {
  return curriculum.projects.find((p) => p.id === projectId);
}

export function curriculumHash(): string {
  return curriculum.meta.sourceSha256;
}
