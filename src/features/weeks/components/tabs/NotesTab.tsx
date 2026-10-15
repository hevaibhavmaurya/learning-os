import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { CURRICULUM_TEMPLATES } from "@/shared/content/curriculum";
import { apiFetch, ApiRequestError } from "@/shared/lib/api";
import { fmtDate } from "@/shared/lib/format";
import { markdownToEditorState } from "@/shared/lib/markdown-to-lexical";
import { useQueryClient } from "@tanstack/react-query";
import { useWeekNotesQuery } from "../../queries";
import { weekKeys } from "../../query-keys";
import { Section } from "../Section";

const TEMPLATE_HINTS: {
  id: "evidence" | "block" | "paper";
  label: string;
  key: string;
}[] = [
  {
    id: "evidence",
    label: "Week evidence template",
    key: "evidence/week-NN.md",
  },
  {
    id: "block",
    label: "Block assessment template",
    key: "assessments/block-NN.md",
  },
  {
    id: "paper",
    label: "Paper notes template",
    key: "docs/papers/paper-name.md",
  },
];

export function NotesTab({ weekNumber }: { weekNumber: number }) {
  const navigate = useNavigate();
  const { data, isLoading } = useWeekNotesQuery(weekNumber);
  const { toast } = useToast();
  const qc = useQueryClient();

  const createNote = async (templateId?: "evidence" | "block" | "paper") => {
    try {
      const templateBody = templateId
        ? (CURRICULUM_TEMPLATES[
            TEMPLATE_HINTS.find((t) => t.id === templateId)!.key
          ] || "").replaceAll("NN", String(weekNumber))
        : "";
      const editorState = templateBody
        ? markdownToEditorState(templateBody)
        : undefined;
      const res = await apiFetch<{ id: string }>("/api/notes", {
        method: "POST",
        body: {
          weekNumber,
          title: templateId
            ? `Week ${weekNumber} ${templateId}`
            : `Week ${weekNumber} note`,
          plainText: templateBody,
          editorState,
          schemaVersion: 1,
          tags: templateId ? ["template", templateId] : ["inbox"],
        },
      });
      void qc.invalidateQueries({ queryKey: weekKeys.notes(weekNumber) });
      toast(templateId ? "Template note created" : "Note created");
      await navigate({
        to: "/library/notes/$noteId",
        params: { noteId: res.id },
      });
      return res.id;
    } catch (err) {
      toast(
        err instanceof ApiRequestError ? err.message : "Could not create note",
        { tone: "warn" },
      );
      return null;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full max-w-3xl" />;
  }

  const items = data?.items ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm muted">
          {items.length
            ? `${items.length} item${items.length === 1 ? "" : "s"} linked to this week`
            : ""}
        </p>
        <Button onClick={() => void createNote()}>
          <Icon name="plus" />
          New note
        </Button>
      </div>

      {items.length ? (
        <ul className="divide-y line border-y line">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                to="/library/notes/$noteId"
                params={{ noteId: n.id }}
                className="flex items-center gap-3 py-3 hover:bg-[var(--sunk)] px-1"
              >
                <Icon name="notebook-pen" className="muted shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {n.title}
                  </span>
                  <span className="block text-xs muted truncate">
                    {n.plainTextPreview || "Empty note"}
                  </span>
                </span>
                <span className="text-xs muted">{fmtDate(n.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="notebook-pen"
          title="Nothing linked yet"
          text={`Notes and saved resources you link to Week ${weekNumber} collect here, so you can find them during reviews.`}
          action={
            <Button onClick={() => void createNote()}>
              <Icon name="plus" />
              New note
            </Button>
          }
        />
      )}

      <Section title="Template hints">
        <p className="text-sm muted mb-3">
          Create a note from a curriculum template. Templates never auto-fabricate
          completed evidence.
        </p>
        <ul className="space-y-2">
          {TEMPLATE_HINTS.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-xl border line p-3"
            >
              <Icon name="file-text" className="muted mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t.label}</div>
                <pre className="text-[11px] muted mt-1 whitespace-pre-wrap font-mono max-h-24 overflow-hidden">
                  {(CURRICULUM_TEMPLATES[t.key] || "").slice(0, 280)}
                  …
                </pre>
              </div>
              <Button size="sm" onClick={() => void createNote(t.id)}>
                Use
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
