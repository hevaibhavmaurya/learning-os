import type { GateName } from "@/shared/domain/gates";

export const GATES_UI: {
  key: GateName;
  label: string;
  description: string;
}[] = [
  {
    key: "recall",
    label: "Recall",
    description: "Explain from memory, answer five new conceptual questions",
  },
  {
    key: "build",
    label: "Build",
    description: "Solve a fresh task without following a solution",
  },
  {
    key: "debug",
    label: "Debug",
    description: "Reproduce and diagnose a failure, verify the fix",
  },
  {
    key: "transfer",
    label: "Transfer",
    description: "Adapt to one changed constraint, defend trade-offs",
  },
];

export const SCORE_MEANING = [
  "Not assessed",
  "Cannot complete without direct help",
  "Completes with hints or substantial help",
  "Independent using docs; evidence reproducible",
  "Adapts to unfamiliar conditions, defends decisions",
] as const;

export type EvidenceFieldKey =
  | "artifactRef"
  | "reproducibleSteps"
  | "tests"
  | "failureRootCause"
  | "transfer"
  | "explanation"
  | "measurement"
  | "limitation"
  | "helpUsed"
  | "externalReviewStatus"
  | "boundedCoreEvidence"
  | "hardwareEvidence";

export const EVIDENCE_UI: {
  key: EvidenceFieldKey;
  label: string;
  placeholder: string;
  icon: string;
  rows?: number;
}[] = [
  {
    key: "artifactRef",
    label: "Artifact / commit",
    placeholder: "URL to the commit, repo path or artifact",
    icon: "link",
  },
  {
    key: "reproducibleSteps",
    label: "Reproducible steps",
    placeholder: "Commands or steps another person can re-run",
    icon: "terminal",
    rows: 2,
  },
  {
    key: "tests",
    label: "Tests and results",
    placeholder: "Outcome + outputs (pass / fail / not_applicable)",
    icon: "flask-conical",
    rows: 2,
  },
  {
    key: "failureRootCause",
    label: "Failure / fix",
    placeholder: "Failure injected, root cause, verified fix",
    icon: "bug",
  },
  {
    key: "transfer",
    label: "Fresh transfer",
    placeholder: "Changed condition and result",
    icon: "shuffle",
  },
  {
    key: "explanation",
    label: "Explanation",
    placeholder: "Five-minute explanation notes or recording link",
    icon: "mic",
  },
  {
    key: "measurement",
    label: "Measurement / context",
    placeholder: "Value + unit + sample size, or mark N/A",
    icon: "gauge",
  },
  {
    key: "limitation",
    label: "Limitation",
    placeholder: "One honest limitation or trade-off",
    icon: "scale",
  },
  {
    key: "helpUsed",
    label: "Help / AI disclosure",
    placeholder: "independent / docs-only / assisted; was the core AI-authored?",
    icon: "hand-helping",
  },
  {
    key: "externalReviewStatus",
    label: "External review",
    placeholder: "Reviewer + notes, or NOT EXTERNALLY REVIEWED",
    icon: "user-check",
  },
];
