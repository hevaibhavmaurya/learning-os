import { describe, expect, it } from "vitest";
import app from "../../src/server/index";
import type { AppBindings } from "../../src/server/env";

const development = { ENVIRONMENT: "development" } as AppBindings;

describe("development API guard", () => {
  it("rejects a development Worker reached through a public hostname", async () => {
    const response = await app.request("https://app.example.com/api/health", {}, development);
    expect(response.status).toBe(503);
  });

  it("allows the local development health check", async () => {
    const response = await app.request("http://127.0.0.1/api/health", {}, development);
    expect(response.status).toBe(200);
  });
});
