import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SettingsPatch, SettingsResponse } from "@/shared/contracts/settings";
import { apiFetch } from "@/shared/lib/api";
import { settingsKeys } from "./query-keys";

export function usePatchSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SettingsPatch) =>
      apiFetch<SettingsResponse>("/api/settings", {
        method: "PATCH",
        body,
      }),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.detail(), data);
      void qc.invalidateQueries({ queryKey: settingsKeys.audit() });
    },
  });
}

export function useCreateOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { weekNumber: number; reason: string }) =>
      apiFetch<{ id: string; weekNumber: number; active: true }>(
        "/api/settings/overrides",
        { method: "POST", body },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.overrides() });
      void qc.invalidateQueries({ queryKey: settingsKeys.audit() });
    },
  });
}

export function useRevokeOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string; active: false; revokedAt: string }>(
        `/api/settings/overrides/${encodeURIComponent(id)}/revoke`,
        { method: "POST" },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.overrides() });
      void qc.invalidateQueries({ queryKey: settingsKeys.audit() });
    },
  });
}

export function useActivatePilot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      mode: "REAL" | "SIMULATED";
      consentDocumented: boolean;
      dataUseScope?: string;
    }) =>
      apiFetch<{ id: string; mode: string; activatedAt: string }>(
        "/api/settings/pilot/activate",
        { method: "POST", body },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.pilot() });
    },
  });
}

export function useLogPilotInterruption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: { reason?: string }) =>
      apiFetch<{ id: string; startedAt: string }>(
        "/api/settings/pilot/interruptions",
        { method: "POST", body: body ?? {} },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.pilot() });
    },
  });
}

export function useResumePilot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ id: string; endedAt: string }>(
      "/api/settings/pilot/interruptions/resume", { method: "POST" },
    ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.pilot() });
    },
  });
}

export function useExportJson() {
  return useMutation({
    mutationFn: async () => {
      const data = await apiFetch<unknown>("/api/export", {
        method: "POST",
        body: { includeMediaManifest: true, includeAudit: true },
      });
      return data;
    },
  });
}
