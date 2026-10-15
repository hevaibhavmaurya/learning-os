import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/app/shell/nav";
import { cx } from "@/shared/lib/cx";

export type MobileNavProps = {
  activeId: string | null;
};

/** Six-item bottom nav with safe-area padding. */
export function MobileNav({ activeId }: MobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t line grid grid-cols-6 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "color-mix(in srgb,var(--surface) 94%,transparent)",
        backdropFilter: "blur(8px)",
      }}
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const active = activeId === item.id;
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex flex-col items-center justify-center gap-1 h-16 text-[10.5px]",
              active ? "forest font-medium" : "muted",
            )}
          >
            <Icon name={item.icon} className="!w-5 !h-5" />
            <span className="truncate max-w-full px-0.5">
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
