import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  exportRequestSchema,
  exportResponseSchema,
} from "../../../shared/contracts/export";
import { createDb } from "../../db/client";
import {
  attempts,
  auditEvents,
  evidence,
  gaps,
  mediaObjects,
  notes,
  owners,
  personalProjects,
  pilotRecords,
  platformCopy,
  posts,
  prerequisites,
  reviews,
  roadmapProjectProgress,
  settings,
  timeEntries,
  weekProgress,
} from "../../db/schema";
import { RULE_VERSION, type AppEnv } from "../../env";
import { curriculumHash } from "../../lib/curriculum";
import { requireAuthMiddleware, requireOwner } from "../../middleware/auth";
import { parseJson } from "../../middleware/errors";

export const exportRoutes = new Hono<AppEnv>();
exportRoutes.use("*", requireAuthMiddleware());

exportRoutes.post("/", async (c) => {
  const ownerCtx = requireOwner(c);
  const body = await parseJson(c, exportRequestSchema);
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();

  const owner = await db
    .select({ id: owners.id, email: owners.email })
    .from(owners)
    .where(eq(owners.id, ownerCtx.id))
    .get();

  const sett = await db
    .select()
    .from(settings)
    .where(eq(settings.ownerId, ownerCtx.id))
    .get();

  const [
    weeks,
    attemptRows,
    evidenceRows,
    reviewRows,
    gapRows,
    prereqRows,
    timeRows,
    noteRows,
    postRows,
    copyRows,
    projectRows,
    personalRows,
    pilotRows,
    auditRows,
  ] = await Promise.all([
    db.select().from(weekProgress).where(eq(weekProgress.ownerId, ownerCtx.id)).all(),
    db.select().from(attempts).where(eq(attempts.ownerId, ownerCtx.id)).all(),
    db.select().from(evidence).where(eq(evidence.ownerId, ownerCtx.id)).all(),
    db.select().from(reviews).where(eq(reviews.ownerId, ownerCtx.id)).all(),
    db.select().from(gaps).where(eq(gaps.ownerId, ownerCtx.id)).all(),
    db.select().from(prerequisites).where(eq(prerequisites.ownerId, ownerCtx.id)).all(),
    db.select().from(timeEntries).where(eq(timeEntries.ownerId, ownerCtx.id)).all(),
    // Notes: include bodies in export (full recovery), unlike list API.
    db.select().from(notes).where(eq(notes.ownerId, ownerCtx.id)).all(),
    db.select().from(posts).where(eq(posts.ownerId, ownerCtx.id)).all(),
    db.select().from(platformCopy).where(eq(platformCopy.ownerId, ownerCtx.id)).all(),
    db.select().from(roadmapProjectProgress).where(eq(roadmapProjectProgress.ownerId, ownerCtx.id)).all(),
    db.select().from(personalProjects).where(eq(personalProjects.ownerId, ownerCtx.id)).all(),
    db.select().from(pilotRecords).where(eq(pilotRecords.ownerId, ownerCtx.id)).all(),
    body.includeAudit
      ? db.select().from(auditEvents).where(eq(auditEvents.ownerId, ownerCtx.id)).all()
      : Promise.resolve([]),
  ]);

  const media = body.includeMediaManifest
    ? await db
        .select({
          id: mediaObjects.id,
          r2Key: mediaObjects.r2Key,
          contentType: mediaObjects.contentType,
          byteSize: mediaObjects.byteSize,
          checksum: mediaObjects.checksum,
          status: mediaObjects.status,
        })
        .from(mediaObjects)
        .where(eq(mediaObjects.ownerId, ownerCtx.id))
        .all()
    : undefined;

  return c.json(
    exportResponseSchema.parse({
      schemaVersion: 1,
      exportedAt: now,
      curriculumHash: sett?.curriculumHash ?? curriculumHash(),
      ruleVersion: sett?.ruleVersion ?? RULE_VERSION,
      owner: { id: owner!.id, email: owner!.email },
      payload: {
        settings: sett,
        weekProgress: weeks,
        attempts: attemptRows,
        evidence: evidenceRows,
        reviews: reviewRows,
        gaps: gapRows,
        prerequisites: prereqRows,
        timeEntries: timeRows,
        notes: noteRows,
        posts: postRows,
        platformCopy: copyRows,
        roadmapProjectProgress: projectRows,
        personalProjects: personalRows,
        pilotRecords: pilotRows,
        auditEvents: auditRows,
      },
      ...(media ? { mediaManifest: media } : {}),
    }),
  );
});
