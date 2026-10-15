#!/usr/bin/env tsx
/**
 * Deterministic Markdown → content/roadmap.json pipeline.
 * Authority: reference/roadmap.md
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE = resolve(ROOT, "reference/roadmap.md");
const OUTPUT_DIR = process.env.CONTENT_OUTPUT_DIR ?? resolve(ROOT, "content");
const OUT_JSON = resolve(OUTPUT_DIR, "roadmap.json");
const OUT_FULL = resolve(OUTPUT_DIR, "roadmap.full.md");
const SCHEMA_VERSION = 1;
const IMPORT_VERSION = 1;

type Link = { title: string; url: string; note?: string };

function sha256(buf: string | Buffer) {
  return createHash("sha256").update(buf).digest("hex");
}

function parseMdLinks(text: string): Link[] {
  const links: Link[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)(?:\s*\(([^)]+)\))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    links.push({
      title: m[1].trim(),
      url: m[2].trim(),
      ...(m[3] ? { note: m[3].trim() } : {}),
    });
  }
  return links;
}

function parseBeginLine(body: string): { beginWith: Link | null; nextReference: Link | null } {
  const beginMatch = body.match(/^\[([^\]]+)\]\(([^)]+)\)/);
  const beginWith = beginMatch
    ? { title: beginMatch[1], url: beginMatch[2] }
    : null;
  const nextMatch = body.match(/\*\*Next \/ reference:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/);
  const nextReference = nextMatch
    ? { title: nextMatch[1], url: nextMatch[2] }
    : null;
  return { beginWith, nextReference };
}

function extractBullet(lines: string[], start: number, key: string): { value: string; next: number } | null {
  const prefix = `- **${key}:**`;
  const line = lines[start];
  if (!line?.startsWith(prefix)) return null;
  return { value: line.slice(prefix.length).trim(), next: start + 1 };
}

function main() {
  const raw = readFileSync(SOURCE, "utf8");
  const hash = sha256(raw);
  const lines = raw.split(/\r?\n/);

  const title = (lines[0] ?? "").replace(/^#\s+/, "").trim();
  const versionLine = lines.find((l) => l.includes("**Version")) ?? "";
  const versionMatch = versionLine.match(/\*\*Version\s+([\d.]+)\s*·\s*([^·]+)\s*·\s*(.+)\*\*/);
  const meta = {
    title,
    internalVersionLabel: versionMatch?.[1] ?? "unknown",
    date: versionMatch?.[2]?.trim() ?? "",
    claim: versionMatch?.[3]?.trim() ?? "",
    plannedWeeks: 91 as const,
    hoursPerWeek: 13 as const,
    plannedHours: 1183 as const,
    sourcePath: "reference/roadmap.md",
    sourceFilename: "roadmap.md",
    sourceSha256: hash,
    schemaVersion: SCHEMA_VERSION,
    importVersion: IMPORT_VERSION,
    filenameVersionHint: "v5_1",
  };

  const stages = [
    { id: 1, weekStart: 1, weekEnd: 47, label: "Stage 1 — Foundations through FDE delivery" },
    { id: 2, weekStart: 48, weekEnd: 91, label: "Stage 2 — Deep specialization (optional)" },
  ];

  const blocks: Array<Record<string, unknown>> = [];
  const weeks: Array<Record<string, unknown>> = [];
  let currentBlock: {
    id: number;
    title: string;
    weekStart: number;
    weekEnd: number;
    stage: number;
    referenceShelf: Link[];
    goalCheckpoint: string;
    primaryResources: Link[];
    furtherSources?: Link[];
    blockEndGate: string;
    sourceLines: { start: number; end: number };
  } | null = null;

  const blockRe =
    /^### Block (\d+)\s+-\s+(.+?) · Weeks (\d+)–(\d+) · Stage (\d+)\s*$/;
  // Note: heading uses "  -  " (spaces around hyphen) — normalize
  const blockReLoose =
    /^### Block (\d+)\s+-\s+(.+?)\s+·\s+Weeks\s+(\d+)[–-](\d+)\s+·\s+Stage\s+(\d+)\s*$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const bm = line.match(blockRe) || line.match(blockReLoose);
    if (bm) {
      if (currentBlock) {
        currentBlock.sourceLines.end = i;
        blocks.push(currentBlock);
      }
      currentBlock = {
        id: Number(bm[1]),
        title: bm[2].trim(),
        weekStart: Number(bm[3]),
        weekEnd: Number(bm[4]),
        stage: Number(bm[5]),
        referenceShelf: [],
        goalCheckpoint: "",
        primaryResources: [],
        blockEndGate: "",
        sourceLines: { start: i + 1, end: i + 1 },
      };
      i++;
      continue;
    }

    if (currentBlock && line.startsWith("**University-style reference shelf")) {
      const body = line.replace(/^\*\*[^:]+:\*\*\s*/, "");
      currentBlock.referenceShelf = parseMdLinks(body);
      i++;
      continue;
    }
    if (currentBlock && line.startsWith("**Goal/checkpoint:**")) {
      currentBlock.goalCheckpoint = line.replace("**Goal/checkpoint:**", "").trim();
      i++;
      continue;
    }
    if (currentBlock && line.startsWith("**Primary resources:**")) {
      currentBlock.primaryResources = parseMdLinks(line.replace("**Primary resources:**", "").trim());
      i++;
      continue;
    }
    if (currentBlock && line.startsWith("**Further sources, as needed:**")) {
      currentBlock.furtherSources = parseMdLinks(
        line.replace("**Further sources, as needed:**", "").trim(),
      );
      i++;
      continue;
    }
    if (currentBlock && line.startsWith("**Block-end gate")) {
      currentBlock.blockEndGate = line.replace(/^\*\*[^:]+:\*\*\s*/, "").trim();
      i++;
      continue;
    }

    const wm = line.match(/^\*\*Week (\d+):\s*(.+)\*\*\s*$/);
    if (wm && currentBlock) {
      const number = Number(wm[1]);
      const weekTitle = wm[2].trim();
      let j = i + 1;
      const fields: Record<string, string> = {};
      const fieldOrder = [
        "Learn (core)",
        "Build / experiment",
        "University-style independent assignment (core)",
        "Unseen assessment & transfer",
        "Begin with",
        "Evidence to save",
      ] as const;
      for (const key of fieldOrder) {
        while (j < lines.length && lines[j].trim() === "") j++;
        const got = extractBullet(lines, j, key);
        if (!got) {
          throw new Error(`Week ${number}: missing field "${key}" at line ${j + 1}`);
        }
        fields[key] = got.value;
        j = got.next;
      }
      // Optional minimum-to-pass after blank line(s)
      let minimumToPass: string | null = null;
      let k = j;
      while (k < lines.length && lines[k].trim() === "") k++;
      const mtp = extractBullet(lines, k, "Minimum to pass (bounded core)");
      if (mtp) {
        minimumToPass = mtp.value;
        j = mtp.next;
      }

      const educationalDemoOnly =
        /reproducible small educational demonstration is sufficient/i.test(
          fields["Evidence to save"] ?? "",
        );
      const { beginWith, nextReference } = parseBeginLine(fields["Begin with"] ?? "");

      weeks.push({
        number,
        title: weekTitle,
        blockId: currentBlock.id,
        learn: fields["Learn (core)"],
        build: fields["Build / experiment"],
        assignment: fields["University-style independent assignment (core)"],
        assessment: fields["Unseen assessment & transfer"],
        beginWith,
        nextReference,
        evidence: fields["Evidence to save"],
        educationalDemoOnly,
        minimumToPass,
        isBoundedCore: Boolean(minimumToPass),
        sourceLine: i + 1,
      });
      i = j;
      continue;
    }

    // Stop block scanning when projects section starts
    if (line.startsWith("## Project specifications")) {
      if (currentBlock) {
        currentBlock.sourceLines.end = i;
        blocks.push(currentBlock);
        currentBlock = null;
      }
      break;
    }
    i++;
  }
  if (currentBlock) {
    currentBlock.sourceLines.end = lines.length;
    blocks.push(currentBlock);
  }

  // Projects
  const projects: Array<Record<string, unknown>> = [];
  const projectStart = lines.findIndex((l) => l.startsWith("## Project specifications"));
  const projectEnd = lines.findIndex((l) => l.startsWith("## University-inspired examination"));
  const projLines = lines.slice(projectStart, projectEnd === -1 ? undefined : projectEnd);
  for (let p = 0; p < projLines.length; p++) {
    const pm = projLines[p].match(/^### (P\d{2})\.\s+(.+)$/);
    if (!pm) continue;
    const id = pm[1];
    const projectTitle = pm[2].trim();
    let q = p + 1;
    const take = (key: string) => {
      while (q < projLines.length && projLines[q].trim() === "") q++;
      const got = extractBullet(projLines, q, key);
      if (!got) throw new Error(`Project ${id}: missing ${key}`);
      q = got.next;
      return got.value;
    };
    const weeksScope = take("Curriculum weeks");
    // "1–47. **Scope:** Core ..."
    const ws = weeksScope.match(/^(\d+)[–-](\d+)\.\s*\*\*Scope:\*\*\s*(.+)$/);
    const weekStart = ws ? Number(ws[1]) : 0;
    const weekEnd = ws ? Number(ws[2]) : 0;
    const scope = ws ? ws[3].trim() : weeksScope;
    const optional = /optional/i.test(scope);
    const purpose = take("Purpose and boundary");
    const functionalRequirements = take("Functional requirements");
    const milestones = take("Implementation milestones");
    const acceptanceTests = take("Acceptance tests and measurable checks");
    const requiredEvidence = take("Required evidence");
    const learningReferencesRaw = take("Learning references");
    const exitCondition = take("Exit condition");
    projects.push({
      id,
      title: projectTitle,
      weekStart,
      weekEnd,
      scope,
      optional,
      purpose,
      functionalRequirements,
      milestones,
      acceptanceTests,
      requiredEvidence,
      learningReferences: parseMdLinks(learningReferencesRaw),
      exitCondition,
      sourceLine: projectStart + p + 1,
    });
    p = q - 1;
  }

  // Link projects onto weeks by range
  for (const w of weeks) {
    const n = w.number as number;
    w.projectIds = projects
      .filter((p) => n >= (p.weekStart as number) && n <= (p.weekEnd as number))
      .map((p) => p.id as string);
  }

  // Milestones table
  const milestones: Array<Record<string, unknown>> = [];
  const msIdx = lines.findIndex((l) => l.startsWith("## Milestones and acceptance"));
  if (msIdx >= 0) {
    for (let m = msIdx; m < lines.length; m++) {
      const row = lines[m].match(/^\|\s*([^|]+)\|\s*([^|]+)\|/);
      if (!row) continue;
      const weekCell = row[1].trim();
      const evidence = row[2].trim();
      if (weekCell === "Week" || weekCell.startsWith("---")) continue;
      const weekParts = weekCell.split(/\s*\/\s*/).map((x) => Number(x.trim())).filter((n) => !Number.isNaN(n));
      if (!weekParts.length) continue;
      milestones.push({
        weeks: weekParts,
        evidence,
        rawWeekCell: weekCell,
      });
    }
  }

  // Resource routing table
  const resourceRouting: Array<Record<string, unknown>> = [];
  const rrIdx = lines.findIndex((l) => l.startsWith("## At-a-glance 91-week resource"));
  if (rrIdx >= 0) {
    for (let m = rrIdx; m < lines.length && !lines[m].startsWith("## Milestones"); m++) {
      const row = lines[m].match(/^\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/);
      if (!row) continue;
      const blockCell = row[1].trim();
      if (blockCell === "Block" || blockCell.startsWith("---")) continue;
      const blockIdMatch = blockCell.match(/Block\s+(\d+)/i) || blockCell.match(/^(\d+)/);
      resourceRouting.push({
        blockId: blockIdMatch ? Number(blockIdMatch[1]) : null,
        label: blockCell,
        weeks: row[2].trim(),
        universityAnchor: row[3].trim(),
        practicalCompanion: row[4].trim(),
      });
    }
  }

  // Templates (capture fenced blocks under Copy/paste templates)
  const templates: Record<string, string> = {};
  const tplIdx = lines.findIndex((l) => l.startsWith("## Copy/paste templates"));
  if (tplIdx >= 0) {
    let name = "";
    let buf: string[] = [];
    let inFence = false;
    for (let t = tplIdx; t < lines.length; t++) {
      if (lines[t].startsWith("## ") && t !== tplIdx) break;
      const hm = lines[t].match(/^###\s+`?([^`]+)`?/);
      if (hm && !inFence) {
        if (name && buf.length) templates[name] = buf.join("\n").trim();
        name = hm[1].trim();
        buf = [];
        continue;
      }
      if (lines[t].startsWith("```")) {
        inFence = !inFence;
        continue;
      }
      if (inFence) buf.push(lines[t]);
    }
    if (name && buf.length) templates[name] = buf.join("\n").trim();
  }

  const policies = {
    assessment: {
      gates: ["Recall", "Build", "Debug", "Transfer"],
      passThreshold: 3,
      scoreMax: 4,
      progressionStates: ["PLANNED", "ATTEMPTED", "DONE", "VERIFIED"],
      flags: ["REVIEW_DUE", "GAP"],
      retentionOffsetsDays: [7, 28, 56, 112], // 1/4/8/16 weeks × 7 days
    },
    prerequisites: [
      {
        id: "diagnostic_w1",
        label: "Week 1 two-hour diagnostic",
        gatesWeek: 1,
        kind: "diagnostic",
      },
      {
        id: "python_w24",
        label: "Python checkpoint before Week 24 verification",
        gatesWeek: 24,
        unlocksWeek: 25,
        kind: "python",
      },
      {
        id: "systems_w48",
        label: "Systems-language checkpoint before Stage 2 assessed work",
        gatesWeek: 48,
        kind: "systems",
      },
      {
        id: "gpu_w76",
        label: "Measured GPU evidence for Week 76",
        gatesWeek: 76,
        kind: "hardware_gpu",
      },
      {
        id: "pilot_consent",
        label: "Real-data consent or SIMULATED pilot mode",
        gatesWeek: 43,
        kind: "consent",
      },
    ],
    templates,
    examinationProtocolSourceLines: [1136, 1145],
    pilotSourceLines: [1236, 1242],
    boundedCoreWeeks: [26, 28, 31, 63, 64, 65, 73, 76, 77, 78, 79, 83, 84, 87, 88, 89],
  };

  const doc = {
    meta,
    stages,
    blocks,
    weeks,
    projects,
    milestones,
    resourceRouting,
    policies,
  };

  // Validations
  const errors: string[] = [];
  if (weeks.length !== 91) errors.push(`expected 91 weeks, got ${weeks.length}`);
  if (blocks.length !== 14) errors.push(`expected 14 blocks, got ${blocks.length}`);
  if (projects.length !== 10) errors.push(`expected 10 projects, got ${projects.length}`);
  if (milestones.length !== 11) errors.push(`expected 11 milestones, got ${milestones.length}`);
  const nums = weeks.map((w) => w.number as number).sort((a, b) => a - b);
  for (let n = 1; n <= 91; n++) {
    if (nums[n - 1] !== n) errors.push(`missing or duplicate week ${n}`);
  }
  const mtpWeeks = weeks.filter((w) => w.minimumToPass).map((w) => w.number as number);
  for (const n of policies.boundedCoreWeeks) {
    if (!mtpWeeks.includes(n)) errors.push(`missing minimumToPass for week ${n}`);
  }
  if (mtpWeeks.length !== 16) errors.push(`expected 16 MTP weeks, got ${mtpWeeks.length}`);
  const p02 = projects.find((p) => p.id === "P02");
  if (!p02 || !p02.optional) errors.push("P02 must be marked optional");

  // Non-overlapping blocks
  const sortedBlocks = [...blocks].sort((a, b) => (a.weekStart as number) - (b.weekStart as number));
  for (let b = 1; b < sortedBlocks.length; b++) {
    if ((sortedBlocks[b].weekStart as number) !== (sortedBlocks[b - 1].weekEnd as number) + 1) {
      errors.push(
        `block gap/overlap between ${sortedBlocks[b - 1].id} and ${sortedBlocks[b].id}`,
      );
    }
  }

  if (errors.length) {
    console.error("content:build validation failed:\n" + errors.map((e) => ` - ${e}`).join("\n"));
    process.exit(1);
  }

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  const json = JSON.stringify(doc, null, 2) + "\n";
  writeFileSync(OUT_JSON, json);
  // Sanitized full roadmap copy for in-app read-only browsing
  writeFileSync(OUT_FULL, raw);
  const manifest = {
    sourceSha256: hash,
    contentSha256: sha256(json),
    generatedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    importVersion: IMPORT_VERSION,
    counts: {
      weeks: weeks.length,
      blocks: blocks.length,
      projects: projects.length,
      milestones: milestones.length,
      boundedCore: mtpWeeks.length,
    },
  };
  writeFileSync(resolve(OUTPUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `content:build OK — ${weeks.length} weeks, ${blocks.length} blocks, ${projects.length} projects, ${milestones.length} milestones, ${mtpWeeks.length} MTP`,
  );
}

main();
