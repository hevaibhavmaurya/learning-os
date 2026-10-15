import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DocumentSurface,
  useAutosave,
  type RichEditorValue,
} from "@/components/editor";
import { useAlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import {
  useArchiveNote,
  usePurgeNote,
  useRestoreNote,
  useTrashNote,
  useUnarchiveNote,
  useUpdateNote,
} from "@/features/library/mutations";
import { useNote } from "@/features/library/queries";
import {
  CURRICULUM_PROJECTS,
  getWeekTitle,
} from "@/shared/content/curriculum";
import type { NoteKind } from "@/shared/contracts/notes";
import { cx } from "@/shared/lib/cx";
import {
  looksLikeMarkdown,
  markdownToEditorState,
} from "@/shared/lib/markdown-to-lexical";

type MetaDraft = {
  title: string;
  kind: NoteKind;
  weekNumber: number | null;
  projectId: string;
  tags: string;
  url: string;
};

export function NoteEditorScreen({ noteId }: { noteId: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useAlertDialog();
  const noteQuery = useNote(noteId);
  const update = useUpdateNote(noteId);
  const archive = useArchiveNote();
  const unarchive = useUnarchiveNote();
  const trash = useTrashNote();
  const restore = useRestoreNote();
  const purge = usePurgeNote();

  const note = noteQuery.data;
  const [revision, setRevision] = useState(0);
  const [meta, setMeta] = useState<MetaDraft | null>(null);
  const bodyRef = useRef<RichEditorValue | null>(null);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    if (!note) return;
    setRevision(note.revision);
    setMeta({
      title: note.title,
      kind: note.kind ?? "note",
      weekNumber: note.weekNumber,
      projectId: note.projectId ?? "",
      tags: note.tags.join(", "),
      url: note.url ?? "",
    });
    const hydratedState =
      note.editorState ??
      (note.plainText && looksLikeMarkdown(note.plainText)
        ? markdownToEditorState(note.plainText)
        : note.plainText
          ? markdownToEditorState(note.plainText)
          : null);
    bodyRef.current = {
      schemaVersion: 1,
      editorState: hydratedState,
      plainText: note.plainText,
    };
    setConflict(false);
  }, [note]);

  const savePayload = useCallback(
    async (payload: { meta: MetaDraft; body: RichEditorValue | null }, expectedRevision: number) => {
      const tags = payload.meta.tags
        .split(",")
        .map((s) => s.trim().replace(/^#/, ""))
        .filter(Boolean);
      const res = await update.mutateAsync({
        expectedRevision,
        title: payload.meta.title,
        kind: payload.meta.kind,
        weekNumber: payload.meta.weekNumber,
        projectId: payload.meta.projectId || null,
        tags,
        url: payload.meta.url || null,
        schemaVersion: 1,
        editorState: payload.body?.editorState ?? undefined,
        plainText: payload.body?.plainText,
      });
      return { revision: res.revision };
    },
    [update],
  );

  const autosave = useAutosave({
    documentId: noteId,
    revision,
    debounceMs: 450,
    enabled: Boolean(note) && !note?.trashedAt,
    save: savePayload,
    onRevision: setRevision,
    onConflict: () => setConflict(true),
  });

  // Flush pending edits when leaving this note
  useEffect(() => {
    return () => {
      void autosave.flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const scheduleMeta = (patch: Partial<MetaDraft>) => {
    setMeta((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      autosave.schedule({ meta: next, body: bodyRef.current });
      return next;
    });
  };

  const onBodyChange = (value: RichEditorValue) => {
    bodyRef.current = value;
    if (!meta) return;
    autosave.schedule({ meta, body: value });
  };

  if (noteQuery.isLoading) {
    return (
      <div className="fade max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (noteQuery.isError || !note || !meta) {
    return (
      <EmptyState
        icon="file-x"
        title="Note not found"
        text="It may have been deleted permanently."
        action={
          <Link to="/library" className="btn">
            Back to Library
          </Link>
        }
      />
    );
  }

  const inTrash = Boolean(note.trashedAt);
  const archived = Boolean(note.archivedAt);
  const showUrl = meta.kind === "resource" || Boolean(meta.url);

  const statusLabel =
    autosave.status === "saving"
      ? "Saving…"
      : autosave.status === "conflict"
        ? "Conflict"
        : autosave.status === "error"
          ? "Save failed"
          : inTrash
            ? "In trash"
            : "Saved";

  return (
    <div className="fade max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          to="/library"
          className="text-sm muted hover:underline flex items-center gap-1 mr-auto"
          onClick={() => void autosave.flush()}
        >
          <Icon name="arrow-left" className="!w-3.5 !h-3.5" />
          Library
        </Link>
        <span className="text-xs muted" aria-live="polite">
          {autosave.status === "saved" ? (
            <span className="forest">Saved</span>
          ) : (
            statusLabel
          )}
        </span>
        {inTrash ? (
          <>
            <Button
              size="sm"
              onClick={async () => {
                await restore.mutateAsync(noteId);
                toast("Restored");
              }}
            >
              <Icon name="undo-2" />
              Restore
            </Button>
            <Button
              size="sm"
              className="btn-danger"
              onClick={async () => {
                const ok = await confirm.confirm({
                  title: "Delete forever?",
                  text: "This note cannot be recovered.",
                  okLabel: "Delete forever",
                  danger: true,
                });
                if (!ok) return;
                await purge.mutateAsync(noteId);
                toast("Deleted");
                await navigate({ to: "/library" });
              }}
            >
              <Icon name="trash-2" />
              Delete forever
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (archived) {
                  await unarchive.mutateAsync(noteId);
                  toast("Moved back to Library");
                } else {
                  await archive.mutateAsync(noteId);
                  toast("Archived", {
                    undo: () => {
                      void unarchive.mutateAsync(noteId);
                    },
                  });
                }
              }}
            >
              <Icon name={archived ? "archive-restore" : "archive"} />
              {archived ? "Unarchive" : "Archive"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move to trash"
              onClick={async () => {
                await autosave.flush();
                await trash.mutateAsync(noteId);
                toast("Moved to Trash", {
                  undo: () => {
                    void restore.mutateAsync(noteId);
                  },
                });
                await navigate({ to: "/library" });
              }}
            >
              <Icon name="trash-2" />
            </Button>
          </>
        )}
      </div>

      {conflict ? (
        <div className="mt-4 rounded-xl bg-amber border p-4 text-sm flex flex-wrap items-center gap-3">
          <span>
            This note changed elsewhere. Your local draft is kept until you
            choose.
          </span>
          <Button
            size="sm"
            onClick={() => {
              void noteQuery.refetch().then(() => setConflict(false));
            }}
          >
            Reload from server
          </Button>
        </div>
      ) : null}

      <Input
        unstyled
        className="serif text-4xl w-full bg-transparent outline-none mt-6"
        placeholder="Untitled"
        aria-label="Title"
        value={meta.title}
        disabled={inTrash}
        onChange={(e) => scheduleMeta({ title: e.target.value })}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
        <Select
          className="inp !h-8 !w-auto text-xs"
          label="Type"
          value={meta.kind}
          disabled={inTrash}
          onValueChange={(kind) => scheduleMeta({ kind: kind as NoteKind })}
          options={[{ value: "note", label: "Note" }, { value: "resource", label: "Resource" }]}
        />
        <label className="flex items-center gap-1 text-xs muted">
          Week
          <Input
            type="number"
            min={1}
            max={91}
            className="!h-8 !w-16 text-xs"
            value={meta.weekNumber ?? ""}
            disabled={inTrash}
            onChange={(e) =>
              scheduleMeta({
                weekNumber: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </label>
        <Combobox
          className="inp !h-8 !w-auto text-xs max-w-[12rem]"
          label="Linked project"
          value={meta.projectId}
          disabled={inTrash}
          onValueChange={(projectId) => scheduleMeta({ projectId })}
          options={[
            { value: "", label: "No project" },
            ...CURRICULUM_PROJECTS.map((p) => ({ value: p.id, label: `${p.id} ${p.title}` })),
          ]}
        />
        <Input
          className="!h-8 flex-1 min-w-[10rem] text-xs"
          placeholder="tags, comma separated"
          aria-label="Tags"
          value={meta.tags}
          disabled={inTrash}
          onChange={(e) => scheduleMeta({ tags: e.target.value })}
        />
      </div>

      <Input
        className={cx("!h-8 text-xs mt-2", !showUrl && "hidden")}
        placeholder="https://"
        aria-label="URL"
        value={meta.url}
        disabled={inTrash}
        onChange={(e) => scheduleMeta({ url: e.target.value })}
      />

      <DocumentSurface
        key={noteId}
        documentId={noteId}
        initialEditorState={
          bodyRef.current?.editorState ??
          note.editorState ??
          (note.plainText ? markdownToEditorState(note.plainText) : null)
        }
        plainText={bodyRef.current?.plainText ?? note.plainText}
        locked={inTrash}
        defaultEditing={false}
        onChange={onBodyChange}
      />

      {meta.weekNumber ? (
        <Link
          to="/weeks/$weekNumber/$tab"
          params={{ weekNumber: String(meta.weekNumber), tab: "notes" }}
          className="text-xs muted hover:underline inline-flex items-center gap-1"
        >
          <Icon name="link" className="!w-3 !h-3" />
          Linked to Week {meta.weekNumber}: {getWeekTitle(meta.weekNumber)}
        </Link>
      ) : null}
    </div>
  );
}
