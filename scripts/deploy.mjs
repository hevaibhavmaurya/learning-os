import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const configPath = join(root, "wrangler.production.jsonc");
const requiredSecrets = ["GOOGLE_CLIENT_SECRET", "SESSION_PEPPER"];

function fail(message) {
  console.error(`Deployment blocked: ${message}`);
  process.exit(1);
}

if (!existsSync(configPath)) {
  fail("copy wrangler.production.example.jsonc to the ignored wrangler.production.jsonc and configure real resources first");
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
  fail("wrangler.production.jsonc must contain valid JSON");
}

const vars = config.vars ?? {};
const db = config.d1_databases?.find((entry) => entry.binding === "DB");
const media = config.r2_buckets?.find((entry) => entry.binding === "MEDIA");
if (!config.name || config.name.includes("REPLACE")) fail("set the production Worker name");
if (vars.ENVIRONMENT !== "production") {
  fail("production must set ENVIRONMENT=production");
}
if (!db?.database_id || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(db.database_id) || /^0{8}-/.test(db.database_id)) {
  fail("set a real production D1 database ID");
}
if (!media?.bucket_name || media.bucket_name.includes("REPLACE")) fail("set a real R2 bucket");
if (!vars.OWNER_EMAIL?.includes("@") || vars.OWNER_EMAIL.includes("REPLACE")) fail("set the production owner email");
if (!vars.APP_ORIGIN?.startsWith("https://") || vars.APP_ORIGIN.includes("REPLACE")) fail("set the HTTPS application origin");
if (!vars.GOOGLE_CLIENT_ID || vars.GOOGLE_CLIENT_ID.includes("REPLACE")) fail("set the Google OAuth web client ID");
if (requiredSecrets.some((name) => name in vars || !config.secrets?.required?.includes(name))) {
  fail("declare GOOGLE_CLIENT_SECRET and SESSION_PEPPER as required secrets, never vars");
}

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
  .find((path) => existsSync(path) && JSON.parse(readFileSync(path, "utf8")).name === config.name);
if (!generated) fail("production build did not emit a matching Wrangler configuration");

const deployed = spawnSync(join(root, "node_modules/.bin/wrangler"), ["deploy", "--config", generated], {
  cwd: root,
  env: deployEnv,
  stdio: "inherit",
});
process.exit(deployed.status ?? 1);
