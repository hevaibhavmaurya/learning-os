export type ThemeMode = "light" | "dark" | "system";

export const UI_STORAGE_KEY = "los.ui";

export type UiPrefs = {
  theme: ThemeMode;
  collapsed: boolean;
};

const DEFAULT_UI: UiPrefs = { theme: "system", collapsed: false };

function readRaw(): Partial<UiPrefs> {
  try {
    return JSON.parse(localStorage.getItem(UI_STORAGE_KEY) || "{}") as Partial<UiPrefs>;
  } catch {
    return {};
  }
}

export function loadUiPrefs(): UiPrefs {
  return { ...DEFAULT_UI, ...readRaw() };
}

export function saveUiPrefs(prefs: UiPrefs): void {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(prefs));
}

export function resolveDark(theme: ThemeMode): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Apply theme class on <html> — compatible with the index.html no-flash script. */
export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", resolveDark(theme));
}

export function getTheme(): ThemeMode {
  return loadUiPrefs().theme;
}

export function setTheme(theme: ThemeMode): void {
  const prefs = loadUiPrefs();
  prefs.theme = theme;
  saveUiPrefs(prefs);
  applyTheme(theme);
}

export function getCollapsed(): boolean {
  return loadUiPrefs().collapsed;
}

export function setCollapsed(collapsed: boolean): void {
  const prefs = loadUiPrefs();
  prefs.collapsed = collapsed;
  saveUiPrefs(prefs);
}
