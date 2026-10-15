import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import {
  blockForWeek,
  getWeek,
  projectsForWeek,
  type CurriculumWeek,
} from "@/shared/content/curriculum";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import { fmtDate, fmtDateYear } from "@/shared/lib/format";
import { Section } from "../Section";
import { PilotPanel } from "../PilotPanel";

function defaultPrerequisites(
  weekNumber: number,
  detail: WeekDetailResponse,
): { label: string; ok: boolean }[] {
  if (detail.prerequisites?.length) {
    return detail.prerequisites.map((p) => ({
      label: p.label,
      ok: p.satisfied,
    }));
  }

  const rows: { label: string; ok: boolean }[] = [];
  if (weekNumber === 1) {
    rows.push({
      label:
        "Nothing before Week 1. Run the 2-hour diagnostic inside this week.",
      ok: true,
    });
  } else {
    const prev = getWeek(weekNumber - 1);
    rows.push({
      label: `Week ${weekNumber - 1}: ${prev.title} verified`,
      ok: detail.status === "VERIFIED" || !detail.locked,
    });
  }
  if (weekNumber >= 17 && weekNumber <= 24) {
    rows.push({
      label:
        "Python checkpoint by Week 24: exceptions, typing, packaging, pytest, async",
      ok: false,
    });
  }
  if (weekNumber >= 48 && weekNumber <= 53) {
    rows.push({
      label: "Systems-language mini-check passed before Week 48",
      ok: false,
    });
  }
  if (weekNumber >= 43 && weekNumber <= 46) {
    rows.push({
      label: "Data-use consent recorded, or project labelled SIMULATED",
      ok: Boolean(
        detail.pilot?.consentDocumented || detail.pilot?.simulated,
      ),
    });
  }
  if (weekNumber >= 74 && weekNumber <= 79) {
    rows.push({
      label: "GPU access within budget, or work labelled SIMULATION",
      ok: false,
    });
  }
  if (weekNumber === 76) {
    rows.push({
      label:
        "Week 76 measured GPU evidence required (simulation alternatives not accepted here)",
      ok: false,
    });
  }
  return rows;
}

export function OverviewTab({
  week,
  detail,
}: {
  week: CurriculumWeek;
  detail: WeekDetailResponse;
}) {
  const n = week.number;
  const block = blockForWeek(n);
  const pre = defaultPrerequisites(n, detail);
  const projects = projectsForWeek(n);
  const rhythm: [string, string, string, string][] = [
    ["Mon-Tue", "4 h", "Learn", "learn"],
    ["Wed", "2 h", "Practise unseen", "practise"],
    ["Thu-Fri", "5 h", "Build and test", "build"],
    ["Sat", "2 h", "Assess and review", "verify"],
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_18rem] gap-10">
      <div className="space-y-8">
        <Section title="Outcomes">
          <ul className="space-y-3 text-[15px] leading-relaxed">
            <li className="flex gap-3">
              <Icon name="target" className="forest mt-1 shrink-0" />
              <span>Explain and apply: {week.learn}</span>
            </li>
            <li className="flex gap-3">
              <Icon name="hammer" className="forest mt-1 shrink-0" />
              <span>Ship: {week.build}</span>
            </li>
            {block.goalCheckpoint && n === block.weekEnd ? (
              <li className="flex gap-3">
                <Icon name="flag" className="forest mt-1 shrink-0" />
                <span>Block checkpoint: {block.goalCheckpoint}</span>
              </li>
            ) : null}
          </ul>
        </Section>

        <Section title="Prerequisites">
          <ul className="space-y-2">
            {pre.map((row) => (
              <li
                key={row.label}
                className="flex items-start gap-2.5 text-sm"
              >
                <Icon
                  name={row.ok ? "circle-check" : "circle-dashed"}
                  className={`${row.ok ? "forest" : "muted"} mt-0.5 shrink-0`}
                />
                <span className={row.ok ? "" : "ink2"}>{row.label}</span>
              </li>
            ))}
          </ul>
        </Section>

        {n >= 43 && n <= 46 ? (
          <PilotPanel pilot={detail.pilot ?? null} locked={detail.locked} />
        ) : null}

        <Section title="This week's rhythm">
          <div className="grid sm:grid-cols-4 gap-2 text-sm">
            {rhythm.map(([d, h, l, t]) => (
              <Link
                key={t}
                to="/weeks/$weekNumber/$tab"
                params={{ weekNumber: String(n), tab: t }}
                className="rounded-lg border line p-3 hover:bg-[var(--sunk)]"
              >
                <div className="text-xs muted">
                  {d} · {h}
                </div>
                <div className="font-medium mt-0.5">{l}</div>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <aside className="space-y-6 text-sm">
        <div className="rounded-xl sunk p-4 space-y-2.5">
          <div className="flex justify-between">
            <span className="muted">Planned</span>
            <span>{fmtDateYear(detail.plannedDate) || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="muted">Started</span>
            <span>
              {detail.startedAt ? fmtDate(detail.startedAt) : "Not yet"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="muted">Verified</span>
            <span>
              {detail.verifiedAt ? fmtDate(detail.verifiedAt) : "Not yet"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="muted">Attempts</span>
            <span>{detail.attempts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="muted">Hours logged</span>
            <span>{detail.hoursLogged ?? 0} h</span>
          </div>
        </div>
        <div>
          <div className="text-xs muted mb-2">Linked projects</div>
          {projects.length ? (
            projects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="block py-1.5 hover:underline"
              >
                {p.id} · {p.title}
              </Link>
            ))
          ) : (
            <span className="muted">None</span>
          )}
        </div>
      </aside>
    </div>
  );
}
