import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import { libraryApi } from "@/features/library/api";
import {
  blockForWeek,
  type CurriculumLink,
  type CurriculumWeek,
} from "@/shared/content/curriculum";
import { ApiRequestError } from "@/shared/lib/api";
import { useCreateTimeEntryMutation } from "../../mutations";
import { ResourceList } from "../ResourceList";
import { Section } from "../Section";
import { LogTimeDialog } from "../LogTimeDialog";

const savedKey = (weekNumber: number) => `los.bookmarks.w${weekNumber}`;

function readSaved(weekNumber: number): Set<string> {
  try {
    const raw = localStorage.getItem(savedKey(weekNumber));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((u) => typeof u === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSaved(weekNumber: number, urls: Set<string>) {
  try {
    localStorage.setItem(savedKey(weekNumber), JSON.stringify([...urls]));
  } catch {
    /* ignore */
  }
}

export function LearnTab({
  week,
  locked,
}: {
  week: CurriculumWeek;
  locked: boolean;
}) {
  const block = blockForWeek(week.number);
  const { toast } = useToast();
  const layer = useLayer();
  const logTime = useCreateTimeEntryMutation(week.number);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(() => readSaved(week.number));

  const begin: CurriculumLink[] = week.beginWith ? [week.beginWith] : [];
  const next: CurriculumLink[] = week.nextReference
    ? [week.nextReference]
    : [];

  const onSave = useCallback(
    async (link: CurriculumLink) => {
      if (savedUrls.has(link.url)) {
        toast("Already saved to Library");
        return;
      }
      try {
        await libraryApi.create({
          kind: "resource",
          title: link.title,
          url: link.url,
          weekNumber: week.number,
          plainText: link.note ?? "",
          tags: ["bookmark", "learn"],
        });
        const nextSet = new Set(savedUrls);
        nextSet.add(link.url);
        setSavedUrls(nextSet);
        writeSaved(week.number, nextSet);
        toast("Saved to Library");
      } catch (err) {
        toast(
          err instanceof ApiRequestError
            ? err.message
            : "Could not save bookmark",
          { tone: "warn" },
        );
      }
    },
    [savedUrls, toast, week.number],
  );

  const openLog = () => {
    layer.open(
      <LogTimeDialog
        weekNumber={week.number}
        defaultActivity="learn"
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
    );
  };

  return (
    <div className="max-w-3xl space-y-9">
      <Section title="Core concepts">
        <p className="text-[17px] leading-relaxed">{week.learn}</p>
        <p className="text-sm muted mt-2">
          Mon-Tue, about 4 hours: first principles, official docs, worked
          examples.
        </p>
      </Section>
      {begin.length ? (
        <Section title="Begin with">
          <ResourceList
            links={begin}
            savedUrls={savedUrls}
            onSave={(l) => void onSave(l)}
          />
        </Section>
      ) : null}
      {next.length ? (
        <Section title="Next and reference">
          <ResourceList
            links={next}
            savedUrls={savedUrls}
            onSave={(l) => void onSave(l)}
          />
        </Section>
      ) : null}
      {block.primaryResources.length ? (
        <Section title="Block shelf">
          <details>
            <summary className="text-sm forest flex items-center gap-1.5 cursor-pointer">
              <Icon name="chevron-right" />
              {block.primaryResources.length} primary resources for Block{" "}
              {block.id}
            </summary>
            <div className="mt-3">
              <ResourceList
                links={block.primaryResources}
                savedUrls={savedUrls}
                onSave={(l) => void onSave(l)}
              />
            </div>
          </details>
        </Section>
      ) : null}
      <Button onClick={openLog} disabled={locked}>
        <Icon name="clock" />
        Log study time
      </Button>
    </div>
  );
}
