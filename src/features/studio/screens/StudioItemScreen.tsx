import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PlainEditor, useAutosave } from "@/components/editor";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StudioImages } from "@/features/studio/components/StudioImages";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tab, TabList } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import {
  useDuplicatePost,
  useRestorePost,
  useTrashPost,
  useUpdatePost,
} from "@/features/studio/mutations";
import { usePost } from "@/features/studio/queries";
import {
  CURRICULUM_PROJECTS,
  getWeekTitle,
} from "@/shared/content/curriculum";
import type { PostDetailResponse, PostStatus, StudioPlatform } from "@/shared/contracts/posts";
import { toDateInputValue } from "@/shared/lib/time";
import { cx } from "@/shared/lib/cx";

const PST: Array<[PostStatus, string]> = [
  ["idea", "Idea"],
  ["draft", "Draft"],
  ["ready", "Ready"],
  ["published", "Published"],
];

const PLAT: Array<[StudioPlatform, string, number]> = [
  ["li", "LinkedIn", 3000],
  ["x", "X", 280],
  ["ig", "Instagram", 2200],
];

const PLACEHOLDERS: Record<StudioPlatform, string> = {
  li: "Open with the moment it broke. Then what you measured, the fix, and one limitation.",
  x: "One sharp idea, under 280 characters.",
  ig: "Slide-by-slide outline and a caption.",
};

type Draft = {
  title: string;
  status: PostStatus;
  weekNumber: number | null;
  projectId: string;
  date: string;
  urls: Record<string, string>;
  copy: Record<StudioPlatform, string>;
};

