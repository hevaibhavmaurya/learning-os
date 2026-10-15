import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DemoBadge,
  GapChip,
  ReviewChip,
  StatusChip,
} from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import {
  CURRICULUM_BLOCKS,
  CURRICULUM_WEEKS,
  getWeek,
} from "@/shared/content/curriculum";
import { ApiRequestError } from "@/shared/lib/api";
import { fmtDate } from "@/shared/lib/format";
import {
  WEEK_STATE_COLORS,
  WEEK_STATE_LEGEND,
  type WeekDisplayState,
} from "@/shared/lib/week-status";
import type { RoadmapWeekCell } from "@/shared/contracts/roadmap";
import { useRoadmapQuery } from "../queries";

function displayState(cell: RoadmapWeekCell): WeekDisplayState {
  return cell.locked ? "LOCKED" : cell.status;
}

export function RoadmapScreen() {
  const { data, isLoading, isError, error, refetch } = useRoadmapQuery();
  const [openBlocks, setOpenBlocks] = useState<Set<number> | null>(null);

  const currentWeek = data?.currentWeek ?? 1;
  const defaultOpen = useMemo(() => {
    const blk = getWeek(currentWeek).blockId;
    return new Set([blk]);
  }, [currentWeek]);

  const open = openBlocks ?? defaultOpen;

  const toggleBlock = (id: number) => {
    setOpenBlocks((prev) => {
      const next = new Set(prev ?? defaultOpen);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="fade space-y-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fade">
        <h1 className="serif text-4xl">The journey</h1>
        <p className="muted mt-2 text-sm">
          {error instanceof ApiRequestError
            ? error.message
            : "Could not load roadmap."}
        </p>
        <Button className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const cellsByWeek = new Map(data.weeks.map((w) => [w.weekNumber, w]));
  const dueWeeks = new Set(data.reviewDueWeeks);
  const gapWeeks = new Set(data.gapWeeks);

  const stageBlocks = (stage: number) =>
    CURRICULUM_BLOCKS.filter((b) => b.stage === stage).map((b) => {
      const ws = CURRICULUM_WEEKS.filter((w) => w.blockId === b.id);
      const vc = ws.filter((w) => {
        const c = cellsByWeek.get(w.number);
        return c && !c.locked && c.status === "VERIFIED";
      }).length;
      const isOpen = open.has(b.id);
      const here =
        data.currentWeek >= b.weekStart && data.currentWeek <= b.weekEnd;

      return (
        <li key={b.id} className="border-b line last:border-0">
          <button
            type="button"
            className="w-full flex items-center gap-4 py-4 text-left group"
            aria-expanded={isOpen}
            onClick={() => toggleBlock(b.id)}
          >
            <span className="w-9 text-xs muted font-mono">
              B{String(b.id).padStart(2, "0")}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block font-medium ${here ? "" : "ink2"}`}>
                {b.title}{" "}
                {here ? (
                  <span className="chip chip-v ml-1.5">You are here</span>
                ) : null}
              </span>
              <span className="block text-xs muted mt-0.5">
                Weeks {b.weekStart}-{b.weekEnd} · {ws.length} weeks
              </span>
            </span>
            <span className="hidden sm:flex gap-[3px] w-56">
              {ws.map((w) => {
                const cell = cellsByWeek.get(w.number);
                const s = cell ? displayState(cell) : "LOCKED";
                return (
                  <span
                    key={w.number}
                    className="h-1.5 flex-1 rounded-full"
                    style={{ background: WEEK_STATE_COLORS[s] }}
                  />
                );
              })}
            </span>
            <span className="text-xs muted w-12 text-right tabular-nums">
              {vc}/{ws.length}
            </span>
            <Icon
              name={isOpen ? "chevron-up" : "chevron-down"}
              className="muted"
            />
          </button>
          {isOpen ? (
            <div className="pb-4 fade">
              {b.goalCheckpoint ? (
                <p className="text-sm ink2 mb-3 sm:ml-[3.25rem] max-w-2xl">
                  <span className="muted">Checkpoint.</span> {b.goalCheckpoint}
                </p>
              ) : null}
              <ul className="sm:ml-[3.25rem] rounded-xl border line overflow-hidden">
                {ws.map((w) => {
                  const cell = cellsByWeek.get(w.number);
                  const s = cell ? displayState(cell) : "LOCKED";
                  const lock = s === "LOCKED";
                  return (
                    <li
                      key={w.number}
                      className="border-b line last:border-0"
                    >
                      <Link
                        to="/weeks/$weekNumber/$tab"
                        params={{
                          weekNumber: String(w.number),
                          tab: "overview",
                        }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--sunk)] ${
                          w.number === data.currentWeek ? "sage" : ""
                        }`}
                        aria-label={
                          lock
                            ? `Week ${w.number}, locked`
                            : undefined
                        }
                      >
                        <span
                          className={`w-7 text-xs font-mono ${lock ? "muted" : ""}`}
                        >
                          {w.number}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className={`block text-sm truncate ${
                              lock ? "muted" : "font-medium"
                            }`}
                          >
                            {w.title}
                          </span>
                          {lock ? (
                            <span className="block text-[11px] muted">
                              Opens after Week {w.number - 1} is verified
                            </span>
                          ) : (
                            <span className="block text-[11px] muted">
                              {cell?.verifiedAt
                                ? `Verified ${fmtDate(cell.verifiedAt)} · planned ${fmtDate(cell.plannedDate)}`
                                : `Planned for ${fmtDate(cell?.plannedDate)}`}
                            </span>
                          )}
                        </span>
                        {gapWeeks.has(w.number) ? <GapChip /> : null}
                        {dueWeeks.has(w.number) ? <ReviewChip /> : null}
                        {lock ? (
                          <Icon name="lock" className="muted" />
                        ) : (
                          <StatusChip state={s} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </li>
      );
    });

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end gap-4 justify-between">
        <div>
          <p className="text-sm muted flex items-center gap-2">
            91 weeks · 14 blocks · 13 hours a week{" "}
            {data.isDemo ? <DemoBadge /> : null}
          </p>
          <h1 className="serif text-4xl md:text-5xl mt-1">The journey</h1>
        </div>
        <Link
          to="/weeks/$weekNumber/$tab"
          params={{
            weekNumber: String(data.currentWeek),
            tab: "overview",
          }}
          className="btn btn-p"
        >
          <Icon name="arrow-right" />
          Open Week {data.currentWeek}
        </Link>
      </div>

      <section className="mt-8" aria-label="Overview of all 91 weeks">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "repeat(46,minmax(0,1fr))" }}
        >
          {CURRICULUM_WEEKS.map((w) => {
            const cell = cellsByWeek.get(w.number);
            const s = cell ? displayState(cell) : "LOCKED";
            return (
              <Link
                key={w.number}
                to="/weeks/$weekNumber/$tab"
                params={{ weekNumber: String(w.number), tab: "overview" }}
                className={`wk block ${
                  w.number === data.currentWeek
                    ? "ring-2 ring-offset-1 ring-[var(--forest)] ring-offset-[var(--bg)]"
                    : ""
                }`}
                style={{ background: WEEK_STATE_COLORS[s] }}
                title={`Week ${w.number}: ${w.title} (${s.toLowerCase()})`}
                aria-label={`Week ${w.number}: ${w.title}, ${s.toLowerCase()}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs muted">
          {WEEK_STATE_LEGEND.map(({ state, label }) => (
            <span key={state} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: WEEK_STATE_COLORS[state] }}
              />
              {label}
            </span>
          ))}
          <span className="ml-auto">{data.verifiedCount} verified</span>
        </div>
        <p className="text-sm ink2 mt-5 flex items-start gap-2 max-w-2xl">
          <Icon name="compass" className="forest mt-0.5 shrink-0" />
          {data.variance.message}
        </p>
        {data.lockingEnabled ? (
          <p className="text-xs muted mt-2 flex items-center gap-1.5">
            <Icon name="lock" className="!w-3 !h-3" />
            Strict locking is on: weeks open one at a time, no skipping or
            reordering.
          </p>
        ) : (
          <p className="text-xs amber mt-2 flex items-center gap-1.5">
            <Icon name="lock-open" className="!w-3 !h-3" />
            Locking is off. Overrides are audited and never count as
            verification.
          </p>
        )}
      </section>

      <div className="mt-10 max-w-4xl">
        <section>
          <h2 className="text-xs font-medium muted uppercase tracking-wider mb-1">
            Stage 1 · Ship as an FDE
          </h2>
          <ul>{stageBlocks(1)}</ul>
        </section>
        <section className="mt-10">
          <h2 className="text-xs font-medium muted uppercase tracking-wider mb-1">
            Stage 2 · Deep fundamentals
          </h2>
          <ul>{stageBlocks(2)}</ul>
        </section>
      </div>
    </div>
  );
}
