import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/app/routes",
      generatedRouteTree: "./src/app/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    cloudflare({
      configPath: process.env.LOS_WRANGLER_CONFIG ?? "./wrangler.jsonc",
      config: (config) => {
        if (process.env.LOS_E2E_PERSIST_PATH) {
          return {
            vars: {
              ...config.vars,
              OWNER_EMAIL: "vaibhav@example.com",
              APP_ORIGIN: "http://127.0.0.1:43124",
              SESSION_PEPPER: "e2e-session-pepper",
              ENVIRONMENT: "development",
              E2E_AUTH_FIXTURE: "true",
            },
          };
        }
        return {
          vars: {
            ...config.vars,
            OWNER_EMAIL: "vaibhav@example.com",
            APP_ORIGIN: "http://127.0.0.1:43123",
            SESSION_PEPPER: "local-dev-session-pepper-change-me",
            ENVIRONMENT: "development",
          },
        };
      },
      persistState: process.env.LOS_E2E_PERSIST_PATH
        ? { path: process.env.LOS_E2E_PERSIST_PATH }
        : true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@content": path.resolve(__dirname, "./content"),
    },
  },
  server: {
    port: 43123,
    strictPort: true,
    host: "127.0.0.1",
  },
  preview: {
    port: 43123,
    strictPort: true,
    host: "127.0.0.1",
  },
});
