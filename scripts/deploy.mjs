import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const configPath = join(root, "wrangler.jsonc");

function fail(message) {
  console.error(`Deployment blocked: ${message}`);
  process.exit(1);
}

if (!existsSync(configPath)) {
  fail("wrangler.jsonc not found");
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
  fail("wrangler.jsonc must contain valid JSON");
}

const db = config.d1_databases?.find((entry) => entry.binding === "DB");
const media = config.r2_buckets?.find((entry) => entry.binding === "MEDIA");
if (!config.name) fail("set the production Worker name in wrangler.jsonc");
if (!db?.database_id || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(db.database_id) || /^0{8}-/.test(db.database_id)) {
  fail("set a real production D1 database ID in wrangler.jsonc");
}
if (!media?.bucket_name) fail("set a real R2 bucket in wrangler.jsonc");

const deployEnv = { ...process.env, LOS_WRANGLER_CONFIG: configPath };
for (const [command, args] of [
  [process.execPath, ["--import", "tsx", "scripts/content-check.ts"]],
  [join(root, "node_modules/.bin/tsc"), ["-b", "--pretty", "false"]],
  [join(root, "node_modules/.bin/vite"), ["build"]],
]) {
  const result = spawnSync(command, args, { cwd: root, env: deployEnv, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const buildRoot = join(root, "dist");
const generated = readdirSync(buildRoot)
  .map((name) => join(buildRoot, name, "wrangler.json"))
  .find((path) => existsSync(path));

const configToDeploy = generated ?? configPath;
const deployed = spawnSync(join(root, "node_modules/.bin/wrangler"), ["deploy", "--config", configToDeploy], {
  cwd: root,
  env: deployEnv,
  stdio: "inherit",
});
process.exit(deployed.status ?? 1);
