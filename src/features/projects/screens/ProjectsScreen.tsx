import { useId, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DocumentSurface,
  type RichEditorValue,
} from "@/components/editor";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Tab, TabList } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import {
  useCreateIdea,
  useCreatePersonalProject,
  useDeleteIdea,
} from "@/features/projects/mutations";
import { useIdeas, useProjectsList } from "@/features/projects/queries";
import { CURRICULUM_PROJECTS } from "@/shared/content/curriculum";
import { ago } from "@/shared/lib/time";

type TabKey = "roadmap" | "mine" | "ideas";

function statusChip(status: string) {
  const tone =
    status === "Active" || status === "active"
      ? "a"
      : status === "Complete" || status === "VERIFIED" || status === "complete"
        ? "v"
        : "default";
  const label =
    status === "VERIFIED"
      ? "Complete"
      : status === "PLANNED"
        ? "Upcoming"
        : status === "ATTEMPTED" || status === "DONE"
          ? "Active"
          : status.charAt(0).toUpperCase() + status.slice(1);
  return <Chip tone={tone as "a" | "v" | "default"}>{label}</Chip>;
}

function NewProjectForm({
  defaultName = "",
  fromIdeaId,
  onCreated,
}: {
  defaultName?: string;
  fromIdeaId?: string;
  onCreated: (id: string) => void;
}) {
  const layer = useLayer();
  const { toast } = useToast();
  const create = useCreatePersonalProject();
  const [name, setName] = useState(defaultName);
  const [summary, setSummary] = useState("");
  const [week, setWeek] = useState("");
  const [repo, setRepo] = useState("");
  const [demo, setDemo] = useState("");
  const bodyRef = useRef<RichEditorValue | null>(null);
  const draftId = useId();

  return (
    <Dialog
      title="New project"
      wide
      actions={
        <>
          <Button data-close="" onClick={() => layer.close()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={create.isPending}
            onClick={async () => {
              const n = name.trim();
              if (!n) {
                toast("Give it a name", { tone: "warn" });
                return;
              }
              try {
                const res = await create.mutateAsync({
                  title: n,
                  summary: summary.trim() || undefined,
                  weekNumber: week ? Number(week) : null,
                  repoUrl: repo.trim() || undefined,
                  demoUrl: demo.trim() || undefined,
                  notesPlainText: bodyRef.current?.plainText || undefined,
                  notesEditorState: bodyRef.current?.editorState || undefined,
                  fromIdeaId,
                });
                layer.close();
                toast("Project created");
                onCreated(res.id);
              } catch (err) {
                toast(
                  err instanceof Error
                    ? err.message
                    : "Could not create project",
                  { tone: "warn" },
                );
              }
            }}
          >
            Create project
          </Button>
        </>
      }
    >
      <label className="text-xs muted" htmlFor="np">
        Name
      </label>
      <Input
        id="np"
        className="mt-1.5"
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <label className="text-xs muted block mt-3" htmlFor="nd">
        One-line summary
      </label>
      <Input
        id="nd"
        className="mt-1.5"
        value={summary}
        placeholder="What you are building, in one sentence"
        onChange={(e) => setSummary(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-xs muted" htmlFor="nw">
            Linked week
          </label>
          <Input
            id="nw"
            type="number"
            min={1}
            max={91}
            className="mt-1.5"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs muted" htmlFor="nr">
            GitHub repo
          </label>
          <Input
            id="nr"
            className="mt-1.5"
            placeholder="github.com/you/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
        </div>
      </div>
      <label className="text-xs muted block mt-3" htmlFor="demo">
        Demo URL
      </label>
      <Input
        id="demo"
        className="mt-1.5"
        placeholder="https://"
        value={demo}
        onChange={(e) => setDemo(e.target.value)}
      />
      <div className="mt-4">
        <div className="text-xs muted mb-1">Notes</div>
        <DocumentSurface
          documentId={draftId}
          defaultEditing
          emptyLabel="Describe the project, goals, or constraints."
          placeholder="Goals, constraints, first milestone…"
          onChange={(v) => {
            bodyRef.current = v;
          }}
        />
      </div>
    </Dialog>
  );
}

export function ProjectsScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const layer = useLayer();
  const [tab, setTab] = useState<TabKey>("roadmap");
  const [ideaText, setIdeaText] = useState("");

  const listQuery = useProjectsList();
  const ideasQuery = useIdeas();
  const createIdea = useCreateIdea();
  const deleteIdea = useDeleteIdea();

  const roadmap = listQuery.data?.roadmap ?? [];
  const personal = listQuery.data?.personal ?? [];
  const ideas = ideasQuery.data?.items ?? [];

  const openNewProject = (name = "", fromIdeaId?: string) => {
    layer.open(
      <NewProjectForm
        defaultName={name}
        fromIdeaId={fromIdeaId}
        onCreated={(id) => {
          setTab("mine");
          void navigate({
            to: "/projects/$projectId",
            params: { projectId: id },
          });
        }}
      />,
    );
  };

  const roadmapRows = CURRICULUM_PROJECTS.map((p) => {
    const progress = roadmap.find((r) => r.projectId === p.id);
    return { curriculum: p, progress };
  });

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm muted flex items-center gap-2">
            What you are building
          </p>
          <h1 className="serif text-4xl md:text-5xl mt-1">Projects</h1>
        </div>
        {tab === "mine" ? (
          <Button variant="primary" onClick={() => openNewProject()}>
            <Icon name="plus" />
            New project
          </Button>
        ) : null}
      </div>

      <TabList className="mt-6">
        {(
          [
            ["roadmap", "Roadmap projects", CURRICULUM_PROJECTS.length],
            ["mine", "My projects", personal.length],
            ["ideas", "Ideas", ideas.length],
          ] as const
        ).map(([k, label, count]) => (
          <Tab key={k} selected={tab === k} onClick={() => setTab(k)}>
            {label}
            <span className="text-xs muted">{count}</span>
          </Tab>
        ))}
      </TabList>

      <div className="pt-6">
        {tab === "roadmap" ? (
          <>
            <p className="text-sm muted mb-4">
              Built into the 91 weeks. Each has an acceptance contract;
              milestones are verified inside the mapped weeks. Acceptance
              confirmation is separate from week counts.
            </p>
            <ul className="divide-y line border-y line">
              {roadmapRows.map(({ curriculum: p, progress }) => {
                const status = progress?.skipped
                  ? "Skipped"
                  : progress?.learnerConfirmed || progress?.verifiedAt
                    ? "Complete"
                    : progress?.status === "DONE" ||
                        progress?.status === "ATTEMPTED"
                      ? "Active"
                      : "Upcoming";
                return (
                  <li key={p.id}>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="grid md:grid-cols-[3rem_1fr_9rem_7rem] gap-x-4 gap-y-1 py-4 hover:bg-[var(--sunk)] px-2 -mx-2 rounded-lg items-start"
                    >
                      <span className="font-mono text-xs muted pt-1">
                        {p.id}
                      </span>
                      <span className="min-w-0">
                        <span className="font-medium block">{p.title}</span>
                        <span className="text-sm muted line-clamp-1 block">
                          {p.purpose.split(". ")[0]}.
                        </span>
                        {p.optional ? (
                          <span className="text-xs muted block mt-1">
                            Optional — skip without blocking Week 24 or P01
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs muted md:pt-1">
                        Weeks {p.weekStart}–{p.weekEnd}
                      </span>
                      <span className="md:text-right md:pt-0.5">
                        {statusChip(status)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {tab === "mine" ? (
          personal.length ? (
            <ul className="divide-y line border-y line">
              {personal.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="grid md:grid-cols-[1fr_9rem_7rem] gap-x-4 gap-y-1 py-4 px-2 -mx-2 rounded-lg hover:bg-[var(--sunk)]"
                  >
                    <span>
                      <span className="font-medium block">{p.title}</span>
                      <span className="text-sm muted block">
                        {p.summary || ""}
                      </span>
                    </span>
                    <span className="text-xs muted">
                      <span className="block">Updated {ago(p.updatedAt)}</span>
                    </span>
                    <span className="md:text-right">
                      {statusChip(p.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="folder-plus"
              title="Your own projects live here"
              text="Side builds, experiments, things you make because you are curious. Kept separate from the roadmap so neither gets cluttered."
              action={
                <Button variant="primary" onClick={() => openNewProject()}>
                  <Icon name="plus" />
                  New project
                </Button>
              }
            />
          )
        ) : null}

        {tab === "ideas" ? (
          <>
            <form
              className="flex gap-2 max-w-xl"
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const v = ideaText.trim();
                if (!v) return;
                try {
                  await createIdea.mutateAsync(v);
                  setIdeaText("");
                  toast("Idea saved");
                } catch {
                  toast("Could not save idea", { tone: "warn" });
                }
              }}
            >
              <label htmlFor="idea" className="sr-only">
                New idea
              </label>
              <Input
                id="idea"
                placeholder="A small idea, one line is enough"
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <Icon name="plus" />
                Add
              </Button>
            </form>
            {ideas.length ? (
              <ul className="mt-6 space-y-2 max-w-3xl">
                {ideas.map((idea) => (
                  <li
                    key={idea.id}
                    className="flex items-center gap-3 rounded-xl border line px-4 py-3 fade"
                  >
                    <Icon name="lightbulb" className="amber shrink-0" />
                    <span className="flex-1 text-sm">{idea.text}</span>
                    <span className="text-xs muted hidden sm:inline">
                      {ago(idea.createdAt)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        openNewProject(idea.text, idea.id);
                      }}
                    >
                      <Icon name="arrow-up-right" />
                      Make project
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete idea"
                      onClick={async () => {
                        await deleteIdea.mutateAsync(idea.id);
                        toast("Idea deleted");
                      }}
                    >
                      <Icon name="trash-2" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="lightbulb"
                title="No ideas yet"
                text='Capture them here or from Today by starting a note with "idea:".'
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
