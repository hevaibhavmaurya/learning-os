import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLayer } from "@/components/ui/layer-context";

const ACTIVITIES = ["learn", "practise", "build", "assess"] as const;

export function LogTimeDialog({
  weekNumber,
  defaultActivity,
  locked,
  onSubmit,
  layerId,
}: {
  weekNumber: number;
  defaultActivity: (typeof ACTIVITIES)[number];
  locked: boolean;
  onSubmit: (
    hours: number,
    activity: (typeof ACTIVITIES)[number],
  ) => Promise<void>;
  layerId?: string;
}) {
  const layer = useLayer();
  const [hours, setHours] = useState("1.5");
  const [activity, setActivity] =
    useState<(typeof ACTIVITIES)[number]>(defaultActivity);
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
  };

  return (
    <Dialog
      title={`Log time for Week ${weekNumber}`}
      layerId={layerId}
      onClose={close}
      actions={
        <>
          <Button data-close="" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={locked || busy}
            onClick={() => {
              const h = Number(hours);
              if (!(h > 0)) return;
              setBusy(true);
              void onSubmit(h, activity)
                .then(close)
                .finally(() => setBusy(false));
            }}
          >
            Log time
          </Button>
        </>
      }
    >
      <label className="text-xs muted" htmlFor="lh">
        Hours
      </label>
      <Input
        id="lh"
        type="number"
        min={0.25}
        max={12}
        step={0.25}
        className="mt-1.5"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        disabled={locked}
      />
      <label className="text-xs muted block mt-3" htmlFor="lk">
        Activity
      </label>
      <Select
        id="lk"
        label="Activity"
        className="inp mt-1.5"
        value={activity}
        onValueChange={(next) =>
          setActivity(next as (typeof ACTIVITIES)[number])
        }
        disabled={locked}
        options={ACTIVITIES.map((value) => ({ value, label: value }))}
      />
    </Dialog>
  );
}
