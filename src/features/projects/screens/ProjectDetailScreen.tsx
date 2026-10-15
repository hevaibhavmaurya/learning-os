import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DocumentSurface,
  useAutosave,
  type RichEditorValue,
} from "@/components/editor";
import { useAlertDialog } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useLayer } from "@/components/ui/layer-context";
import {
  useAddProjectDecision,
  useAddProjectLog,
  useDeletePersonalProject,
  useSkipP02,
  useUpdatePersonalProject,
  useUpdateProjectLinks,
  useVerifyProject,
} from "@/features/projects/mutations";
import {
  usePersonalProject,
  useProject,
  useProjectsList,
} from "@/features/projects/queries";
import {
  CURRICULUM_WEEKS,
  getProject,
  getWeekTitle,
} from "@/shared/content/curriculum";
import {
  evaluateProjectAcceptance,
  isRoadmapProjectId,
  type RoadmapProjectId,
} from "@/shared/domain/projects";
import { fmtDate } from "@/shared/lib/time";
import { cx } from "@/shared/lib/cx";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-medium mb-3">{title}</h2>
      {children}
    </section>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "ATTEMPTED" || status === "DONE"
      ? "a"
      : status === "Complete" || status === "VERIFIED"
        ? "v"
        : "default";
  const label =
    status === "VERIFIED"
      ? "Complete"
      : status === "PLANNED"
        ? "Upcoming"
        : status === "ATTEMPTED" || status === "DONE"
          ? "Active"
          : status;
  return <Chip tone={tone as "a" | "v" | "default"}>{label}</Chip>;
}

function ProjectLinksDialog({
  repoUrl,
  demoUrl,
  onSave,
  onClose,
}: {
  repoUrl: string;
  demoUrl: string;
  onSave: (repoUrl: string | null, demoUrl: string | null) => Promise<void>;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [repo, setRepo] = useState(repoUrl);
  const [demo, setDemo] = useState(demoUrl);
  const [saving, setSaving] = useState(false);

  return <Dialog title="Project links" actions={<>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="primary" disabled={saving} onClick={async () => {
      setSaving(true);
      try {
        await onSave(repo.trim() || null, demo.trim() || null);
        toast("Links saved");
        onClose();
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not save links", { tone: "warn" });
      } finally {
        setSaving(false);
      }
    }}>Save</Button>
  </>}>
    <label className="text-xs muted" htmlFor="lr">GitHub repo</label>
    <Input id="lr" className="mt-1.5" value={repo} placeholder="github.com/you/repo" onChange={(event) => setRepo(event.target.value)} />
    <label className="text-xs muted block mt-3" htmlFor="ld">Demo URL</label>
    <Input id="ld" className="mt-1.5" value={demo} placeholder="https://" onChange={(event) => setDemo(event.target.value)} />
  </Dialog>;
}

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const isRoadmap = /^P\d{2}$/i.test(projectId);
  if (isRoadmap) return <RoadmapProjectDetail key={projectId} projectId={projectId} />;
  return <PersonalProjectDetail key={projectId} projectId={projectId} />;
}

