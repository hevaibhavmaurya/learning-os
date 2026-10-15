import path from "node:path";
import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(__dirname, "src/server/db/migrations"),
  );

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@content": path.resolve(__dirname, "./content"),
      },
    },
    test: {
      include: ["tests/integration/**/*.test.ts"],
      setupFiles: ["./tests/integration/apply-migrations.ts"],
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.dev.jsonc" },
          miniflare: {
            bindings: {
              TEST_MIGRATIONS: migrations,
              GOOGLE_CLIENT_ID: "test-google-client",
              GOOGLE_CLIENT_SECRET: "test-google-secret",
              ENVIRONMENT: "test",
            },
          },
        },
      },
    },
  };
});
