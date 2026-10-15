import type { ReactNode } from "react";
import {
  CURRICULUM_BLOCKS,
  CURRICULUM_MILESTONES,
  CURRICULUM_PROJECTS,
  blockForWeek,
} from "@/shared/content/curriculum";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  GapChip,
  ReviewChip,
  StatusChip,
} from "@/components/ui/StatusChip";
import { ApiRequestError } from "@/shared/lib/api";
import { GateChart } from "../components/GateChart";
import { JourneyChart } from "../components/JourneyChart";
import { useProgressQuery } from "../queries";

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="py-4 sm:py-0 sm:px-6 first:pl-0 border-b sm:border-b-0 sm:border-l line first:border-l-0">
      <div className="text-xs muted">{label}</div>
      <div className="text-2xl font-semibold tracking-tight mt-1 tabular-nums">
        {value}
      </div>
      {sub ? <div className="text-xs muted mt-0.5">{sub}</div> : null}
    </div>
  );
}

export function ProgressScreen() {
  const { data, isLoading, isError, error, refetch } = useProgressQuery();

  if (isLoading) {
    return (
      <div className="fade space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fade">
        <h1 className="serif text-3xl">Progress</h1>
        <p className="muted mt-2 text-sm">
          {error instanceof ApiRequestError
            ? error.message
            : "Could not load progress."}
        </p>
        <Button className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const v = data.verifiedCount;
  const cur = data.currentWeek;
  const block = blockForWeek(cur);
  const verifiedSet = new Set(data.verifiedWeekNumbers);
  const blocksDone = CURRICULUM_BLOCKS.filter((b) => {
    for (let n = b.weekStart; n <= b.weekEnd; n++) {
      if (!verifiedSet.has(n)) return false;
    }
    return true;
  });
  const projTotal = CURRICULUM_PROJECTS.length + Math.max(0, data.projectsComplete - data.projectsVerified);

  const statusCards: Array<{
    key: string;
    count: number;
    desc: string;
    chip: ReactNode;
  }> = [
    {
      key: "ATTEMPTED",
      count: data.byStatus.ATTEMPTED,
      desc: "Assessed at least once",
      chip: <StatusChip state="ATTEMPTED" />,
    },
    {
      key: "DONE",
      count: data.byStatus.DONE,
      desc: "Evidence in, not verified",
      chip: <StatusChip state="DONE" />,
    },
    {
      key: "VERIFIED",
      count: data.byStatus.VERIFIED,
      desc: "You approved the evidence",
      chip: <StatusChip state="VERIFIED" />,
    },
    {
      key: "rv",
      count: data.reviewsDue,
      desc: "Flag on verified weeks",
      chip: <ReviewChip />,
    },
    {
      key: "gap",
      count: data.openGaps,
      desc: "Flag, needs a retry",
      chip: <GapChip />,
    },
  ];

  const nextMilestone = CURRICULUM_MILESTONES.find((m) => {
    const nums = m.weeks;
    const done = nums.every((x) => verifiedSet.has(x));
    return !done && nums[0]! >= cur;
  });

  return (
    <div className="fade">
      <p className="text-sm muted flex items-center gap-2">
        Evidence, not activity
      </p>
      <h1 className="serif text-4xl md:text-5xl mt-1">Progress</h1>

      {blocksDone.length ? (
        <p className="mt-4 text-sm flex items-center gap-2 forest">
          <Icon name="sparkles" />
          {blocksDone.length === 1
            ? "Block 1 complete"
            : `${blocksDone.length} blocks complete`}
          . Most recent: {blocksDone[blocksDone.length - 1]!.title}. Quietly
          well done.
        </p>
      ) : null}

      <section
        className="grid sm:grid-cols-3 lg:grid-cols-6 mt-8 surface p-5 sm:py-6"
        aria-label="Summary"
      >
        <Stat
          label="Verified"
          value={
            <>
              {v}
              <span className="text-base muted font-normal"> / 91</span>
            </>
          }
          sub={`${Math.round((v / 91) * 100)}% of the journey`}
        />
        <Stat
          label="Now"
          value={`Week ${cur}`}
          sub={`Block ${block.id} · ${block.title}`}
        />
        <Stat
          label="Hours invested"
          value={`${data.hoursInvested} h`}
          sub={`of ~${data.plannedHours.toLocaleString("en-GB")} h minimum`}
        />
        <Stat
          label="Open gaps"
          value={data.openGaps}
          sub={data.openGaps ? "Being worked on" : "All resolved"}
        />
        <Stat
          label="Review retention"
          value={
            data.reviewRetentionPct == null
              ? "n/a"
              : `${data.reviewRetentionPct}%`
          }
          sub={`${data.reviewsCompleted} reviews done`}
        />
        <Stat
          label="Projects complete"
          value={data.projectsComplete}
          sub={`of ${Math.max(projTotal, CURRICULUM_PROJECTS.length)}`}
        />
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-6">
        <section className="surface p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Verified weeks over time</h2>
            <span className="text-xs muted flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0.5 w-4"
                  style={{ background: "var(--forest)" }}
                />
                Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0 w-4 border-t border-dashed"
                  style={{ borderColor: "var(--muted)" }}
                />
                Planned guide
              </span>
            </span>
          </div>
          <JourneyChart
            timeline={data.verifiedTimeline}
            planStartDate={data.planStartDate}
            asOf={data.asOf}
          />
        </section>
        <section className="surface p-6">
          <h2 className="font-medium">Gate performance</h2>
          <p className="text-xs muted mt-1">
            Latest score per verified week. Pass line is 3.
          </p>
          <GateChart performance={data.gatePerformance} />
        </section>
      </div>

      <section className="mt-6 surface p-6">
        <h2 className="font-medium">Where each week stands</h2>
        <p className="text-xs muted mt-1">
          Status is one of four. Review due and Gap are separate flags on top.
        </p>
        <div className="grid sm:grid-cols-5 gap-3 mt-4 text-sm">
          {statusCards.map((card) => (
            <div key={card.key} className="rounded-xl border line p-4">
              <div className="flex items-center gap-2">{card.chip}</div>
              <div className="text-2xl font-semibold mt-2 tabular-nums">
                {card.count}
              </div>
              <div className="text-xs muted">{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 surface p-6">
        <h2 className="font-medium mb-4">Milestones</h2>
        <ol className="space-y-3">
          {CURRICULUM_MILESTONES.map((m) => {
            const nums = m.weeks;
            const done = nums.every((x) => verifiedSet.has(x));
            const next = !done && nextMilestone === m;
            const label = `W${m.rawWeekCell.replace(/ /g, "")}`;
            return (
              <li
                key={m.rawWeekCell + m.evidence}
                className="flex gap-4 text-sm items-start"
              >
                <span
                  className={`w-16 shrink-0 text-xs font-mono pt-0.5 ${done ? "forest" : "muted"}`}
                >
                  {label}
                </span>
                <Icon
                  name={
                    done ? "circle-check" : next ? "circle-dot" : "circle"
                  }
                  className={`${done ? "forest" : next ? "amber" : "muted"} mt-0.5 shrink-0`}
                />
                <span
                  className={
                    done
                      ? "muted line-through decoration-1"
                      : next
                        ? "font-medium"
                        : ""
                  }
                >
                  {m.evidence}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