export function StudioItemScreen({ itemId }: { itemId: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const postQuery = usePost(itemId);
  const update = useUpdatePost(itemId);
  const duplicate = useDuplicatePost();
  const trash = useTrashPost();
  const restore = useRestorePost();

  const post = postQuery.data;
  const [platform, setPlatform] = useState<StudioPlatform>("li");
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [conflict, setConflict] = useState(false);
  const draftRef = useRef<Draft | null>(null);
  const hydratedIdRef = useRef<string | null>(null);

  const hydrate = useCallback((source: PostDetailResponse) => {
    const next: Draft = {
      title: source.title,
      status: source.status,
      weekNumber: source.weekNumber,
      projectId: source.projectId ?? "",
      date: toDateInputValue(source.publishedAt || source.plannedAt),
      urls: { ...source.urls },
      copy: {
        li: source.copy.li,
        x: source.copy.x,
        ig: source.copy.ig,
      },
    };
    setDraft(next);
    draftRef.current = next;
    setRevision(source.revision);
    setConflict(false);
    hydratedIdRef.current = source.id;
  }, []);

  useEffect(() => {
    if (post && post.id !== hydratedIdRef.current) hydrate(post);
  }, [post, hydrate]);

  const saveFn = useCallback(
    async (payload: Draft, expectedRevision: number) => {
      const res = await update.mutateAsync({
        expectedRevision,
        title: payload.title,
        status: payload.status,
        weekNumber: payload.weekNumber,
        projectId: payload.projectId || null,
        plannedAt:
          payload.status === "published"
            ? undefined
            : payload.date
              ? new Date(`${payload.date}T09:00`).toISOString()
              : null,
        publishedAt:
          payload.status === "published"
            ? payload.date
              ? new Date(`${payload.date}T09:00`).toISOString()
              : new Date().toISOString()
            : null,
        urls: payload.urls,
        copy: payload.copy,
      });
      return { revision: res.revision };
    },
    [update],
  );

  const autosave = useAutosave({
    documentId: itemId,
    revision,
    debounceMs: 450,
    enabled: Boolean(post) && !post?.trashedAt,
    save: saveFn,
    onRevision: setRevision,
    onConflict: () => setConflict(true),
  });

  useEffect(() => {
    return () => {
      void autosave.flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const schedule = (patch: Partial<Draft> | ((d: Draft) => Draft)) => {
    const previous = draftRef.current;
    if (!previous) return;
    const next = typeof patch === "function" ? patch(previous) : { ...previous, ...patch };
    draftRef.current = next;
    setDraft(next);
    autosave.schedule(next);
  };

  const switchPlatform = async (next: StudioPlatform) => {
    await autosave.flush();
    setPlatform(next);
  };

  const plat = useMemo(
    () => PLAT.find((p) => p[0] === platform) ?? PLAT[0],
    [platform],
  );
  const text = draft?.copy[platform] ?? "";
  const over = text.length > plat[2];
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (postQuery.isLoading) {
    return (
      <div className="fade space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (postQuery.isError || !post || !draft) {
    return (
      <EmptyState
        icon="file-x"
        title="Post not found"
        text=""
        action={
          <Link to="/studio" className="btn">
            Back to Content Studio
          </Link>
        }
      />
    );
  }

  const inTrash = Boolean(post.trashedAt);

  return (
    <div className="fade">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/studio"
          className="text-sm muted hover:underline flex items-center gap-1 mr-auto"
          onClick={() => void autosave.flush()}
        >
          <Icon name="arrow-left" className="!w-3.5 !h-3.5" />
          Content Studio
        </Link>
        <span className="text-xs muted" aria-live="polite">
          {autosave.status === "saved" ? (
            <span className="forest">Saved</span>
          ) : autosave.status === "saving" ? (
            "Saving…"
          ) : autosave.status === "conflict" ? (
            "Conflict"
          ) : autosave.status === "error" ? (
            "Could not save"
          ) : (
            "Saved"
          )}
        </span>
        {inTrash ? (
          <Button
            size="sm"
            onClick={async () => {
              await restore.mutateAsync(itemId);
              toast("Restored");
            }}
          >
            <Icon name="undo-2" />
            Restore
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await autosave.flush();
                const copy = await duplicate.mutateAsync(itemId);
                toast("Duplicated as a draft");
                await navigate({
                  to: "/studio/$itemId",
                  params: { itemId: copy.id },
                });
              }}
            >
              <Icon name="copy" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Delete post"
              onClick={async () => {
                await autosave.flush();
                await trash.mutateAsync(itemId);
                toast("Moved to Trash", {
                  undo: () => {
                    void restore.mutateAsync(itemId);
                  },
                });
                await navigate({ to: "/studio" });
              }}
            >
              <Icon name="trash-2" />
            </Button>
          </>
        )}
      </div>

      {conflict ? (
        <div className="mt-4 rounded-xl bg-amber border p-4 text-sm flex flex-wrap items-center gap-3">
          <span>This post changed elsewhere. Your local draft is kept.</span>
          <Button
            size="sm"
            onClick={async () => {
              const result = await postQuery.refetch();
              if (result.data) {
                autosave.clearDraft();
                hydrate(result.data);
              }
            }}
          >
            Reload from server
          </Button>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_17rem] gap-10 mt-6">
        <div className="min-w-0">
          <Input
            unstyled
            className="serif text-4xl w-full bg-transparent outline-none"
            placeholder="Working title"
            aria-label="Title"
            value={draft.title}
            disabled={inTrash}
            onChange={(e) => schedule({ title: e.target.value })}
          />

          <TabList aria-label="Platform" className="mt-6">
            {PLAT.map(([k, label]) => (
              <Tab
                key={k}
                selected={platform === k}
                onClick={() => void switchPlatform(k)}
              >
                {label}
                {draft.copy[k] ? (
                  <span className="dot" style={{ background: "var(--forest)" }} />
                ) : null}
              </Tab>
            ))}
          </TabList>

          <div className="surface mt-5 shadow-soft">
            <PlainEditor
              key={`${itemId}-${platform}`}
              documentId={`${itemId}-${platform}`}
              initialText={draft.copy[platform]}
              editable={!inTrash}
              placeholder={PLACEHOLDERS[platform]}
              aria-label={`${plat[1]} copy`}
              onChange={(next) => {
                schedule((d) => ({
                  ...d,
                  copy: { ...d.copy, [platform]: next },
                }));
              }}
            />
            <div className="flex items-center gap-3 border-t line px-4 py-2.5 text-xs muted">
              <span className={cx("tabular-nums", over && "rose")}>
                {text.length} / {plat[2]}
              </span>
              <span>{words ? `${words} words` : ""}</span>
              {!text &&
              (draft.copy.li || draft.copy.x) &&
              platform !== "li" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  disabled={inTrash}
                  onClick={() => {
                    const from = draft.copy.li;
                    const adapted =
                      platform === "x"
                        ? from
                            .split("\n")
                            .filter(Boolean)
                            .slice(0, 3)
                            .join("\n\n")
                            .slice(0, 270)
                        : from;
                    schedule((d) => ({
                      ...d,
                      copy: { ...d.copy, [platform]: adapted },
                    }));
                    toast(
                      `Copied LinkedIn text in. Trim it for ${
                        platform === "x" ? "X" : "Instagram"
                      }.`,
                    );
                  }}
                >
                  <Icon name="wand" />
                  Start from LinkedIn copy
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  disabled={!text || inTrash}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(text);
                      toast(`Copied. Paste it into ${plat[1]} yourself.`);
                    } catch {
                      toast("Copy blocked by the browser", { tone: "warn" });
                    }
                  }}
                >
                  <Icon name="clipboard" />
                  Copy text
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs muted mt-3">
            Publishing is manual: copy the text, post it yourself, then paste
            the post URL here.
          </p>
        </div>

        <aside className="space-y-6 text-sm">
          <div>
            <label className="text-xs muted" htmlFor="ps">
              Status
            </label>
            <Select
              id="ps"
              label="Status"
              className="inp mt-1.5"
              value={draft.status}
              disabled={inTrash}
              onValueChange={(next) => {
                const status = next as PostStatus;
                schedule({ status });
                toast(
                  status === "published"
                    ? "Marked as published. Add the post URL so you can find it later."
                    : `Moved to ${PST.find((x) => x[0] === status)?.[1] ?? status}`,
                );
              }}
              options={PST.map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div>
            <label className="text-xs muted" htmlFor="pd">
              {draft.status === "published"
                ? "Published on"
                : "Planned date (optional)"}
            </label>
            <DatePicker
              id="pd"
              label={draft.status === "published" ? "Published on" : "Planned date"}
              className="mt-1.5"
              value={draft.date}
              disabled={inTrash}
              onValueChange={(date) => schedule({ date })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs muted" htmlFor="pw">
                Week
              </label>
              <Input
                id="pw"
                type="number"
                min={1}
                max={91}
                className="mt-1.5"
                value={draft.weekNumber ?? ""}
                disabled={inTrash}
                onChange={(e) =>
                  schedule({
                    weekNumber: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs muted" htmlFor="pp">
                Project
              </label>
              <Combobox
                id="pp"
                className="inp mt-1.5"
                label="Project"
                value={draft.projectId}
                disabled={inTrash}
                onValueChange={(projectId) => schedule({ projectId })}
                options={[
                  { value: "", label: "None" },
                  ...CURRICULUM_PROJECTS.map((p) => ({ value: p.id, label: `${p.id} ${p.title}` })),
                ]}
              />
            </div>
          </div>
          {draft.weekNumber ? (
            <p className="text-xs muted -mt-3">
              Week {draft.weekNumber}: {getWeekTitle(draft.weekNumber)}
            </p>
          ) : null}

          <div>
            <div className="text-xs muted mb-1.5">Saved post URLs</div>
            {PLAT.map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 mt-1.5">
                <span className="w-16 text-xs">{label}</span>
                <Input
                  className="!h-8 text-xs"
                  placeholder="https://"
                  value={draft.urls[k] || ""}
                  disabled={inTrash}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    schedule((d) => {
                      const urls = { ...d.urls };
                      if (v) urls[k] = v;
                      else delete urls[k];
                      return { ...d, urls };
                    });
                  }}
                />
              </label>
            ))}
          </div>

          <StudioImages key={itemId} postId={itemId} initialImages={post.images} disabled={inTrash} />
        </aside>
      </div>
    </div>
  );
}
