import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { useLayer } from "@/components/ui/layer-context";
import {
  applyTheme,
  getTheme,
  setTheme,
  type ThemeMode,
} from "@/app/theme";
import type { SessionStub } from "@/features/auth/session";
import { authApi } from "@/features/auth/api";
import { cx } from "@/shared/lib/cx";

const THEMES: Array<[ThemeMode, string]> = [
  ["light", "sun"],
  ["dark", "moon"],
  ["system", "monitor"],
];

export function ProfileMenuContent({ session, onSettings, onLogout }: {
  session: SessionStub;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const [theme, setSelectedTheme] = useState(getTheme);

  return (
    <>
      <div className="px-3 py-2 text-xs muted">
        Signed in as {session.email}
      </div>
      <div className="px-2 py-1.5">
        <div className="text-xs muted mb-1.5 px-1">Theme</div>
        <div
          className="grid grid-cols-3 gap-1 sunk rounded-lg p-0.5"
          role="radiogroup"
          aria-label="Theme"
        >
          {THEMES.map(([t, icon]) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              className={cx(
                "h-8 rounded-md text-xs flex items-center justify-center gap-1",
                theme === t && "surface shadow-soft",
              )}
              onClick={() => {
                setTheme(t);
                applyTheme(t);
                setSelectedTheme(t);
              }}
            >
              <Icon name={icon} className="!w-3.5 !h-3.5" />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px my-1 border-t line" />
      <MenuItem
        onClick={onSettings}
      >
        <Icon name="settings" />
        Settings
      </MenuItem>
      <MenuItem
        onClick={() => {
          void authApi.logout().then(onLogout).catch(() => {
            window.alert("Could not sign out. Please try again.");
          });
        }}
      >
        <Icon name="log-out" />
        Sign out
      </MenuItem>
    </>
  );
}

export function openProfileMenu(
  layer: ReturnType<typeof useLayer>,
  anchor: HTMLElement,
  session: SessionStub,
  onSettings: () => void,
  onLogout: () => void,
) {
  const r = anchor.getBoundingClientRect();
  const up = r.top > window.innerHeight / 2;
  const style = up
    ? {
        bottom: `${window.innerHeight - r.top + 6}px`,
        left: `${Math.max(8, r.left)}px`,
      }
    : { top: `${r.bottom + 6}px`, right: "12px" };

  layer.open(
    <Menu style={style}>
      <ProfileMenuContent session={session} onSettings={onSettings} onLogout={onLogout} />
    </Menu>,
  );
}
