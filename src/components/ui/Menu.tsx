import type { CSSProperties, ReactNode } from "react";
import { useFocusTrap, useLayer } from "@/components/ui/layer-context";

export type MenuProps = {
  children: ReactNode;
  /** Absolute positioning style (top/right/bottom/left). */
  style?: CSSProperties;
  layerId?: string;
  onClose?: () => void;
};

/**
 * Profile / floating menu matching reference `profileMenu` — `role="menu"`
 * rendered in the shared #layer host.
 */
export function Menu({ children, style, layerId, onClose }: MenuProps) {
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
        className="fixed inset-0 z-50"
        data-close=""
        onClick={close}
      />
      <div
        ref={trapRef}
        role="menu"
        className="fixed z-50 surface shadow-soft w-64 p-1.5 fade"
        style={style}
      >
        {children}
      </div>
    </>
  );
}

export type MenuItemProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function MenuItem({
  children,
  href,
  onClick,
  className = "flex items-center gap-2.5 px-3 h-9 rounded-md text-sm hover:bg-[var(--sunk)]",
}: MenuItemProps) {
  const layer = useLayer();
  const close = () => layer.close();

  if (href) {
    return (
      <a
        role="menuitem"
        href={href}
        className={className}
        onClick={close}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={`w-full ${className}`}
      onClick={() => {
        onClick?.();
        close();
      }}
    >
      {children}
    </button>
  );
}

export function useMenu() {
  const layer = useLayer();
  return {
    openNear(anchor: HTMLElement, content: ReactNode) {
      const r = anchor.getBoundingClientRect();
      const up = r.top > window.innerHeight / 2;
      const style: CSSProperties = up
        ? {
            bottom: `${window.innerHeight - r.top + 6}px`,
            left: `${Math.max(8, r.left)}px`,
          }
        : { top: `${r.bottom + 6}px`, right: "12px" };

      return layer.open(<Menu style={style}>{content}</Menu>);
    },
    close: layer.close,
  };
}
