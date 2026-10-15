import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useFocusTrap, useLayer } from "@/components/ui/layer-context";

export type DrawerProps = {
  title: string;
  children: ReactNode;
  layerId?: string;
  onClose?: () => void;
};

/** Right slide-in drawer matching reference `drawer()` — `sm:w-[34rem]`. */
export function Drawer({ title, children, layerId, onClose }: DrawerProps) {
  const layer = useLayer();
  const trapRef = useFocusTrap(true);

  const close = () => {
    if (layerId) layer.close(layerId);
    else layer.close();
    onClose?.();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 scrim fade"
        data-close=""
        onClick={close}
      />
      <aside
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed z-50 right-0 top-0 bottom-0 w-full sm:w-[34rem] surface rounded-none border-y-0 border-r-0 overflow-auto"
        style={{ animation: "slidein .28s ease both" }}
      >
        <div className="sticky top-0 surface rounded-none border-0 border-b line flex items-center justify-between px-5 h-14 z-10">
          <h2 className="font-semibold truncate">{title}</h2>
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
        <div className="p-5">{children}</div>
      </aside>
    </>
  );
}

export function useDrawer() {
  const layer = useLayer();
  return {
    open: (props: Omit<DrawerProps, "layerId">) =>
      layer.open(<Drawer {...props} />),
    close: layer.close,
  };
}
