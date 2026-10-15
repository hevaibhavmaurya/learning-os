import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { WeekTab } from "@/app/shell/nav";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import { fmtDate } from "@/shared/lib/format";

const TAB_FLOW: Record<
  Exclude<WeekTab, "verify">,
  [WeekTab, string]
> = {
  overview: ["learn", "Start learning"],
  learn: ["practise", "Next: Practise"],
  practise: ["build", "Next: Build"],
  build: ["verify", "Next: Assess and verify"],
  notes: ["verify", "Go to Verify"],
};

export function NextBar({
  weekNumber,
  tab,
  detail,
  currentWeek,
  nextStepHint,
  onVerify,
  onScrollGates,
}: {
  weekNumber: number;
  tab: WeekTab;
  detail: WeekDetailResponse;
  currentWeek: number;
  nextStepHint: string;
  onVerify: () => void;
  onScrollGates: () => void;
}) {
  let txt: string;
  let btn: ReactNode;

  if (detail.locked) {
    const target = detail.expectedWritableWeek ?? currentWeek;
    txt =
      weekNumber > 1
        ? `Locked until Week ${weekNumber - 1} is verified`
        : "Locked";
    btn = (
      <Link
        to="/weeks/$weekNumber/$tab"
        params={{ weekNumber: String(target), tab: "overview" }}
        className="btn btn-p"
      >
        <Icon name="arrow-left" />
        Go to Week {target}
      </Link>
    );
  } else if (detail.status === "VERIFIED") {
    const nextReview = detail.reviews
      .filter((r) => !r.completedAt)
      .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0];
    txt = `Verified ${fmtDate(detail.verifiedAt)}. Next review ${
      nextReview ? fmtDate(nextReview.dueAt) : "complete"
    }.`;
    btn =
      weekNumber < 91 ? (
        <Link
          to="/weeks/$weekNumber/$tab"
          params={{ weekNumber: String(weekNumber + 1), tab: "overview" }}
          className="btn btn-p"
        >
          Week {weekNumber + 1}
          <Icon name="arrow-right" />
        </Link>
      ) : null;
  } else if (detail.eligibility.canVerify) {
    txt =
      "Eligible. Review the evidence, then verify when you are satisfied.";
    btn =
      tab === "verify" ? (
        <Button variant="primary" onClick={onVerify}>
          <Icon name="badge-check" />
          Verify Week {weekNumber}
        </Button>
      ) : (
        <Link
          to="/weeks/$weekNumber/$tab"
          params={{ weekNumber: String(weekNumber), tab: "verify" }}
          className="btn btn-p"
        >
          <Icon name="shield-check" />
          Go to Verify
        </Link>
      );
  } else if (tab === "verify") {
    txt = detail.eligibility.issues[0]?.message || "Complete remaining steps";
    const needsGates =
      !detail.latestAttempt || !detail.latestAttempt.passed;
    btn = (
      <Button onClick={onScrollGates}>
        <Icon name="arrow-up" />
        {needsGates ? "Score gates" : "Complete evidence"}
      </Button>
    );
  } else {
    const flow = TAB_FLOW[tab as Exclude<WeekTab, "verify">];
    txt = nextStepHint;
    btn = (
      <Link
        to="/weeks/$weekNumber/$tab"
        params={{ weekNumber: String(weekNumber), tab: flow[0] }}
        className="btn btn-p"
      >
        {flow[1]}
        <Icon name="arrow-right" />
      </Link>
    );
  }

  return (
    <div className="fixed md:sticky bottom-16 md:bottom-4 inset-x-3 md:inset-x-auto z-20 mt-2">
      <div className="surface shadow-soft px-4 py-3 flex items-center gap-3">
        <span className="text-sm ink2 flex-1 min-w-0 truncate">{txt}</span>
        {btn}
      </div>
    </div>
  );
}
