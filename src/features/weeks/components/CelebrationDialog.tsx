import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useLayer } from "@/components/ui/layer-context";
import { getWeek } from "@/shared/content/curriculum";
import { fmtDate } from "@/shared/lib/format";

export function CelebrationDialog({
  weekNumber,
  verifiedCount,
  firstReviewDueAt,
  layerId,
}: {
  weekNumber: number;
  verifiedCount: number;
  firstReviewDueAt?: string | null;
  layerId?: string;
}) {
  const layer = useLayer();
  const title = getWeek(weekNumber).title;
  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
  };

  const reviewLabel = firstReviewDueAt ? fmtDate(firstReviewDueAt) : "to be scheduled";

  return (
    <Dialog
      title={`Week ${weekNumber} verified`}
      label="Week verified"
      layerId={layerId}
      onClose={close}
      actions={
        weekNumber < 91 ? (
          <>
            <Button data-close="" onClick={close}>
              Stay here
            </Button>
            <Link
              to="/weeks/$weekNumber/$tab"
              params={{
                weekNumber: String(weekNumber + 1),
                tab: "overview",
              }}
              className="btn btn-p"
              onClick={close}
            >
              Open Week {weekNumber + 1}
              <Icon name="arrow-right" />
            </Link>
          </>
        ) : undefined
      }
    >
      <div className="text-center py-2">
        <div className="pop mx-auto h-16 w-16 rounded-full bg-forest grid place-items-center">
          <Icon name="badge-check" className="!w-8 !h-8" />
        </div>
        <div className="serif text-3xl mt-4">{title}</div>
        <p className="text-sm muted mt-2">
          {verifiedCount} of 91 verified. First review on {reviewLabel}.
        </p>
      </div>
    </Dialog>
  );
}
