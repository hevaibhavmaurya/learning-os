import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/app/shell/nav";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Icon } from "@/components/ui/Icon";
import { CURRICULUM_WEEKS } from "@/shared/content/curriculum";
import { modKeyShortcut } from "@/shared/lib/mod-key";

type PaletteItem = {
  id: string;
  to: string;
  icon: string;
  title: string;
  subtitle: string;
  /** Extra tokens for cmdk value matching (week topics, etc.). */
  keywords?: string;
};

function buildWeekItems(): PaletteItem[] {
  return CURRICULUM_WEEKS.map((w) => ({
    id: `week-${w.number}`,
    to: `/weeks/${w.number}/overview`,
    icon: "calendar",
    title: `Week ${w.number}`,
    subtitle: w.title,
    keywords: [String(w.number), w.title, w.learn, w.build, `w${w.number}`]
      .filter(Boolean)
      .join(" "),
  }));
}

const NAV_PALETTE: PaletteItem[] = NAV_ITEMS.map((nav) => ({
  id: `nav-${nav.id}`,
  to: nav.to,
  icon: nav.icon,
  title: nav.label,
  subtitle: "Navigate",
  keywords: nav.id,
}));

/**
 * Jump-to command palette — shadcn CommandDialog + cmdk.
 * @see https://ui.shadcn.com/docs/components/base/command
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const weeks = buildWeekItems();

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Search by week number or weekly topic"
    >
      <CommandInput placeholder="Week number or topic…" />
      <CommandList>
        <CommandEmpty>No matches</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_PALETTE.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.title} ${item.keywords ?? ""}`}
              onSelect={() => go(item.to)}
            >
              <Icon name={item.icon} />
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{item.title}</span>
                <span className="block text-xs muted">{item.subtitle}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Weeks">
          {weeks.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.title} ${item.subtitle} ${item.keywords ?? ""}`}
              onSelect={() => go(item.to)}
            >
              <Icon name={item.icon} />
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{item.title}</span>
                <span className="block text-xs muted truncate">
                  {item.subtitle}
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** @deprecated Use CommandPalette — kept for import compatibility. */
export const CommandPaletteFrame = CommandPalette;

/**
 * Global ⌘K / Ctrl+K command palette (shadcn Command pattern).
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prefer e.code — reliable across layouts; match both Ctrl and ⌘.
      const isK = e.code === "KeyK" || e.key.toLowerCase() === "k";
      if (!isK || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      e.stopPropagation();
      setOpen((prev) => !prev);
    };
    // Capture phase so we win over page-level handlers / browser chrome.
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    setOpen,
    isOpen: open,
    frame: <CommandPalette open={open} onOpenChange={setOpen} />,
    shortcutLabel: modKeyShortcut("K"),
  };
}
