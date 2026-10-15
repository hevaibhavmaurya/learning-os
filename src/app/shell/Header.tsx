import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SessionStub } from "@/features/auth/session";

export type HeaderProps = {
  session: SessionStub;
  onOpenPalette: () => void;
  onProfileClick: (el: HTMLElement) => void;
};

/** Mobile sticky header matching reference layout. */
export function Header({
  session,
  onOpenPalette,
  onProfileClick,
}: HeaderProps) {
  return (
    <header
      className="md:hidden sticky top-0 z-20 flex items-center gap-2 px-4 h-14 border-b line"
      style={{
        background: "color-mix(in srgb,var(--bg) 88%,transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="h-7 w-7 rounded-lg bg-forest grid place-items-center">
        <Icon name="sprout" className="!w-3.5 !h-3.5" />
      </div>
      <span className="serif text-lg">Learning OS</span>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={onOpenPalette}
        aria-label="Search"
      >
        <Icon name="search" />
      </Button>
      <button
        type="button"
        className="h-8 w-8 rounded-full sage grid place-items-center text-xs font-semibold"
        onClick={(e) => onProfileClick(e.currentTarget)}
        aria-haspopup="menu"
        aria-label="Profile and settings"
      >
        {session.initials}
      </button>
    </header>
  );
}
