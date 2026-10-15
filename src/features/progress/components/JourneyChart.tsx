import { fmtDate } from "@/shared/lib/format";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Point = { verifiedAt: string; weekNumber: number };

/**
 * Matches reference `journeyChart()` — verified cumulative line + planned guide.
 */
export function JourneyChart({
  timeline,
  planStartDate,
  asOf,
}: {
  timeline: Point[];
  planStartDate: string | null;
  asOf: string;
}) {
  const W = 560;
  const H = 250;
  const p = 28;
  const now = Date.parse(asOf);
  const t0 = planStartDate
    ? Date.parse(planStartDate)
    : now - 12 * WEEK_MS;
  const t1 = Math.max(now, t0 + 12 * WEEK_MS);
  const span = Math.max(1, t1 - t0);
  const planned = Math.min(91, Math.floor((now - t0) / WEEK_MS) + 1);
  const maxY = Math.max(12, Math.ceil((planned + 2) / 4) * 4);

  const x = (t: number) => p + ((t - t0) / span) * (W - p * 1.5);
  const y = (c: number) => H - p - (c / maxY) * (H - p * 1.6);

  if (!timeline.length) {
    return (
      <div className="h-[200px] grid place-items-center text-center">
        <div>
          <div className="serif text-2xl">Your line starts here</div>
          <p className="text-sm muted mt-1">
            Verify Week 1 and the first point appears.
          </p>
        </div>
      </div>
    );
  }

  const vs = timeline
    .map((v) => Date.parse(v.verifiedAt))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);

  const pts: Array<[number, number]> = [
    [t0, 0],
    ...vs.map((t, i) => [t, i + 1] as [number, number]),
    [now, vs.length],
  ];
  const path = pts
    .map(
      (q, i) =>
        `${i ? "L" : "M"}${x(q[0]).toFixed(1)},${y(q[1]).toFixed(1)}`,
    )
    .join("");
  const plan = `M${x(t0)},${y(0)}L${x(t1)},${y(Math.min(91, span / WEEK_MS))}`;
  const yTicks = [0, maxY / 2, maxY];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full mt-4"
      role="img"
      aria-label={`${vs.length} weeks verified over time`}
    >
      {yTicks.map((c) => (
        <g key={c}>
          <line
            x1={p}
            x2={W - p / 2}
            y1={y(c)}
            y2={y(c)}
            stroke="var(--line)"
          />
          <text
            x={p - 8}
            y={y(c) + 4}
            textAnchor="end"
            fontSize={10}
            fill="var(--muted)"
          >
            {c}
          </text>
        </g>
      ))}
      <path
        d={plan}
        stroke="var(--muted)"
        strokeDasharray="4 4"
        fill="none"
        opacity={0.6}
      />
      <path
        d={path}
        stroke="var(--forest)"
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1200,
          strokeDashoffset: 1200,
          animation: "los-draw 1.2s ease forwards",
        }}
      />
      {vs.map((t, i) => (
        <circle
          key={`${t}-${i}`}
          cx={x(t)}
          cy={y(i + 1)}
          r={2.5}
          fill="var(--forest)"
        />
      ))}
      <text x={p} y={H - 6} fontSize={10} fill="var(--muted)">
        {fmtDate(t0)}
      </text>
      <text
        x={W - p / 2}
        y={H - 6}
        fontSize={10}
        fill="var(--muted)"
        textAnchor="end"
      >
        Today
      </text>
      <style>{`@keyframes los-draw{to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}
