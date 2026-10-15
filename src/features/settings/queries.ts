import { useQuery } from "@tanstack/react-query";
import {
  settingsResponseSchema,
  type SettingsResponse,
} from "@/shared/contracts/settings";
import { apiFetch } from "@/shared/lib/api";
import { settingsKeys } from "./query-keys";

export type OverrideItem = {
  id: string;
  weekNumber: number;
  reason: string;
  active: boolean;
  createdAt: string;
  revokedAt: string | null;
};

export type AuditItem = {
  id: string;
  action: string;
  detail: string;
  weekNumber: number | null;
  createdAt: string;
};

export type PilotResponse = {
  activated: boolean;
  pilot: {
    id: string;
    mode: "REAL" | "SIMULATED";
    consentDocumented: boolean;
    dataUseScope: string | null;
    activatedAt: string | null;
    completedAt: string | null;
    observations: string | null;
    interruptionCount: number;
    activeInterruptionId: string | null;
  } | null;
  clock: {
    elapsedDays: number;
    clockDays: number;
    periodElapsed: boolean;
    canMarkComplete: boolean;
    blockers: string[];
  } | null;
};

export async function fetchSettings(): Promise<SettingsResponse> {
  const data = await apiFetch<unknown>("/api/settings");
  return settingsResponseSchema.parse(data);
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: fetchSettings,
  });
}

export function useOverridesQuery() {
  return useQuery({
    queryKey: settingsKeys.overrides(),
    queryFn: async () => {
      const data = await apiFetch<{ items: OverrideItem[] }>(
        "/api/settings/overrides",
      );
      return data.items;
    },
  });
}

export function useAuditQuery() {
  return useQuery({
    queryKey: settingsKeys.audit(),
    queryFn: async () => {
      const data = await apiFetch<{ items: AuditItem[] }>(
        "/api/settings/audit?limit=30",
      );
      return data.items;
    },
  });
}

export function usePilotQuery() {
  return useQuery({
    queryKey: settingsKeys.pilot(),
    queryFn: () => apiFetch<PilotResponse>("/api/settings/pilot"),
  });
}
