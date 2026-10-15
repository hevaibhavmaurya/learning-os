import { useMemo, useRef, type KeyboardEventHandler } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import {
  DemoBadge,
  GapChip,
  ReviewChip,
  StatusChip,
} from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tab, TabList } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import { WEEK_TABS, type WeekTab } from "@/app/shell/nav";
import {
  blockForWeek,
  getWeek,
  parseWeekNumber,
} from "@/shared/content/curriculum";
import { ApiRequestError } from "@/shared/lib/api";
import type { WeekDisplayState } from "@/shared/lib/week-status";
import { useVerifyWeekMutation } from "../mutations";
import { useWeekDetailQuery, validateWeekTab } from "../queries";
import { CelebrationDialog } from "../components/CelebrationDialog";
import { NextBar } from "../components/NextBar";
import { VerifyDialog } from "../components/VerifyDialog";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { LearnTab } from "../components/tabs/LearnTab";
import { PractiseTab } from "../components/tabs/PractiseTab";
import { BuildTab } from "../components/tabs/BuildTab";
import { VerifyTab } from "../components/tabs/VerifyTab";
import { NotesTab } from "../components/tabs/NotesTab";

const TAB_LABEL: Record<WeekTab, string> = {
  overview: "Overview",
  learn: "Learn",
  practise: "Practise",
  build: "Build",
  verify: "Verify",
  notes: "Notes",
};

const TAB_ICON: Record<WeekTab, string> = {
  overview: "info",
  learn: "book-open",
  practise: "pencil",
  build: "hammer",
  verify: "shield-check",
  notes: "notebook-pen",
};

export type WeekScreenProps = {
  weekNumber: number;
  tab: WeekTab;
};

function nextStepHint(weekNumber: number, detailStatus: string): string {
  const wd = getWeek(weekNumber);
  if (detailStatus === "DONE") {
    return "All four gates pass and evidence is in. Verifying is your call.";
  }
  if (detailStatus === "ATTEMPTED") {
    return "Pick up where you left off, then move to the Build task.";
  }
  return `Start with: ${wd.beginWith?.title || "the core reading"}.`;
}

