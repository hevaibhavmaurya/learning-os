import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const statePath = mkdtempSync(path.join(tmpdir(), "learning-os-e2e-"));
const root = process.cwd();
const executable = (name) => path.join(root, "node_modules", ".bin", name);

function cleanup() {
  rmSync(statePath, { recursive: true, force: true });
}

const migrations = spawnSync(executable("wrangler"), [
  "d1", "migrations", "apply", "learning-os", "--local", "--config", "wrangler.jsonc", "--persist-to", statePath,
], { cwd: root, stdio: "inherit", env: { ...process.env, CI: "true" } });

if (migrations.status !== 0) {
  if (migrations.error) console.error(migrations.error);
  cleanup();
  process.exit(migrations.status ?? 1);
}

const server = spawn(executable("vite"), ["--port", "43124", "--strictPort"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, LOS_E2E_PERSIST_PATH: statePath, LOS_WRANGLER_CONFIG: "./wrangler.jsonc" },
});

let stopping = false;
let failed = false;
function stop(signal) {
  if (stopping) return;
  stopping = true;
  server.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
server.on("error", (error) => {
  console.error(error);
  failed = true;
});
server.on("exit", (code) => {
  cleanup();
  process.exit(failed ? 1 : code ?? (stopping ? 0 : 1));
});
