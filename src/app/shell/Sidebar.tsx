import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ModKbd } from "@/components/ui/ModKbd";
import { NAV_ITEMS } from "@/app/shell/nav";
import { cx } from "@/shared/lib/cx";
import type { SessionStub } from "@/features/auth/session";

export type SidebarProps = {
  collapsed: boolean;
  activeId: string | null;
  session: SessionStub;
  onToggleCollapse: () => void;
  onOpenPalette: () => void;
  onProfileClick: (el: HTMLElement) => void;
};

export function Sidebar({
  collapsed,
  activeId,
  session,
  onToggleCollapse,
  onOpenPalette,
  onProfileClick,
}: SidebarProps) {
  return (
    <aside
      className={cx(
        "hidden md:flex shrink-0 flex-col fixed inset-y-0 border-r line px-3 py-4 z-30 transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60",
      )}
      style={{ background: "var(--bg)" }}
      aria-label="Primary"
    >
      <div
        className={cx(
          "flex items-center gap-2.5 px-1.5 mb-6",
          collapsed && "justify-start",
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-forest grid place-items-center shrink-0">
          <Icon name="sprout" className="!w-4 !h-4" />
        </div>
        <div className="hide-c leading-tight">
          <div className="serif text-xl">Learning OS</div>
        </div>
      </div>

      <nav className="nav space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            title={item.label}
            aria-current={activeId === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <Button
        variant="ghost"
        size="sm"
        className="mt-4 justify-start text-xs muted hide-c"
        onClick={onOpenPalette}
      >
        <Icon name="search" />
        Jump to week <ModKbd className="ml-auto" />
      </Button>

      <div className="mt-auto space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-sm"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "panel-left-open" : "panel-left-close"} />
          <span className="hide-c">Collapse</span>
        </Button>

        <button
          type="button"
          className={cx(
            "w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-[var(--sunk)]",
            collapsed && "justify-start",
          )}
          onClick={(e) => onProfileClick(e.currentTarget)}
          aria-haspopup="menu"
          aria-label="Profile and settings"
        >
          <span className="h-8 w-8 rounded-full sage grid place-items-center text-xs font-semibold shrink-0">
            {session.initials}
          </span>
          <span className="hide-c text-left text-sm leading-tight flex-1 min-w-0">
            <span className="block font-medium">{session.displayName}</span>
            <span className="block text-xs muted truncate">
              Theme and sign out
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
