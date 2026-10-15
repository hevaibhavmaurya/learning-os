/**
 * Architecture audit against IMPLEMENTATION_PLAN.md §3.
 *
 * Fails if the active application reintroduces:
 * - a central view switch that mounts feature screens from one root module
 * - an all-data workspace bootstrap (unbounded SELECT * / getState for real data)
 * - a generic act / catch-all mutation dispatcher
 *
 * Demo-isolated adapters may expose getState for snapshots; that is allowed
 * only under src/features/demo/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

type Finding = { severity: "fail" | "warn" | "ok"; message: string };

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(p: string): string {
  return path.relative(ROOT, p);
}

const findings: Finding[] = [];

// 1) Dedicated routes: authenticated layout must use outlet, not import every screen.
const authLayout = path.join(SRC, "app/routes/_authenticated.tsx");
if (fs.existsSync(authLayout)) {
  const text = fs.readFileSync(authLayout, "utf8");
  const importsScreens =
    /from ["']@\/features\/(today|roadmap|weeks|projects|library|studio|progress|settings)/.test(
      text,
    );
  if (importsScreens) {
    findings.push({
      severity: "fail",
      message: `${rel(authLayout)} imports feature screens — central view switch`,
    });
  } else if (!/AppShell/.test(text)) {
    findings.push({
      severity: "warn",
      message: `${rel(authLayout)} does not reference AppShell`,
    });
  } else {
    findings.push({
      severity: "ok",
      message: "Authenticated layout uses shell outlet, not feature screen imports",
    });
  }
} else {
  findings.push({
    severity: "fail",
    message: "Missing src/app/routes/_authenticated.tsx",
  });
}

// 2) No root index that switches on view=
const rootIndex = path.join(SRC, "app/routes/index.tsx");
if (fs.existsSync(rootIndex)) {
  const text = fs.readFileSync(rootIndex, "utf8");
  if (/view\s*===|switch\s*\(.*view|case ["']today["']/.test(text)) {
    findings.push({
      severity: "fail",
      message: `${rel(rootIndex)} still switches screens by view`,
    });
  } else {
    findings.push({
      severity: "ok",
      message: "Root route redirects; no central view switch",
    });
  }
}

// 3) No generic act dispatcher on real API surface
const serverFiles = walk(path.join(SRC, "server"));
const actHits = serverFiles.filter((f) => {
  if (f.includes(`${path.sep}demo${path.sep}`)) return false;
  const text = fs.readFileSync(f, "utf8");
  return (
    /action\s*:\s*z\.string\(\)/.test(text) ||
    /case\s+["']act["']/.test(text) ||
    /function\s+act\s*\(/.test(text) ||
    /\/api\/act\b/.test(text) ||
    /\bact\s*\(\s*action\s*,/.test(text)
  );
});
if (actHits.length > 0) {
  findings.push({
    severity: "fail",
    message: `Generic act dispatcher signals: ${actHits.map(rel).join(", ")}`,
  });
} else {
  findings.push({
    severity: "ok",
    message: "No generic act dispatcher on server feature routes",
  });
}

// 4) No all-data getState outside demo adapter
const clientFiles = walk(SRC);
const getStateHits = clientFiles.filter((f) => {
  if (f.includes(`${path.sep}demo${path.sep}`)) return false;
  if (f.includes(`${path.sep}features${path.sep}demo${path.sep}`)) return false;
  const text = fs.readFileSync(f, "utf8");
  return (
    /\bgetState\s*\(/.test(text) ||
    /SELECT\s+\*\s+FROM\s+weeks/i.test(text) ||
    /workspace.?bootstrap/i.test(text)
  );
});
if (getStateHits.length > 0) {
  findings.push({
    severity: "fail",
    message: `All-data getState / workspace bootstrap outside demo: ${getStateHits.map(rel).join(", ")}`,
  });
} else {
  findings.push({
    severity: "ok",
    message:
      "No all-data getState outside isolated demo adapter (demo getState allowed)",
  });
}

// 5) Feature route modules exist
const requiredRoutes = [
  "login.tsx",
  "_authenticated.today.tsx",
  "_authenticated.roadmap.tsx",
  "_authenticated.weeks.$weekNumber.$tab.tsx",
  "_authenticated.projects.index.tsx",
  "_authenticated.library.index.tsx",
  "_authenticated.studio.index.tsx",
  "_authenticated.progress.tsx",
  "_authenticated.settings.tsx",
];
const missing = requiredRoutes.filter(
  (name) => !fs.existsSync(path.join(SRC, "app/routes", name)),
);
if (missing.length) {
  findings.push({
    severity: "fail",
    message: `Missing dedicated routes: ${missing.join(", ")}`,
  });
} else {
  findings.push({
    severity: "ok",
    message: "Dedicated TanStack route modules present for primary destinations",
  });
}

const fails = findings.filter((f) => f.severity === "fail");
const warns = findings.filter((f) => f.severity === "warn");
const oks = findings.filter((f) => f.severity === "ok");

console.log("Architecture audit (Section 3)");
for (const f of findings) {
  const tag =
    f.severity === "fail" ? "FAIL" : f.severity === "warn" ? "WARN" : "OK";
  console.log(`  [${tag}] ${f.message}`);
}
console.log(
  `\nSummary: ${oks.length} ok, ${warns.length} warn, ${fails.length} fail`,
);

const outDir = path.join(ROOT, "docs");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "ARCHITECTURE_AUDIT.md"),
  [
    "# Architecture audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Confirms IMPLEMENTATION_PLAN §3 invariants:",
    "",
    "- no central view switch mounting every screen from one root module",
    "- no all-data workspace `getState` bootstrap for real learner data",
    "- no generic `act` mutation dispatcher",
    "- dedicated lazy route modules under `src/app/routes/`",
    "",
    "Isolated demo adapter `getState` under `src/features/demo/` is allowed.",
    "",
    "## Results",
    "",
    ...findings.map(
      (f) =>
        `- **${f.severity.toUpperCase()}**: ${f.message}`,
    ),
    "",
    fails.length === 0
      ? "Verdict: **PASS**"
      : "Verdict: **FAIL** — fix before claiming Phase 7 architecture item done.",
    "",
  ].join("\n"),
);

if (fails.length > 0) {
  process.exit(1);
}
