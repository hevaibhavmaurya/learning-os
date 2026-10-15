import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState, useRouteContext } from "@tanstack/react-router";
import { Sidebar } from "@/app/shell/Sidebar";
import { Header } from "@/app/shell/Header";
import { MobileNav } from "@/app/shell/MobileNav";
import { useCommandPalette } from "@/app/shell/CommandPalette";
import { openProfileMenu } from "@/app/shell/ProfileMenu";
import { activeNavId, NAV_ITEMS } from "@/app/shell/nav";
import {
  getCollapsed,
  setCollapsed as persistCollapsed,
} from "@/app/theme";
import { useLayer } from "@/components/ui/layer-context";
import { cx } from "@/shared/lib/cx";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const activeId = activeNavId(pathname);
  const [collapsed, setCollapsed] = useState(() => getCollapsed());
  const { profile: session } = useRouteContext({ from: "/_authenticated" });
  const layer = useLayer();
  const palette = useCommandPalette();

  useEffect(() => {
    persistCollapsed(collapsed);
  }, [collapsed]);

  /** Reference shortcuts: 1–6 jump nav, Ctrl/Cmd+K palette, Esc closes layers. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (/INPUT|TEXTAREA|SELECT/.test(target.tagName) ||
          target.isContentEditable);
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (layer.hasLayer) return;
      if (/^[1-6]$/.test(e.key)) {
        const item = NAV_ITEMS[Number(e.key) - 1];
        if (item) {
          e.preventDefault();
          void navigate({ to: item.to });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layer.hasLayer, navigate]);

  const onProfileClick = useCallback(
    (el: HTMLElement) => {
      openProfileMenu(
        layer,
        el,
        session,
        () => { void navigate({ to: "/settings" }); },
        () => { void navigate({ to: "/login", replace: true }); },
      );
    },
    [layer, navigate, session],
  );

  return (
    <div
      className={cx("min-h-screen md:flex", collapsed && "collapsed")}
    >
      <Sidebar
        collapsed={collapsed}
        activeId={activeId}
        session={session}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onOpenPalette={palette.open}
        onProfileClick={onProfileClick}
      />

      <div
        className={cx(
          "flex-1 min-w-0 transition-[margin] duration-200",
          collapsed ? "md:ml-[68px]" : "md:ml-60",
        )}
      >
        <Header
          session={session}
          onOpenPalette={palette.open}
          onProfileClick={onProfileClick}
        />
        <main
          id="main"
          tabIndex={-1}
          className="px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 pb-28 md:pb-16 max-w-[1100px] mx-auto outline-none"
        >
          <Outlet />
        </main>
        {/* Sticky region for week action bars (above mobile nav). */}
        <div
          id="sticky-actions"
          className="sticky bottom-16 md:bottom-4 inset-x-3 md:inset-x-auto z-20 pointer-events-none [&:empty]:hidden"
        />
      </div>

      <MobileNav activeId={activeId} />
      {palette.frame}
    </div>
  );
}
