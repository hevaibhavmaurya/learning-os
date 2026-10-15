import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useLayer } from "@/components/ui/layer-context";

export type AlertDialogProps = {
  title: string;
  text: ReactNode;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Require typing this string before Confirm enables (reference `confirmBox`). */
  typed?: string;
  layerId?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

/**
 * Confirm / alert pattern matching reference `confirmBox()` —
 * uses the same #layer modal chrome with optional typed confirmation.
 */
export function AlertDialog({
  title,
  text,
  okLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  typed,
  layerId,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const layer = useLayer();
  const [value, setValue] = useState("");
  const okEnabled = !typed || value.trim() === typed;

  const close = (confirmed: boolean) => {
    if (layerId) layer.close(layerId);
    else layer.close();
    if (confirmed) onConfirm?.();
    else onCancel?.();
  };

  return (
    <Dialog
      title={title}
      label={title}
      layerId={layerId}
      onClose={() => close(false)}
      actions={
        <>
          <Button data-close="" onClick={() => close(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "default" : "primary"}
            disabled={!okEnabled}
            style={
              danger
                ? {
                    background: "var(--rose)",
                    color: "#fff",
                    borderColor: "var(--rose)",
                  }
                : undefined
            }
            onClick={() => close(true)}
          >
            {okLabel}
          </Button>
        </>
      }
    >
      <div role="alertdialog" aria-modal="true" aria-label={title}>
        <p className="text-sm ink2">{text}</p>
        {typed ? (
          <>
            <label className="block text-xs muted mt-4 mb-1.5" htmlFor="cf">
              Type <b className="font-mono">{typed}</b> to confirm
            </label>
            <Input
              id="cf"
              className="font-mono"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </>
        ) : null}
      </div>
    </Dialog>
  );
}

export function useAlertDialog() {
  const layer = useLayer();

  return {
    confirm(
      opts: Omit<AlertDialogProps, "layerId" | "onConfirm" | "onCancel">,
    ) {
      return new Promise<boolean>((resolve) => {
        layer.open(
          <AlertDialog
            {...opts}
            onConfirm={() => resolve(true)}
            onCancel={() => resolve(false)}
          />,
        );
      });
    },
  };
}