export function WeekScreen({ weekNumber: rawWeek, tab: rawTab }: WeekScreenProps) {
  const weekNumber = parseWeekNumber(rawWeek);
  const tab = validateWeekTab(rawTab);
  const navigate = useNavigate();
  const { toast } = useToast();
  const layer = useLayer();
  const gatesRef = useRef<HTMLElement | null>(null);
  const { data, isLoading, isError, error, refetch } =
    useWeekDetailQuery(weekNumber);
  const verifyMut = useVerifyWeekMutation(weekNumber);

  const week = useMemo(() => getWeek(weekNumber), [weekNumber]);
  const block = useMemo(() => blockForWeek(weekNumber), [weekNumber]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Week {weekNumber}</h1>
        <p className="muted mt-2 text-sm">
          {error instanceof ApiRequestError
            ? error.message
            : "Could not load week."}
        </p>
        <Button className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const locked = data.locked;
  const displayState: WeekDisplayState = locked ? "LOCKED" : data.status;
  const hasGap = Boolean(data.openGaps?.length);
  const hasReview = Boolean(data.hasReviewDue);
  const currentWeekHint = data.expectedWritableWeek ?? weekNumber;
  const hint = nextStepHint(weekNumber, data.status);

  const goTab = (t: WeekTab) => {
    void navigate({
      to: "/weeks/$weekNumber/$tab",
      params: { weekNumber: String(weekNumber), tab: t },
    });
  };

  const onTabKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = WEEK_TABS.indexOf(tab);
    const next =
      WEEK_TABS[
        (idx + (e.key === "ArrowRight" ? 1 : -1) + WEEK_TABS.length) %
          WEEK_TABS.length
      ];
    goTab(next);
  };

  const startVerify = () => {
    layer.open(
      <VerifyDialog
        weekNumber={weekNumber}
        detail={data}
        onConfirm={async () => {
          try {
            const res = await verifyMut.mutateAsync({
              weekNumber,
              expectedRevision: data.revision,
              learnerConfirmed: true,
            });
            layer.open(
              <CelebrationDialog
                weekNumber={weekNumber}
                verifiedCount={weekNumber}
                firstReviewDueAt={res.verifiedAt}
              />,
            );
          } catch (err) {
            toast(
              err instanceof ApiRequestError
                ? err.message
                : "Verification failed",
              { tone: "warn" },
            );
          }
        }}
      />,
    );
  };

  return (
    <div>
      <nav
        className="text-sm muted flex items-center gap-1.5"
        aria-label="Breadcrumb"
      >
        <Link to="/roadmap" className="hover:underline">
          Roadmap
        </Link>
        <Icon name="chevron-right" className="!w-3 !h-3" />
        <span>
          Block {block.id} · {block.title}
        </span>
      </nav>

      <div className="flex flex-wrap items-start gap-3 mt-3">
        <h1 className="text-[1.75rem] md:text-3xl font-semibold tracking-tight flex-1 min-w-[16rem]">
          <span className="muted font-normal">Week {weekNumber}</span>{" "}
          {week.title}
        </h1>
        <div className="flex items-center gap-1.5 pt-1.5">
          {hasGap ? <GapChip /> : null}
          {hasReview ? <ReviewChip /> : null}
          <StatusChip state={displayState} />
          {data.isDemo ? <DemoBadge /> : null}
        </div>
        <div className="flex gap-1">
          {weekNumber > 1 ? (
            <Link
              to="/weeks/$weekNumber/$tab"
              params={{
                weekNumber: String(weekNumber - 1),
                tab,
              }}
              className="btn btn-g btn-sm"
              aria-label="Previous week"
            >
              <Icon name="chevron-left" />
            </Link>
          ) : (
            <span
              className="btn btn-g btn-sm"
              aria-disabled="true"
              style={{ opacity: 0.35, pointerEvents: "none" }}
            >
              <Icon name="chevron-left" />
            </span>
          )}
          {weekNumber < 91 ? (
            <Link
              to="/weeks/$weekNumber/$tab"
              params={{
                weekNumber: String(weekNumber + 1),
                tab,
              }}
              className="btn btn-g btn-sm"
              aria-label="Next week"
            >
              <Icon name="chevron-right" />
            </Link>
          ) : (
            <span
              className="btn btn-g btn-sm"
              aria-disabled="true"
              style={{ opacity: 0.35, pointerEvents: "none" }}
            >
              <Icon name="chevron-right" />
            </span>
          )}
        </div>
      </div>

      {locked ? (
        <div className="mt-5 rounded-xl border bg-amber px-4 py-3 text-sm flex items-start gap-3">
          <Icon name="lock" className="mt-0.5 shrink-0" />
          <div>
            <b>Locked.</b>{" "}
            {data.lockReason ||
              `Week ${weekNumber} opens when Week ${weekNumber - 1} is manually verified. You can read ahead; attempts, evidence and verification are disabled.`}
          </div>
        </div>
      ) : null}

      <TabList
        className="mt-6 overflow-x-auto no-sb"
        aria-label="Week sections"
        onKeyDown={onTabKeyDown}
      >
        {WEEK_TABS.map((t) => (
          <Tab
            key={t}
            selected={tab === t}
            id={`tab-${t}`}
            aria-controls="panel"
            tabIndex={tab === t ? 0 : -1}
            onClick={() => goTab(t)}
          >
            <Icon name={TAB_ICON[t]} />
            {TAB_LABEL[t]}
          </Tab>
        ))}
      </TabList>

      <div
        id="panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="pt-7 pb-24 fade"
      >
        {tab === "overview" ? (
          <OverviewTab week={week} detail={data} />
        ) : null}
        {tab === "learn" ? (
          <LearnTab key={weekNumber} week={week} locked={locked} />
        ) : null}
        {tab === "practise" ? (
          <PractiseTab week={week} detail={data} locked={locked} />
        ) : null}
        {tab === "build" ? (
          <BuildTab week={week} detail={data} locked={locked} />
        ) : null}
        {tab === "verify" ? (
          <VerifyTab
            key={weekNumber}
            week={week}
            detail={data}
            locked={locked}
            gatesRef={gatesRef}
          />
        ) : null}
        {tab === "notes" ? <NotesTab weekNumber={weekNumber} /> : null}
      </div>

      <NextBar
        weekNumber={weekNumber}
        tab={tab}
        detail={data}
        currentWeek={currentWeekHint}
        nextStepHint={hint}
        onVerify={startVerify}
        onScrollGates={() =>
          gatesRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />
    </div>
  );
}
