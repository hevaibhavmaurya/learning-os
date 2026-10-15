import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import {
  attemptCreateResponseSchema,
  evidenceResponseSchema,
  timeEntryCreateResponseSchema,
  verifyResponseSchema,
  type AttemptCreate,
  type EvidenceUpsert,
  type TimeEntryCreate,
  type VerifyRequest,
} from "@/shared/contracts/weeks";
import { weekKeys } from "./query-keys";

function invalidateWeekSurface(
  qc: ReturnType<typeof useQueryClient>,
  weekNumber: number,
) {
  void qc.invalidateQueries({ queryKey: weekKeys.detail(weekNumber) });
  void qc.invalidateQueries({ queryKey: ["today"] });
  void qc.invalidateQueries({ queryKey: ["roadmap"] });
}

export async function createAttempt(input: AttemptCreate) {
  const { weekNumber, ...rest } = input;
  const data = await apiFetch<unknown>(`/api/weeks/${weekNumber}/attempts`, {
    method: "POST",
    body: rest,
  });
  return attemptCreateResponseSchema.parse(data);
}

export async function upsertEvidence(input: EvidenceUpsert) {
  const { weekNumber, acceptanceChecks, extrasJson, ...rest } = input;
  let extras = extrasJson ?? null;
  if (acceptanceChecks !== undefined) {
    try {
      const parsed = extras ? (JSON.parse(extras) as Record<string, unknown>) : {};
      parsed.acceptanceChecks = acceptanceChecks;
      extras = JSON.stringify(parsed);
    } catch {
      extras = JSON.stringify({ acceptanceChecks });
    }
  }
  const data = await apiFetch<unknown>(`/api/weeks/${weekNumber}/evidence`, {
    method: "PUT",
    body: { ...rest, extrasJson: extras },
  });
  return evidenceResponseSchema.parse(data);
}

export async function submitEvidence(input: {
  weekNumber: number;
  expectedRevision: number;
}) {
  const data = await apiFetch<unknown>(
    `/api/weeks/${input.weekNumber}/evidence/submit`,
    {
      method: "POST",
      body: { expectedRevision: input.expectedRevision },
    },
  );
  return evidenceResponseSchema.parse(data);
}

export async function reopenEvidence(input: {
  weekNumber: number;
  expectedRevision: number;
}) {
  // Reopen is modeled as an evidence upsert clearing submittedAt via server;
  // until a dedicated route exists, PUT with revision bump is not enough.
  // Call submit inverse endpoint when available; for now surface a clear error.
  const data = await apiFetch<unknown>(
    `/api/weeks/${input.weekNumber}/evidence/reopen`,
    {
      method: "POST",
      body: { expectedRevision: input.expectedRevision },
    },
  );
  return evidenceResponseSchema.parse(data);
}

export async function verifyWeek(input: VerifyRequest) {
  const data = await apiFetch<unknown>(
    `/api/weeks/${input.weekNumber}/verify`,
    {
      method: "POST",
      body: {
        expectedRevision: input.expectedRevision,
        learnerConfirmed: input.learnerConfirmed,
      },
    },
  );
  return verifyResponseSchema.parse(data);
}

export async function createTimeEntry(input: TimeEntryCreate) {
  const minutes = Math.round(input.hours * 60);
  const occurredOn = new Date().toISOString().slice(0, 10);
  const data = await apiFetch<{
    id: string;
    weekNumber: number;
    minutes: number;
    createdAt: string;
  }>(`/api/weeks/${input.weekNumber}/time`, {
    method: "POST",
    body: {
      minutes,
      note: input.activity,
      occurredOn,
    },
  });
  return timeEntryCreateResponseSchema.parse({
    id: data.id,
    weekNumber: data.weekNumber,
    hours: input.hours,
    activity: input.activity,
    loggedAt: data.createdAt,
  });
}

export function useCreateAttemptMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAttempt,
    onSuccess: () => invalidateWeekSurface(qc, weekNumber),
  });
}

export function useUpsertEvidenceMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertEvidence,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: weekKeys.detail(weekNumber) });
    },
  });
}

export function useSubmitEvidenceMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitEvidence,
    onSuccess: () => invalidateWeekSurface(qc, weekNumber),
  });
}

export function useReopenEvidenceMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reopenEvidence,
    onSuccess: () => invalidateWeekSurface(qc, weekNumber),
  });
}

export function useVerifyWeekMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verifyWeek,
    onSuccess: () => invalidateWeekSurface(qc, weekNumber),
  });
}

export function useCreateTimeEntryMutation(weekNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: weekKeys.detail(weekNumber) });
    },
  });
}
