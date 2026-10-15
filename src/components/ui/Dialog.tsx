import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useFocusTrap, useLayer } from "@/components/ui/layer-context";
import { cx } from "@/shared/lib/cx";

export type DialogProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  label?: string;
  open?: boolean;
  onClose?: () => void;
  layerId?: string;
};

/** Modal matching reference `modal()` — #layer scrim + bottom sheet on mobile. */
export function Dialog({
  title,
  children,
  actions,
  wide = false,
  label,
  onClose,
  layerId,
}: DialogProps) {
  const layer = useLayer();
  const trapRef = useFocusTrap(true);

  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 scrim fade grid place-items-end sm:place-items-center p-0 sm:p-6"
      data-close=""
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={label || title}
        className={cx(
          "surface shadow-soft w-full rounded-b-none sm:rounded-[14px] max-h-[90vh] overflow-auto pop",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
        style={{ animationDuration: ".3s" }}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close"
            data-close=""
            onClick={close}
          >
            <Icon name="x" />
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {actions ? (
          <div className="flex justify-end gap-2 px-5 pb-5">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function useDialog() {
  const layer = useLayer();
  return {
    open: (props: Omit<DialogProps, "layerId">) =>
      layer.open(<Dialog {...props} />),
    close: layer.close,
  };
}
