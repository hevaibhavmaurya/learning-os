#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function main() {
  const source = readFileSync(resolve(ROOT, "reference/roadmap.md"), "utf8");
  const expectedSource = "91f6581cfe57d985881617bd7cba43da8bd8d8dee852e909d4b9d789fcf9e595";
  const actualSource = sha256(source);
  if (actualSource !== expectedSource) {
    console.error(`roadmap.md checksum mismatch:\n expected ${expectedSource}\n got      ${actualSource}`);
    process.exit(1);
  }

  const index7 = readFileSync(resolve(ROOT, "reference/index7.html"));
  const expectedIndex = "830210fa34f3b6f8de6b246238ed98bcbee45df6fc1a86ee0eb2cf41a5578743";
  const actualIndex = createHash("sha256").update(index7).digest("hex");
  if (actualIndex !== expectedIndex) {
    console.error(`index7.html checksum mismatch:\n expected ${expectedIndex}\n got      ${actualIndex}`);
    process.exit(1);
  }

  if (!existsSync(resolve(ROOT, "content/roadmap.json"))) {
    console.error("content/roadmap.json missing — run pnpm content:build");
    process.exit(1);
  }

  const before = readFileSync(resolve(ROOT, "content/roadmap.json"), "utf8");
  const beforeFull = readFileSync(resolve(ROOT, "content/roadmap.full.md"), "utf8");
  const beforeManifest = existsSync(resolve(ROOT, "content/manifest.json"))
    ? readFileSync(resolve(ROOT, "content/manifest.json"), "utf8")
    : "";

  const outputDir = mkdtempSync(join(tmpdir(), "learning-os-content-check-"));
  let after: string;
  let afterManifest: string;
  let afterFull: string;
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/content-build.ts"], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, CONTENT_OUTPUT_DIR: outputDir },
    });
    if (result.status !== 0) {
      console.error(result.stdout);
      console.error(result.stderr);
      process.exitCode = result.status ?? 1;
      return;
    }
    after = readFileSync(resolve(outputDir, "roadmap.json"), "utf8");
    afterManifest = readFileSync(resolve(outputDir, "manifest.json"), "utf8");
    afterFull = readFileSync(resolve(outputDir, "roadmap.full.md"), "utf8");
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }

  // Compare content ignoring generatedAt timestamp in manifest
  const normalizeManifest = (s: string) => {
    try {
      const j = JSON.parse(s) as { generatedAt?: string };
      delete j.generatedAt;
      return JSON.stringify(j);
    } catch {
      return s;
    }
  };

  if (before !== after) {
    console.error("content/roadmap.json drift detected — rebuild and commit");
    process.exit(1);
  }
  if (beforeFull !== afterFull) {
    console.error("content/roadmap.full.md drift detected — rebuild and commit");
    process.exit(1);
  }
  if (normalizeManifest(beforeManifest) !== normalizeManifest(afterManifest)) {
    console.error("content/manifest.json drift detected (excluding generatedAt)");
    process.exit(1);
  }

  const doc = JSON.parse(after) as {
    weeks: unknown[];
    blocks: unknown[];
    projects: unknown[];
    milestones: unknown[];
    policies: { boundedCoreWeeks: number[] };
  };
  if (doc.weeks.length !== 91 || doc.blocks.length !== 14 || doc.projects.length !== 10 || doc.milestones.length !== 11) {
    console.error("count validation failed in committed content");
    process.exit(1);
  }
  console.log("content:check OK");
}

main();
