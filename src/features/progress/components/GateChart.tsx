import { EmptyState } from "@/components/ui/EmptyState";
import type { ProgressResponse } from "@/shared/contracts/progress";

type GatePerf = ProgressResponse["gatePerformance"];

export function GateChart({ performance }: { performance: GatePerf }) {
  const { gates, firstAttemptPassCount, verifiedWeekCount } = performance;

  if (!verifiedWeekCount) {
    return (
      <EmptyState
        icon="chart-column"
        title="No scores yet"
        text="Each verified week adds its final gate scores here."
      />
    );
  }

  return (
    <div className="space-y-4 mt-5">
      {gates.map((g) => {
        const n = verifiedWeekCount;
        const c3 = g.scoreCounts[3] ?? 0;
        const c4 = g.scoreCounts[4] ?? 0;
        return (
          <div key={g.key}>
            <div className="flex justify-between text-sm">
              <span>{g.label}</span>
              <span className="text-xs muted">
                {g.gapCount
                  ? `${g.gapCount} gap${g.gapCount > 1 ? "s" : ""} so far`
                  : "no gaps"}
              </span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden mt-1.5 gap-px sunk">
              {c3 ? (
                <div
                  style={{
                    width: `${(c3 / n) * 100}%`,
                    background:
                      "color-mix(in srgb,var(--forest) 55%,transparent)",
                  }}
                  title={`${c3} weeks at 3`}
                />
              ) : null}
              {c4 ? (
                <div
                  style={{
                    width: `${(c4 / n) * 100}%`,
                    background: "var(--forest)",
                  }}
                  title={`${c4} weeks at 4`}
                />
              ) : null}
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 text-xs muted pt-1">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{
              background: "color-mix(in srgb,var(--forest) 55%,transparent)",
            }}
          />
          Score 3
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: "var(--forest)" }}
          />
          Score 4
        </span>
      </div>
      <p className="text-sm ink2 border-t line pt-4">
        {firstAttemptPassCount} of {verifiedWeekCount} weeks passed all four
        gates on the first attempt. The rest went through a gap and a fresh
        retry, which is the system working.
      </p>
    </div>
  );
}
