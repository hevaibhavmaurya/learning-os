/** Platform modifier key label for shortcut hints (⌘ on Apple, Ctrl elsewhere). */

export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X|Macintosh/i.test(ua);
}

/** Short label shown in UI: "⌘" or "Ctrl". */
export function modKeyLabel(): string {
  return isApplePlatform() ? "⌘" : "Ctrl";
}

/** Full shortcut text, e.g. "⌘K" or "Ctrl K". */
export function modKeyShortcut(key = "K"): string {
  return isApplePlatform() ? `⌘${key}` : `Ctrl ${key}`;
}
