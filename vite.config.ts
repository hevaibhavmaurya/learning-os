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
      configPath: process.env.LOS_WRANGLER_CONFIG ?? "./wrangler.dev.jsonc",
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
