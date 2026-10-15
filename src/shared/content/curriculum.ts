/**
 * Typed accessors for committed curriculum in content/roadmap.json.
 * Teaching text is static; learner progress comes from the API.
 */
import roadmap from "@content/roadmap.json";

export type CurriculumLink = {
  title: string;
  url: string;
  note?: string;
};

export type CurriculumWeek = {
  number: number;
  title: string;
  blockId: number;
  learn: string;
  build: string;
  assignment: string;
  assessment: string;
  beginWith: CurriculumLink | null;
  nextReference: CurriculumLink | null;
  evidence: string;
  educationalDemoOnly: boolean;
  minimumToPass: string | null;
  isBoundedCore: boolean;
  sourceLine: number;
  projectIds: string[];
};

export type CurriculumBlock = {
  id: number;
  title: string;
  weekStart: number;
  weekEnd: number;
  stage: number;
  referenceShelf: CurriculumLink[];
  goalCheckpoint: string;
  primaryResources: CurriculumLink[];
  furtherSources: CurriculumLink[];
  blockEndGate: string;
};

export type CurriculumProject = {
  id: string;
  title: string;
  weekStart: number;
  weekEnd: number;
  scope: string;
  optional: boolean;
  purpose: string;
  functionalRequirements: string;
  milestones: string;
  acceptanceTests: string;
  requiredEvidence: string;
  learningReferences: CurriculumLink[];
  exitCondition: string;
};

export type CurriculumStage = {
  id: number;
  weekStart: number;
  weekEnd: number;
  label: string;
};

const data = roadmap as {
  meta: {
    plannedWeeks: number;
    hoursPerWeek: number;
    plannedHours: number;
    title: string;
  };
  stages: CurriculumStage[];
  blocks: CurriculumBlock[];
  weeks: CurriculumWeek[];
  projects: CurriculumProject[];
  milestones: { weeks: number[]; evidence: string; rawWeekCell: string }[];
  policies: {
    assessment: {
      gates: string[];
      passThreshold: number;
      scoreMax: number;
      retentionOffsetsDays: number[];
    };
    prerequisites: {
      id: string;
      label: string;
      gatesWeek: number;
      unlocksWeek?: number;
      kind: string;
    }[];
    templates: Record<string, string>;
    boundedCoreWeeks: number[];
  };
};

export const PLANNED_WEEKS = data.meta.plannedWeeks;
export const HOURS_PER_WEEK = data.meta.hoursPerWeek;
export const CURRICULUM_STAGES = data.stages;
export const CURRICULUM_BLOCKS = data.blocks;
export const CURRICULUM_WEEKS = data.weeks;
export const CURRICULUM_PROJECTS = data.projects;
export const CURRICULUM_MILESTONES = data.milestones;
export const CURRICULUM_TEMPLATES = data.policies.templates;
export const CURRICULUM_POLICIES = data.policies;
export const PLANNED_HOURS = data.meta.plannedHours;

const weekByNumber = new Map(CURRICULUM_WEEKS.map((w) => [w.number, w]));
const blockById = new Map(CURRICULUM_BLOCKS.map((b) => [b.id, b]));
const projectById = new Map(CURRICULUM_PROJECTS.map((p) => [p.id, p]));

export function getWeek(n: number): CurriculumWeek {
  const w = weekByNumber.get(n);
  if (!w) throw new Error(`Unknown curriculum week ${n}`);
  return w;
}

export function getBlock(id: number): CurriculumBlock {
  const b = blockById.get(id);
  if (!b) throw new Error(`Unknown curriculum block ${id}`);
  return b;
}

export function blockForWeek(weekNumber: number): CurriculumBlock {
  const week = getWeek(weekNumber);
  return getBlock(week.blockId);
}

export function getProject(id: string): CurriculumProject | undefined {
  return projectById.get(id);
}

export function projectsForWeek(weekNumber: number): CurriculumProject[] {
  return CURRICULUM_PROJECTS.filter(
    (p) => weekNumber >= p.weekStart && weekNumber <= p.weekEnd,
  );
}

/** Pick milestone text for a project covering the given week. */
export function projectMilestoneFor(
  project: CurriculumProject,
  weekNumber: number,
): string {
  const parts = project.milestones.split(/;\s*/).map((s) => s.trim()).filter(Boolean);
  const hit = parts.find((part) => {
    const range = part.match(/W(\d+)[–-](\d+)/i);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      return weekNumber >= a && weekNumber <= b;
    }
    const single = part.match(/W(\d+)/i);
    if (single) return Number(single[1]) === weekNumber;
    return false;
  });
  return hit || parts[0] || "See project contract";
}

/** Core (non-optional) project covering the week, else first mapped project. */
export function primaryProjectForWeek(
  weekNumber: number,
): CurriculumProject | undefined {
  const mapped = projectsForWeek(weekNumber);
  return mapped.find((p) => !p.optional) ?? mapped[0] ?? CURRICULUM_PROJECTS[0];
}

export function isValidWeekNumber(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isInteger(n) &&
    n >= 1 &&
    n <= PLANNED_WEEKS
  );
}

export function parseWeekNumber(raw: string | number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(PLANNED_WEEKS, Math.max(1, Math.trunc(n)));
}

export function getWeekTitle(weekNumber: number): string {
  return weekByNumber.get(weekNumber)?.title || `Week ${weekNumber}`;
}

export type TemplateId = "evidence" | "project" | "block" | "paper";

const TEMPLATE_KEYS: Record<TemplateId, string[]> = {
  evidence: ["evidence/week-NN.md", "evidence"],
  block: ["assessments/block-NN.md", "blockAssessment", "block"],
  paper: ["docs/papers/paper-name.md", "paper"],
  project: ["project", "projects/project.md"],
};

export function getTemplateBody(id: TemplateId): string {
  for (const key of TEMPLATE_KEYS[id]) {
    if (CURRICULUM_TEMPLATES[key]) return CURRICULUM_TEMPLATES[key];
  }
  if (id === "project") {
    return [
      "# Project record",
      "Name:",
      "Purpose:",
      "Current milestone:",
      "Acceptance checks:",
      "Evidence links:",
      "Open decisions:",
    ].join("\n");
  }
  return Object.values(CURRICULUM_TEMPLATES)[0] ?? `# ${id} template\n`;
}

export function getTemplateTitle(id: TemplateId): string {
  switch (id) {
    case "evidence":
      return "Evidence template";
    case "block":
      return "Block assessment template";
    case "paper":
      return "Paper note template";
    case "project":
      return "Project record template";
  }
}
