import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { CurriculumLink } from "@/shared/content/curriculum";

export function ResourceList({
  links,
  onSave,
  savedUrls,
}: {
  links: CurriculumLink[];
  onSave?: (link: CurriculumLink) => void;
  savedUrls?: Set<string>;
}) {
  return (
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.url} className="flex items-center gap-3 group">
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center gap-3 rounded-lg border line px-3 py-2.5 hover:bg-[var(--sunk)]"
          >
            <Icon name="book-marked" className="forest shrink-0" />
            <span className="text-sm truncate">{l.title}</span>
            <Icon name="arrow-up-right" className="muted ml-auto shrink-0" />
          </a>
          {onSave ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave(l)}
              aria-label={`Save ${l.title} to Library`}
            >
              <Icon
                name={
                  savedUrls?.has(l.url) ? "bookmark-check" : "bookmark-plus"
                }
              />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
