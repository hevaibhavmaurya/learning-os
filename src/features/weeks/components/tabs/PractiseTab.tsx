import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import type { CurriculumWeek } from "@/shared/content/curriculum";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import { ApiRequestError } from "@/shared/lib/api";
import {
  useCreateTimeEntryMutation,
  useUpsertEvidenceMutation,
} from "../../mutations";
import { LogTimeDialog } from "../LogTimeDialog";
import { Section } from "../Section";

export function PractiseTab({
  week,
  detail,
  locked,
}: {
  week: CurriculumWeek;
  detail: WeekDetailResponse;
  locked: boolean;
}) {
  const { toast } = useToast();
  const layer = useLayer();
  const logTime = useCreateTimeEntryMutation(week.number);
  const upsert = useUpsertEvidenceMutation(week.number);
  const [checks, setChecks] = useState(
    detail.evidence?.acceptanceChecks ?? "",
  );
  const [savedLabel, setSavedLabel] = useState("");

  useEffect(() => {
    setChecks(detail.evidence?.acceptanceChecks ?? "");
  }, [detail.evidence?.acceptanceChecks]);

  useEffect(() => {
    if (locked) return;
    const baseline = detail.evidence?.acceptanceChecks ?? "";
    if (checks === baseline) return;
    const t = window.setTimeout(() => {
      setSavedLabel("Saving...");
      void upsert
        .mutateAsync({
          weekNumber: week.number,
          expectedRevision: detail.revision,
          acceptanceChecks: checks,
        })
        .then(() => setSavedLabel("Saved"))
        .catch(() => setSavedLabel("Save failed"));
    }, 600);
    return () => window.clearTimeout(t);
    // Intentionally omit upsert identity; mutateAsync is stable enough for debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    checks,
    detail.evidence?.acceptanceChecks,
    detail.revision,
    locked,
    week.number,
  ]);

  return (
    <div className="max-w-3xl space-y-9">
      <Section title="Independent assignment">
        <div className="surface p-5 leading-relaxed text-[15px]">
          {week.assignment}
        </div>
      </Section>

      <Section title="Independence and timebox">
        <div className="rounded-xl border line p-5 text-sm leading-relaxed ink2 space-y-2">
          <p>
            Work without a walkthrough or generated core solution. Write 2–4
            observable acceptance checks before you search.
          </p>
          <p>
            Unseen assessment timebox: 30–45 minutes. Documentation may be
            consulted; tutorials and AI-generated solutions are off for that
            window. An AI-authored core solution cannot support Build ≥3.
          </p>
        </div>
      </Section>

      <Section title="Acceptance checks first">
        <p className="text-sm muted mb-2">
          Write 2 to 4 observable checks before you search for anything.
        </p>
        <Textarea
          className="font-mono text-[13px]"
          rows={4}
          disabled={locked}
          placeholder={
            "1. Exits 0 on a correctly configured server\n2. Exits nonzero when authorized_keys is missing"
          }
          value={checks}
          onChange={(e) => setChecks(e.target.value)}
        />
        <div className="text-xs muted mt-1.5 h-4">
          {savedLabel === "Saved" ? (
            <span className="forest">Saved</span>
          ) : (
            savedLabel
          )}
        </div>
      </Section>

      <Section title="Unseen assessment, Saturday">
        <div className="rounded-xl border line p-5 text-sm leading-relaxed ink2">
          {week.assessment}
        </div>
      </Section>

      <Button
        disabled={locked}
        onClick={() =>
          layer.open(
            <LogTimeDialog
              weekNumber={week.number}
              defaultActivity="practise"
              locked={locked}
              onSubmit={async (hours, activity) => {
                try {
                  await logTime.mutateAsync({
                    weekNumber: week.number,
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
        Log practice time
      </Button>
    </div>
  );
}
