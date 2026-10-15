import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demoAdapter } from "./adapter";
import {
  type AppDataMode,
  type DemoSnapshotId,
  writeDataMode,
} from "./mode";
import { demoKeys } from "./query-keys";

/** Invalidate only the isolated `demo:` namespace. */
function invalidateDemo(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: demoKeys.all });
}

export function useSwitchDemoMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode: AppDataMode) => {
      const res = await demoAdapter.switchMode(mode);
      writeDataMode(mode);
      return res;
    },
    onSuccess: () => {
      void invalidateDemo(qc);
    },
  });
}

export function useLoadDemoSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (snapshot: DemoSnapshotId) => {
      const res = await demoAdapter.loadSnapshot(snapshot);
      writeDataMode(`demo:${snapshot}`);
      return res;
    },
    onSuccess: () => {
      void invalidateDemo(qc);
    },
  });
}

export function useResetDemoSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => demoAdapter.reset(),
    onSuccess: () => {
      void invalidateDemo(qc);
    },
  });
}
