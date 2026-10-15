import { Link } from "@tanstack/react-router";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { fmtDate } from "@/shared/lib/format";
import { Section } from "./Section";

type Pilot = {
  activatedAt: string | null;
  simulated: boolean;
  consentDocumented: boolean;
  interruptionCount: number;
  dayIndex?: number;
};

export function PilotPanel({
  pilot,
  locked,
}: {
  pilot: Pilot | null;
  locked: boolean;
}) {
  if (!pilot?.activatedAt) {
    return (
      <Section title="Live pilot">
        <div className="rounded-xl border line p-5">
          <p className="text-sm ink2">
            The pilot runs on its own four-calendar-week clock, separate from
            week locking. Start it when you actually go live. Require documented
            consent/data boundaries for a real pilot, or label SIMULATED.
          </p>
          <Link to="/settings" className="btn btn-p mt-4 inline-flex items-center gap-2">
            <Icon name="play" />
            Set up pilot in Settings
          </Link>
          {locked ? (
            <p className="text-xs muted mt-2">
              Available once Week 43 is unlocked.
            </p>
          ) : null}
        </div>
      </Section>
    );
  }

  const day = pilot.dayIndex ?? 1;
  return (
    <Section title="Live pilot">
      <div className="rounded-xl border line p-5">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="dot"
            style={{ background: "var(--forest)" }}
          />
          Day {day} of 28{" "}
          {pilot.simulated ? <Chip tone="a">SIMULATED</Chip> : null}
          <span className="ml-auto text-xs muted">
            Started {fmtDate(pilot.activatedAt)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-1.5 rounded-full sunk overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    background: "var(--forest)",
                    width: `${Math.max(0, Math.min(100, ((day - 1 - (i - 1) * 7) / 7) * 100))}%`,
                  }}
                />
              </div>
              <div className="text-[11px] muted mt-1">Pilot week {i}</div>
            </div>
          ))}
        </div>
        <Link to="/settings" className="btn btn-g btn-sm mt-4 inline-flex items-center gap-2">
          <Icon name="pause" />
          Manage pilot in Settings
        </Link>
        <span className="text-xs muted ml-2">
          {pilot.interruptionCount} logged
        </span>
      </div>
    </Section>
  );
}
