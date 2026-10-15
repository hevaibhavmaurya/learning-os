import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useLayer } from "@/components/ui/layer-context";
import type { WeekDetailResponse } from "@/shared/contracts/weeks";
import { GATES_UI } from "../lib/gates-ui";

export function VerifyDialog({
  weekNumber,
  detail,
  onConfirm,
  layerId,
}: {
  weekNumber: number;
  detail: WeekDetailResponse;
  onConfirm: () => Promise<void> | void;
  layerId?: string;
}) {
  const layer = useLayer();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const latest = detail.latestAttempt;

  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
  };

  return (
    <Dialog
      title={`Verify Week ${weekNumber}?`}
      wide
      layerId={layerId}
      onClose={close}
      actions={
        <>
          <Button data-close="" onClick={close}>
            Not yet
          </Button>
          <Button
            variant="primary"
            disabled={!checked || busy}
            onClick={() => {
              setBusy(true);
              void Promise.resolve(onConfirm())
                .then(close)
                .finally(() => setBusy(false));
            }}
          >
            <Icon name="badge-check" />
            Verify Week {weekNumber}
          </Button>
        </>
      }
    >
      <p className="text-sm ink2">
        You are confirming that this evidence shows independent, reproducible
        understanding. This unlocks Week {weekNumber + 1 > 91 ? "completion" : weekNumber + 1}{" "}
        and schedules reviews at +1, +4, +8 and +16 weeks from today.
      </p>
      {latest ? (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {GATES_UI.map((g) => (
            <div key={g.key} className="rounded-lg sunk p-2.5 text-center">
              <div className="text-[11px] muted">{g.label}</div>
              <div className="text-lg font-semibold forest">{latest[g.key]}</div>
            </div>
          ))}
        </div>
      ) : null}
      <ul className="mt-4 space-y-1.5 text-sm">
        <li className="flex gap-2">
          <span className="muted w-36 shrink-0">Artifact</span>
          <span className="truncate">
            {detail.evidence?.artifactRef || "—"}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="muted w-36 shrink-0">Explanation</span>
          <span className="truncate">
            {detail.evidence?.explanation || "—"}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="muted w-36 shrink-0">External review</span>
          <span className="truncate">
            {detail.evidence?.externalReviewStatus || "—"}
          </span>
        </li>
      </ul>
      <label className="flex items-start gap-2.5 mt-5 text-sm">
        <input
          type="checkbox"
          id="vok"
          className="mt-0.5"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        I reviewed this evidence and it reflects my own work.
      </label>
    </Dialog>
  );
}
