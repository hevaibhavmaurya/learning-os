import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Textarea";
import { useLayer } from "@/components/ui/layer-context";
import { getWeek } from "@/shared/content/curriculum";

export type ReviewDialogProps = {
  weekNumber: number;
  offsetWeeks: number;
  reviewOffset: 7 | 28 | 56 | 112;
  onComplete: (passed: boolean, notes: string) => void;
  layerId?: string;
};

export function ReviewDialog({
  weekNumber,
  offsetWeeks,
  onComplete,
  layerId,
}: ReviewDialogProps) {
  const layer = useLayer();
  const [notes, setNotes] = useState("");
  const wd = getWeek(weekNumber);
  const prompt =
    wd.assessment.split(". Test the result")[0] || wd.assessment;

  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
  };

  return (
    <Dialog
      title={`Week ${weekNumber} review, +${offsetWeeks} weeks`}
      layerId={layerId}
      onClose={close}
      actions={
        <>
          <Button
            onClick={() => {
              onComplete(false, notes);
              close();
            }}
          >
            <Icon name="x" />
            Could not recall
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onComplete(true, notes);
              close();
            }}
          >
            <Icon name="check" />
            Recalled it
          </Button>
        </>
      }
    >
      <p className="text-sm ink2">
        Retest with a <b>different</b> task than last time. No notes for the
        first 10 minutes.
      </p>
      <div className="sunk rounded-lg p-4 mt-4 text-sm">
        <div className="text-xs muted mb-1">Prompt</div>
        {prompt}.
      </div>
      <label className="block text-xs muted mt-4 mb-1.5" htmlFor="rvn">
        What you recalled, what you missed
      </label>
      <Textarea
        id="rvn"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Dialog>
  );
}
