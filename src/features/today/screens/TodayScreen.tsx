import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { DemoBadge, StatusChip } from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import {
  blockForWeek,
  getWeek,
  primaryProjectForWeek,
  projectMilestoneFor,
} from "@/shared/content/curriculum";
import { ApiRequestError } from "@/shared/lib/api";
import { fmtDate, fmtLongDate, greeting } from "@/shared/lib/format";
import {
  useCaptureThoughtMutation,
  useCompleteReviewMutation,
} from "../mutations";
import { useTodayQuery } from "../queries";
import { ReviewDialog } from "../components/ReviewDialog";

export function TodayScreen() {
  const { data, isLoading, isError, error, refetch } = useTodayQuery();
  const capture = useCaptureThoughtMutation();
  const completeReview = useCompleteReviewMutation();
  const { toast } = useToast();
  const layer = useLayer();
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return (
      <div className="fade space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fade">
        <h1 className="serif text-3xl">Today</h1>
        <p className="muted mt-2 text-sm">
          {error instanceof ApiRequestError
            ? error.message
            : "Could not load today."}
        </p>
        <Button className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const n = data.currentWeek;
  const wd = getWeek(n);
  const block = blockForWeek(n);
  const displayState = data.locked ? "LOCKED" : data.weekStatus;
  const fresh = data.verifiedCount === 0 && data.weekStatus === "PLANNED";
  const project =
    data.project ??
    (() => {
      const p = primaryProjectForWeek(n);
      if (!p) return null;
      return {
        projectId: p.id,
        title: p.title,
        milestoneText: projectMilestoneFor(p, n),
      };
    })();

  const onCapture = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    try {
      const res = await capture.mutateAsync({ text, weekNumber: n });
      setDraft("");
      if (res.kind === "idea") toast("Idea saved to Projects");
      else if (res.kind === "resource") toast("Resource saved to Library");
      else toast("Note saved to Library");
    } catch (err) {
      // Retain draft on failure (requirement).
      toast(
        err instanceof ApiRequestError ? err.message : "Could not save",
        { tone: "warn" },
      );
    }
  };

  const openReview = (r: (typeof data.reviewsDue)[number]) => {
    layer.open(
      <ReviewDialog
        weekNumber={r.weekNumber}
        offsetWeeks={r.offsetWeeks}
        reviewOffset={r.reviewOffset}
        onComplete={(passed, notes) => {
          void completeReview
            .mutateAsync({
              weekNumber: r.weekNumber,
              reviewOffset: r.reviewOffset,
              passed,
              notes,
            })
            .then(() =>
              toast(
                passed
                  ? "Review recorded. Retention holds."
                  : "Review recorded. A gap was added; your verification stays.",
              ),
            )
            .catch((err: unknown) =>
              toast(
                err instanceof ApiRequestError
                  ? err.message
                  : "Could not record review",
                { tone: "warn" },
              ),
            );
        }}
      />,
    );
  };

  const gap = data.openGaps[0];
  const progressPct = Math.max(0.6, (data.verifiedCount / 91) * 100);

  return (
    <div className="fade">
      <div className="flex items-center gap-3 mb-1">
        <p className="text-sm muted">{fmtLongDate()}</p>
        {data.isDemo ? <DemoBadge /> : null}
      </div>
      <h1 className="serif text-[2.4rem] md:text-5xl leading-[1.05] tracking-tight">
        {greeting(data.displayName)}.
      </h1>
      <p className="muted mt-2 max-w-xl">
        {fresh
          ? "Week 1 is open. Everything else unlocks one verified week at a time."
          : "Here is the one thing worth your attention right now."}
      </p>

      <section
        className="surface shadow-soft mt-8 overflow-hidden"
        aria-labelledby="cur-h"
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs muted">
            <span>
              Block {block.id} · {block.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>Stage {block.stage}</span>
            <span className="ml-auto">
              <StatusChip state={displayState} />
            </span>
          </div>
          <h2
            id="cur-h"
            className="mt-3 text-2xl md:text-[1.9rem] font-semibold tracking-tight"
          >
            Week {n}: {wd.title}
          </h2>
          <p className="ink2 mt-3 max-w-2xl leading-relaxed">
            <span className="muted">What to learn next.</span> {wd.learn}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              to="/weeks/$weekNumber/$tab"
              params={{ weekNumber: String(n), tab: data.nextStep.tab }}
              className="btn btn-p btn-lg"
            >
              <Icon name={data.nextStep.icon} />
              {data.nextStep.label}
            </Link>
            <p className="text-sm muted">{data.nextStep.hint}</p>
          </div>
        </div>
        {wd.beginWith ? (
          <a
            href={wd.beginWith.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 md:px-8 py-4 border-t line sunk hover:opacity-90 text-sm"
          >
            <span className="h-8 w-8 rounded-lg surface grid place-items-center">
              <Icon name="book-marked" className="forest" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs muted">Primary resource</span>
              <span className="block font-medium truncate">
                {wd.beginWith.title}
              </span>
            </span>
            <Icon name="arrow-up-right" className="muted" />
          </a>
        ) : null}
      </section>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mt-10">
        <section aria-labelledby="rv-h">
          <div className="flex items-baseline justify-between mb-3">
            <h3 id="rv-h" className="text-sm font-medium">
              Reviews due
            </h3>
            {data.reviewsDue.length ? (
              <span className="text-xs muted">
                {data.reviewsDue.length} waiting
              </span>
            ) : null}
          </div>
          {data.reviewsDue.length ? (
            <ul className="divide-y line border-y line">
              {data.reviewsDue.slice(0, 3).map((r) => (
                <li
                  key={`${r.weekNumber}-${r.reviewOffset}`}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="chip chip-a">+{r.offsetWeeks}w</span>
                  <span className="flex-1 min-w-0 text-sm truncate">
                    Week {r.weekNumber}: {r.title || getWeek(r.weekNumber).title}
                  </span>
                  <Button size="sm" onClick={() => openReview(r)}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm muted py-3 border-y line flex items-center gap-2">
              <Icon name="check" className="forest" />
              {data.nextReviewDueAt
                ? `Nothing due. Next review ${fmtDate(data.nextReviewDueAt)}.`
                : "Reviews appear here after you verify a week."}
            </p>
          )}
        </section>

        <section aria-labelledby="gp-h">
          <h3 id="gp-h" className="text-sm font-medium mb-3">
            Unresolved gap
          </h3>
          {gap ? (
            <div
              className="rounded-xl border bg-rose p-4"
              style={{
                borderColor:
                  "color-mix(in srgb,var(--rose) 25%,transparent)",
              }}
            >
              <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {gap.title}
              </div>
              {gap.detail ? (
                <p className="text-xs mt-1 ink2">{gap.detail}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/weeks/$weekNumber/$tab"
                  params={{
                    weekNumber: String(gap.weekNumber),
                    tab: "verify",
                  }}
                  className="btn btn-sm"
                >
                  <Icon name="rotate-ccw" />
                  Plan retry
                </Link>
                {data.openGaps.length > 1 ? (
                  <span className="text-xs muted">
                    +{data.openGaps.length - 1} more
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm muted py-3 border-y line flex items-center gap-2">
              <Icon name="check" className="forest" />
              No open gaps.
            </p>
          )}
        </section>

        <section aria-labelledby="qc-h">
          <h3 id="qc-h" className="text-sm font-medium mb-3">
            Capture a thought
          </h3>
          <form onSubmit={(e) => void onCapture(e)} className="flex gap-2">
            <label htmlFor="qc" className="sr-only">
              Note or idea
            </label>
            <Input
              id="qc"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="A note, a link, or a project idea"
              autoComplete="off"
              disabled={capture.isPending}
            />
            <Button type="submit" aria-label="Save" disabled={capture.isPending}>
              <Icon name="corner-down-left" />
            </Button>
          </form>
          <p className="text-xs muted mt-2">
            Saved to Library, linked to Week {n}. Start with &quot;idea:&quot; to
            save a project idea.
          </p>
        </section>

        <section aria-labelledby="pm-h">
          <h3 id="pm-h" className="text-sm font-medium mb-3">
            Project milestone
          </h3>
          {project ? (
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.projectId }}
              className="block rounded-xl border line p-4 hover:bg-[var(--sunk)]"
            >
              <div className="flex items-center gap-2 text-xs muted">
                {project.projectId} · {project.title}
              </div>
              <div className="text-sm mt-1 font-medium">
                {project.milestoneText}
              </div>
            </Link>
          ) : (
            <p className="text-sm muted">No project mapped.</p>
          )}
        </section>
      </div>

      <Link
        to="/progress"
        className="mt-10 flex items-center gap-4 text-sm group"
      >
        <span className="flex-1 h-1.5 rounded-full sunk overflow-hidden">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background: "var(--forest)",
            }}
          />
        </span>
        <span className="muted group-hover:underline whitespace-nowrap">
          <b className="forest font-semibold">{data.verifiedCount}</b> of 91
          weeks verified
        </span>
      </Link>
    </div>
  );
}
