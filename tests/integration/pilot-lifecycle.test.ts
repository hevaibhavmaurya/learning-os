import { env, SELF } from "cloudflare:test";
import { expect, it } from "vitest";
import { seedOwnerAndSettings } from "../../src/server/db/seed";
import { testSessionCookie } from "./session";

it("starts, pauses, and resumes a simulated pilot without changing week progress", async () => {
  const owner = await seedOwnerAndSettings(env);
  await env.DB.prepare("UPDATE settings SET locking_enabled = 0 WHERE owner_id = ?")
    .bind(owner.ownerId).run();

  const origin = env.APP_ORIGIN;
  const cookie = await testSessionCookie();
  const headers = { origin, cookie, "content-type": "application/json" };

  const activated = await SELF.fetch("http://localhost/api/settings/pilot/activate", {
    method: "POST", headers,
    body: JSON.stringify({ mode: "SIMULATED", consentDocumented: false }),
  });
  expect(activated.status).toBe(201);

  const paused = await SELF.fetch("http://localhost/api/settings/pilot/interruptions", {
    method: "POST", headers, body: "{}",
  });
  expect(paused.status).toBe(201);
  const whilePaused = await (await SELF.fetch("http://localhost/api/settings/pilot", { headers })).json() as {
    pilot: { activeInterruptionId: string | null };
  };
  expect(whilePaused.pilot.activeInterruptionId).toBeTruthy();
  expect((await SELF.fetch("http://localhost/api/settings/pilot/interruptions", {
    method: "POST", headers, body: "{}",
  })).status).toBe(409);

  const resumed = await SELF.fetch("http://localhost/api/settings/pilot/interruptions/resume", {
    method: "POST", headers,
  });
  expect(resumed.status).toBe(200);
  const afterResume = await (await SELF.fetch("http://localhost/api/settings/pilot", { headers })).json() as {
    pilot: { activeInterruptionId: string | null };
  };
  expect(afterResume.pilot.activeInterruptionId).toBeNull();
  expect((await SELF.fetch("http://localhost/api/settings/pilot/interruptions/resume", {
    method: "POST", headers,
  })).status).toBe(409);

  const week = await (await SELF.fetch("http://localhost/api/weeks/43", { headers })).json() as {
    pilot: { simulated: boolean; interruptionCount: number } | null;
  };
  expect(week.pilot).toMatchObject({ simulated: true, interruptionCount: 1 });
  const verifiedWeeks = await env.DB.prepare("SELECT COUNT(*) AS n FROM week_progress WHERE status = 'VERIFIED'")
    .first<{ n: number }>();
  expect(verifiedWeeks?.n).toBe(0);
});
