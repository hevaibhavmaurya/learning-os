import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import {
  blockForWeek,
  projectMilestoneFor,
  projectsForWeek,
  type CurriculumWeek,
} from "@/shared/content/curriculum";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import { ApiRequestError } from "@/shared/lib/api";
import { useCreateTimeEntryMutation } from "../../mutations";
import { LogTimeDialog } from "../LogTimeDialog";
import { PilotPanel } from "../PilotPanel";
import { Section } from "../Section";

export function BuildTab({
  week,
  detail,
  locked,
}: {
  week: CurriculumWeek;
  detail: WeekDetailResponse;
  locked: boolean;
}) {
  const block = blockForWeek(week.number);
  const projects = projectsForWeek(week.number);
  const { toast } = useToast();
  const layer = useLayer();
  const logTime = useCreateTimeEntryMutation(week.number);
  const n = week.number;

  return (
    <div className="max-w-3xl space-y-9">
      <Section title="Build or experiment">
        <p className="text-[17px] leading-relaxed">{week.build}</p>
        <p className="text-sm muted mt-2">
          Thu-Fri, about 5 hours: small artifact, tests, fault injection.
        </p>
      </Section>

      {week.minimumToPass ? (
        <Section title="Bounded-core minimum to pass">
          <div className="rounded-xl border line p-5 text-sm leading-relaxed">
            <p className="font-medium mb-2">Week {n} minimum-to-pass</p>
            <p className="ink2">{week.minimumToPass}</p>
            <p className="text-xs muted mt-3">
              Optional stretch work cannot substitute for this mandatory core.
              Passing still requires all four gates and manual verification.
            </p>
          </div>
        </Section>
      ) : null}

      {projects.length ? (
        <Section title="Project milestones">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              className="block rounded-xl border line p-4 hover:bg-[var(--sunk)] mb-2"
            >
              <div className="text-xs muted">
                {p.id} · {p.title} · {p.optional ? "Optional" : "Core"}
              </div>
              <div className="text-sm mt-1">
                {projectMilestoneFor(p, n)}
              </div>
            </Link>
          ))}
        </Section>
      ) : null}

      {n === block.weekEnd && block.blockEndGate ? (
        <Section title="Block-end gate">
          <div className="rounded-xl bg-amber border p-4 text-sm leading-relaxed">
            {block.blockEndGate}
          </div>
        </Section>
      ) : null}

      {n >= 43 && n <= 46 ? (
        <PilotPanel
          pilot={detail.pilot ?? null}
          locked={locked}
        />
      ) : null}

      <Button
        disabled={locked}
        onClick={() =>
          layer.open(
            <LogTimeDialog
              weekNumber={n}
              defaultActivity="build"
              locked={locked}
              onSubmit={async (hours, activity) => {
                try {
                  await logTime.mutateAsync({
                    weekNumber: n,
                    hours,
                    activity,
                  });
                  toast(`${hours} h logged`);
                } catch (err) {
                  toast(
                    err instanceof ApiRequestError
                      ? err.message
                      : "Could not log time",
                    { tone: "warn" },
                  );
                  throw err;
                }
              }}
            />,
          )
        }
      >
        <Icon name="clock" />
        Log build time
      </Button>
    </div>
  );
}
