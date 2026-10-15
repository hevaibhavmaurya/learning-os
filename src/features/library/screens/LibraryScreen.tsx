import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import {
  useCreateFromTemplate,
  useCreateNote,
} from "@/features/library/mutations";
import { useNotesList } from "@/features/library/queries";
import type { NoteListFilter, NoteListItem } from "@/shared/contracts/notes";
import { ago } from "@/shared/lib/time";
import { cx } from "@/shared/lib/cx";

const FILTERS: Array<[NoteListFilter, string]> = [
  ["all", "All"],
  ["note", "Notes"],
  ["resource", "Resources"],
  ["archived", "Archived"],
  ["trash", "Trash"],
];

function NoteRow({ note }: { note: NoteListItem }) {
  const kind = note.kind ?? "note";
  const preview =
    note.url?.replace(/^https?:\/\//, "") ||
    note.plainTextPreview ||
    "Empty note";
  return (
    <li>
      <Link
        to="/library/notes/$noteId"
        params={{ noteId: note.id }}
        className="flex items-start gap-3 py-3.5 px-2 -mx-2 rounded-lg hover:bg-[var(--sunk)]"
      >
        <Icon
          name={kind === "resource" ? "bookmark" : "file-text"}
          className={cx(
            "mt-0.5 shrink-0",
            kind === "resource" ? "amber" : "forest",
          )}
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate">
            {note.title || "Untitled"}
          </span>
          <span className="block text-xs muted truncate mt-0.5">{preview}</span>
          <span className="flex flex-wrap gap-1.5 mt-1.5">
            {note.weekNumber ? (
              <span className="chip">W{note.weekNumber}</span>
            ) : null}
            {note.projectId ? (
              <span className="chip">
                {note.projectId.startsWith("P") ? note.projectId : "Project"}
              </span>
            ) : null}
            {note.tags.map((t) => (
              <span key={t} className="text-[11px] muted">
                #{t}
              </span>
            ))}
          </span>
        </span>
        <span className="text-xs muted whitespace-nowrap">
          {ago(note.updatedAt)}
        </span>
      </Link>
    </li>
  );
}

export function LibraryScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<NoteListFilter>("all");
  const [tag, setTag] = useState("");
  const [capture, setCapture] = useState("");

  const listQuery = useNotesList({
    q: q || undefined,
    filter,
    tag: tag || undefined,
    limit: 100,
  });
  const createNote = useCreateNote();
  const createTemplate = useCreateFromTemplate();

  const items = listQuery.data?.items ?? [];
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const n of items) {
      if (!n.trashedAt) n.tags.forEach((t) => set.add(t));
    }
    return [...set].sort();
  }, [items]);

  const openCreated = async (id: string) => {
    await navigate({ to: "/library/notes/$noteId", params: { noteId: id } });
  };

  const onNewNote = async () => {
    try {
      const note = await createNote.mutateAsync({
        kind: "note",
        title: "",
        plainText: "",
        tags: [],
        schemaVersion: 1,
      });
      await openCreated(note.id);
    } catch {
      toast("Could not create note", { tone: "warn" });
    }
  };

  const onCapture = async (e: FormEvent) => {
    e.preventDefault();
    const v = capture.trim();
    if (!v) return;
    const isUrl = /^https?:\/\//i.test(v);
    try {
      await createNote.mutateAsync({
        kind: isUrl ? "resource" : "note",
        title: isUrl
          ? v.replace(/^https?:\/\/(www\.)?/i, "").slice(0, 60)
          : v.slice(0, 80),
        url: isUrl ? v : null,
        plainText: isUrl ? "" : v,
        tags: ["inbox"],
        schemaVersion: 1,
      });
      setCapture("");
      toast(isUrl ? "Resource saved" : "Note saved");
    } catch {
      toast("Could not save capture", { tone: "warn" });
    }
  };

  const onTemplate = async (
    id: "evidence" | "project" | "block" | "paper",
  ) => {
    try {
      const note = await createTemplate.mutateAsync(id);
      toast("Template note created");
      await openCreated(note.id);
    } catch {
      toast("Could not create template note", { tone: "warn" });
    }
  };

  return (
    <div className="fade max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm muted flex items-center gap-2">
            Notes and saved reading
          </p>
          <h1 className="serif text-4xl md:text-5xl mt-1">Library</h1>
        </div>
        <div className="flex gap-2">
          <DropdownMenu trigger={<Button variant="ghost"><Icon name="layout-template" />Templates</Button>}>
            <DropdownMenuItem onSelect={() => void onTemplate("evidence")}><Icon name="file-plus" />Evidence template</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void onTemplate("project")}><Icon name="file-plus" />Project record</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void onTemplate("block")}><Icon name="file-plus" />Block assessment</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void onTemplate("paper")}><Icon name="file-plus" />Paper note</DropdownMenuItem>
          </DropdownMenu>
          <Button variant="primary" onClick={() => void onNewNote()}>
            <Icon name="plus" />
            New note
          </Button>
        </div>
      </div>

      <form
        className="mt-7 surface flex items-center gap-2 pl-4 pr-1.5 h-12 shadow-soft"
        onSubmit={(e) => void onCapture(e)}
      >
        <Icon name="plus" className="muted" />
        <label htmlFor="lc" className="sr-only">
          Quick capture
        </label>
        <Input
          unstyled
          id="lc"
          className="flex-1 bg-transparent outline-none text-sm h-full"
          placeholder="Capture a note or paste a link, press Enter"
          autoComplete="off"
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
        />
        <span className="kbd hidden sm:inline">Enter</span>
      </form>

      <div className="flex flex-wrap items-center gap-2 mt-6">
        <div className="relative flex-1 min-w-[12rem]">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 muted"
          />
          <label htmlFor="ls" className="sr-only">
            Search library
          </label>
          <Input
            id="ls"
            className="search-input"
            placeholder="Search titles, text, links, tags, w9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-sb" role="tablist">
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={filter === k}
              className={cx(
                "btn btn-sm",
                filter === k ? "sage border-transparent" : "btn-g",
              )}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              className={cx("chip", tag === t && "chip-v")}
              onClick={() => setTag(tag === t ? "" : t)}
            >
              #{t}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        {listQuery.isLoading ? (
          <p className="text-sm muted py-8">Loading library…</p>
        ) : items.length ? (
          <ul className="divide-y line border-y line">
            {items.map((n) => (
              <NoteRow key={n.id} note={n} />
            ))}
          </ul>
        ) : q || tag ? (
          <EmptyState
            icon="search-x"
            title="No matches"
            text='Try fewer words, a tag, or a week like "w9".'
            action={
              <Button
                onClick={() => {
                  setQ("");
                  setTag("");
                }}
              >
                Clear search
              </Button>
            }
          />
        ) : filter === "trash" ? (
          <EmptyState
            icon="trash"
            title="Trash is empty"
            text="Deleted notes wait here until you restore them."
          />
        ) : (
          <EmptyState
            icon="library"
            title="Your library is empty"
            text="Capture a note above or save resources from any week. Everything links back to where you learned it."
          />
        )}
      </div>
    </div>
  );
}