function RoadmapProjectDetail({ projectId }: { projectId: string }) {
  const curriculum = getProject(projectId);
  const detailQuery = useProject(projectId);
  const listQuery = useProjectsList();
  const { toast } = useToast();
  const layer = useLayer();
  const addLog = useAddProjectLog(projectId);
  const addDecision = useAddProjectDecision(projectId);
  const updateLinks = useUpdateProjectLinks(projectId);
  const verify = useVerifyProject();
  const skip = useSkipP02();
  const [logText, setLogText] = useState("");
  const [evidence, setEvidence] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const detail = detailQuery.data;
  const evidenceValue = evidence ?? detail?.acceptanceEvidence ?? "";
  const listItem = listQuery.data?.roadmap.find((p) => p.projectId === projectId);

  const acceptance = useMemo(() => {
    if (!curriculum || !isRoadmapProjectId(projectId)) return null;
    return evaluateProjectAcceptance({
      projectId,
      mappedWeeksVerified: false,
      acceptanceEvidence: evidenceValue,
      learnerConfirmed: confirmed || Boolean(detail?.learnerConfirmed),
      skipped: Boolean(detail?.skipped ?? listItem?.skipped),
    });
  }, [confirmed, curriculum, detail, evidenceValue, listItem?.skipped, projectId]);

  if (!curriculum) {
    return (
      <EmptyState
        icon="folder-x"
        title="Project not found"
        text=""
        action={
          <Link to="/projects" className="btn">
            Back to projects
          </Link>
        }
      />
    );
  }

  if (detailQuery.isLoading && !detail) {
    return (
      <div className="fade max-w-4xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const status = detail?.skipped
    ? "Skipped"
    : detail?.verifiedAt || detail?.learnerConfirmed
      ? "Complete"
      : detail?.status === "DONE" || detail?.status === "ATTEMPTED"
        ? "Active"
        : "Upcoming";

  const milestones = curriculum.milestones.split(/;\s*/);
  const repo = detail?.links.find((l) => /github/i.test(l.url) || l.label === "repo");
  const demo = detail?.links.find((l) => l.label === "demo");

  const openLinks = () => {
    layer.open(
      <ProjectLinksDialog
        repoUrl={repo?.url?.replace(/^https?:\/\//, "") ?? ""}
        demoUrl={demo?.url ?? ""}
        onSave={async (repoUrl, demoUrl) => { await updateLinks.mutateAsync({ repoUrl, demoUrl }); }}
        onClose={() => layer.close()}
      />,
    );
  };

  const openDecision = () => {
    let text = "";
    layer.open(
      <Dialog
        title="Technical decision"
        actions={
          <>
            <Button data-close="" onClick={() => layer.close()}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!text.trim()) return;
                await addDecision.mutateAsync(text.trim());
                layer.close();
                toast("Decision recorded");
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <label className="text-xs muted" htmlFor="dc">
          Decision and why
        </label>
        <Textarea
          id="dc"
          rows={3}
          className="mt-1.5"
          placeholder="Chose X over Y because..."
          onChange={(e) => {
            text = e.target.value;
          }}
        />
      </Dialog>,
    );
  };

  return (
    <div className="fade max-w-4xl">
      <Link
        to="/projects"
        className="text-sm muted hover:underline flex items-center gap-1"
      >
        <Icon name="arrow-left" className="!w-3.5 !h-3.5" />
        Projects
      </Link>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <span className="font-mono text-sm muted">{curriculum.id}</span>
        <StatusChip status={status} />
        <span className="chip">{curriculum.scope}</span>
        {curriculum.optional ? <Chip>Optional</Chip> : null}
        <span className="text-xs muted">
          Weeks {curriculum.weekStart}–{curriculum.weekEnd}
        </span>
      </div>
      <h1 className="serif text-4xl mt-2">{curriculum.title}</h1>
      <p className="ink2 mt-3 leading-relaxed max-w-3xl">{curriculum.purpose}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {repo ? (
          <a
            className="btn btn-sm"
            href={
              repo.url.startsWith("http") ? repo.url : `https://${repo.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="github" />
            {repo.url.replace(/^https?:\/\//, "").replace(/^github\.com\//, "")}
          </a>
        ) : null}
        <Button size="sm" onClick={openLinks}>
          <Icon name="link" />
          {repo ? "Edit links" : "Add GitHub or demo link"}
        </Button>
      </div>

      <div className="grid md:grid-cols-[1fr_16rem] gap-10 mt-10">
        <div className="space-y-9">
          <Section title="Milestones">
            <ol className="relative border-l line ml-1.5 space-y-4">
              {milestones.map((m) => (
                <li key={m} className="pl-5 relative">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full sunk border line" />
                  <span className="text-sm">{m}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Build log">
            <form
              className="flex gap-2 mb-4"
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const v = logText.trim();
                if (!v) return;
                await addLog.mutateAsync(v);
                setLogText("");
                toast("Logged");
              }}
            >
              <label htmlFor="lg" className="sr-only">
                Log entry
              </label>
              <Input
                id="lg"
                placeholder="What changed today?"
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
              />
              <Button type="submit">
                <Icon name="plus" />
                Log
              </Button>
            </form>
            {detail?.logs?.length ? (
              <ul className="space-y-3">
                {detail.logs.map((l) => (
                  <li key={l.id} className="text-sm flex gap-3">
                    <span className="muted w-16 shrink-0">
                      {fmtDate(l.loggedAt)}
                    </span>
                    <span>{l.body}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm muted">No entries yet.</p>
            )}
          </Section>

          <Section title="Technical decisions">
            {detail?.decisions?.length ? (
              <ul className="space-y-2 text-sm">
                {detail.decisions.map((d) => (
                  <li key={d.id} className="flex gap-2">
                    <Icon name="git-branch" className="muted mt-0.5 shrink-0" />
                    {d.decision}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm muted">None recorded.</p>
            )}
            <Button size="sm" className="mt-3" onClick={openDecision}>
              <Icon name="plus" />
              Add decision
            </Button>
          </Section>

          <Section title="Acceptance contract">
            <div className="text-sm leading-relaxed space-y-3 ink2">
              <p>
                <b className="font-medium" style={{ color: "var(--ink)" }}>
                  Requirements.
                </b>{" "}
                {curriculum.functionalRequirements}
              </p>
              <p>
                <b className="font-medium" style={{ color: "var(--ink)" }}>
                  Checks.
                </b>{" "}
                {curriculum.acceptanceTests}
              </p>
              <p>
                <b className="font-medium" style={{ color: "var(--ink)" }}>
                  Evidence.
                </b>{" "}
                {curriculum.requiredEvidence}
              </p>
              {curriculum.exitCondition ? (
                <p>
                  <b className="font-medium" style={{ color: "var(--ink)" }}>
                    Exit.
                  </b>{" "}
                  {curriculum.exitCondition}
                </p>
              ) : null}
            </div>

            <div className="mt-5 surface p-4 space-y-3">
              <p className="text-xs muted">
                Acceptance confirmation is separate from week verification
                counts.
              </p>
              <label className="block text-xs muted" htmlFor="ae">
                Acceptance evidence
              </label>
              <Textarea
                id="ae"
                className="min-h-32 resize-y"
                value={evidenceValue}
                placeholder="Record core contract evidence…"
                aria-label="Acceptance evidence"
                onChange={(event) => setEvidence(event.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed || Boolean(detail?.learnerConfirmed)}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I confirm the acceptance contract is met
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  disabled={!acceptance?.canVerify || !isRoadmapProjectId(projectId)}
                  onClick={async () => {
                    if (!isRoadmapProjectId(projectId)) return;
                    try {
                      await verify.mutateAsync({
                        projectId: projectId as RoadmapProjectId,
                        expectedRevision: detail?.revision ?? 0,
                        acceptanceEvidence: evidenceValue,
                        learnerConfirmed: true,
                      });
                      toast("Project acceptance recorded");
                    } catch {
                      toast("Could not verify project", { tone: "warn" });
                    }
                  }}
                >
                  Confirm acceptance
                </Button>
                {curriculum.optional && projectId === "P02" ? (
                  <Button
                    onClick={async () => {
                      try {
                        await skip.mutateAsync({
                          projectId: "P02",
                          expectedRevision: detail?.revision ?? 0,
                          skipped: true,
                        });
                        toast("P02 marked skipped (does not block Week 24)");
                      } catch {
                        toast("Could not skip P02", { tone: "warn" });
                      }
                    }}
                  >
                    Skip optional P02
                  </Button>
                ) : null}
              </div>
              {acceptance?.blockers.length ? (
                <ul className="text-xs muted space-y-1">
                  {acceptance.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Section>
        </div>

        <aside className="space-y-6 text-sm">
          <Section title="Resources">
            <ul className="space-y-1.5">
              {curriculum.learningReferences.map((r) => (
                <li key={r.url}>
                  <a
                    className="forest hover:underline break-all"
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.url
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Weeks">
            <div className="flex flex-wrap gap-1">
              {CURRICULUM_WEEKS.filter(
                (w) =>
                  w.number >= curriculum.weekStart &&
                  w.number <= curriculum.weekEnd,
              ).map((w) => (
                <Link
                  key={w.number}
                  to="/weeks/$weekNumber/$tab"
                  params={{ weekNumber: String(w.number), tab: "overview" }}
                  title={w.title}
                  className="h-6 min-w-[1.5rem] px-1 rounded text-[11px] grid place-items-center sunk muted"
                >
                  {w.number}
                </Link>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function PersonalProjectDetail({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useAlertDialog();
  const layer = useLayer();
  const detailQuery = usePersonalProject(projectId);
  const deleteProject = useDeletePersonalProject();
  const updateProject = useUpdatePersonalProject(projectId);
  const addLog = useAddProjectLog(projectId);
  const addDecision = useAddProjectDecision(projectId);
  const updateLinks = useUpdateProjectLinks(projectId);
  const [logText, setLogText] = useState("");
  const [localRevision, setRevision] = useState(0);
  const bodyRef = useRef<RichEditorValue | null>(null);

  const detail = detailQuery.data;

  const revision = Math.max(localRevision, detail?.revision ?? 0);

  const autosave = useAutosave({
    documentId: projectId,
    revision,
    debounceMs: 500,
    enabled: Boolean(detail),
    save: async (payload: RichEditorValue, expectedRevision: number) => {
      const res = await updateProject.mutateAsync({
        expectedRevision,
        notesPlainText: payload.plainText,
        notesEditorState: payload.editorState,
        notesSchemaVersion: 1,
      });
      return { revision: res.revision ?? expectedRevision + 1 };
    },
    onRevision: setRevision,
  });

  if (detailQuery.isLoading && !detail) {
    return (
      <div className="fade max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <EmptyState
        icon="folder-x"
        title="Project not found"
        text="It may have been deleted."
        action={
          <Link to="/projects" className="btn">
            Back to projects
          </Link>
        }
      />
    );
  }

  const repo = detail.links.find((l) => l.label === "repo" || /github/i.test(l.url));
  const demo = detail.links.find((l) => l.label === "demo");

  const openLinks = () => {
    layer.open(
      <ProjectLinksDialog
        repoUrl={repo?.url?.replace(/^https?:\/\//, "") ?? ""}
        demoUrl={demo?.url ?? ""}
        onSave={async (repoUrl, demoUrl) => { await updateLinks.mutateAsync({ repoUrl, demoUrl }); }}
        onClose={() => layer.close()}
      />,
    );
  };

  const openDecision = () => {
    let text = "";
    layer.open(
      <Dialog
        title="Technical decision"
        actions={
          <>
            <Button data-close="" onClick={() => layer.close()}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!text.trim()) return;
                await addDecision.mutateAsync(text.trim());
                layer.close();
                toast("Decision recorded");
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <label className="text-xs muted" htmlFor="dc">
          Decision and why
        </label>
        <Textarea
          id="dc"
          rows={3}
          className="mt-1.5"
          placeholder="Chose X over Y because..."
          onChange={(e) => {
            text = e.target.value;
          }}
        />
      </Dialog>,
    );
  };

  return (
    <div className="fade max-w-3xl">
      <Link
        to="/projects"
        className="text-sm muted hover:underline flex items-center gap-1"
      >
        <Icon name="arrow-left" className="!w-3.5 !h-3.5" />
        My projects
      </Link>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <StatusChip status={detail.status} />
        <Chip>Personal</Chip>
        {detail.weekNumber ? (
          <Link
            to="/weeks/$weekNumber/$tab"
            params={{ weekNumber: String(detail.weekNumber), tab: "overview" }}
            className="chip hover:underline"
          >
            Week {detail.weekNumber}: {getWeekTitle(detail.weekNumber)}
          </Link>
        ) : null}
        <span className="text-xs muted ml-auto" aria-live="polite">
          {autosave.status === "saving"
            ? "Saving…"
            : autosave.status === "saved"
              ? "Saved"
              : null}
        </span>
      </div>
      <h1 className="serif text-4xl mt-2">{detail.title}</h1>
      <p className={cx("ink2 mt-1", !detail.summary && "muted")}>
        {detail.summary || "No summary yet"}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {repo ? (
          <a
            className="btn btn-sm"
            href={
              repo.url.startsWith("http") ? repo.url : `https://${repo.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="github" />
            {repo.url.replace(/^https?:\/\//, "").replace(/^github\.com\//, "")}
          </a>
        ) : null}
        {demo ? (
          <a
            className="btn btn-sm"
            href={
              demo.url.startsWith("http") ? demo.url : `https://${demo.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" />
            Demo
          </a>
        ) : null}
        <Button size="sm" onClick={openLinks}>
          <Icon name="link" />
          {repo || demo ? "Edit links" : "Add links"}
        </Button>
      </div>

      <div className="mt-9 space-y-9">
        <Section title="Notes">
          <DocumentSurface
            key={projectId}
            documentId={`${projectId}-notes`}
            initialEditorState={detail.notesEditorState}
            plainText={detail.notesPlainText}
            defaultEditing={!detail.notesPlainText?.trim()}
            emptyLabel="Project notes live here."
            onChange={(value) => {
              bodyRef.current = value;
              autosave.schedule(value);
            }}
          />
        </Section>

        <Section title="Build log">
          <form
            className="flex gap-2 mb-4"
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              const v = logText.trim();
              if (!v) return;
              await addLog.mutateAsync(v);
              setLogText("");
              toast("Logged");
            }}
          >
            <Input
              id="lg"
              placeholder="What changed today?"
              aria-label="Log entry"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
            />
            <Button type="submit">
              <Icon name="plus" />
              Log
            </Button>
          </form>
          {detail.logs.length ? (
            <ul className="space-y-3">
              {detail.logs.map((l) => (
                <li key={l.id} className="text-sm flex gap-3">
                  <span className="muted w-16 shrink-0">
                    {fmtDate(l.loggedAt)}
                  </span>
                  <span>{l.body}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm muted">No entries yet.</p>
          )}
        </Section>

        <Section title="Technical decisions">
          {detail.decisions.length ? (
            <ul className="space-y-2 text-sm">
              {detail.decisions.map((d) => (
                <li key={d.id} className="flex gap-2">
                  <Icon name="git-branch" className="muted mt-0.5 shrink-0" />
                  {d.decision}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm muted">None recorded.</p>
          )}
          <Button size="sm" className="mt-3" onClick={openDecision}>
            <Icon name="plus" />
            Add decision
          </Button>
        </Section>

        <Button
          className="btn-danger"
          onClick={async () => {
            const ok = await confirm.confirm({
              title: "Delete project?",
              text: "The project and its log are removed.",
              okLabel: "Delete",
              danger: true,
            });
            if (!ok) return;
            await deleteProject.mutateAsync(projectId);
            toast("Project deleted");
            await navigate({ to: "/projects" });
          }}
        >
          <Icon name="trash-2" />
          Delete project
        </Button>
      </div>
    </div>
  );
}
