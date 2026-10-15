import { useQuery } from "@tanstack/react-query";
import { demoAdapter } from "./adapter";
import { demoKeys } from "./query-keys";

export function useDemoStateQuery(enabled = true) {
  return useQuery({
    queryKey: demoKeys.state(),
    queryFn: () => demoAdapter.getState(),
    enabled,
  });
}

export function useDemoSnapshotsQuery(enabled = true) {
  return useQuery({
    queryKey: demoKeys.snapshots(),
    queryFn: () => demoAdapter.listSnapshots(),
    enabled,
  });
}
