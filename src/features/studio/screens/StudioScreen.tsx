import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCreatePost } from "@/features/studio/mutations";
import { usePostsList } from "@/features/studio/queries";
import type { PostStatus } from "@/shared/contracts/posts";
import { fmtDate } from "@/shared/lib/time";
import { cx } from "@/shared/lib/cx";

const PST: Array<[PostStatus, string, string]> = [
  ["idea", "Ideas", "lightbulb"],
  ["draft", "Drafts", "pen-line"],
  ["ready", "Ready", "circle-check"],
  ["published", "Published", "send"],
];

const PLAT_LABEL: Record<string, string> = {
  li: "LinkedIn",
  x: "X",
  ig: "Instagram",
};

type Filter = "all" | PostStatus | "trash";

export function StudioScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const create = useCreatePost();

  const listQuery = usePostsList({
    q: q || undefined,
    status: filter === "all" ? "all" : filter,
    limit: 100,
  });

  const items = listQuery.data?.items ?? [];
  const counts = listQuery.data?.counts ?? {
    idea: 0,
    draft: 0,
    ready: 0,
    published: 0,
  };

  const onNew = async () => {
    try {
      const post = await create.mutateAsync();
      await navigate({
        to: "/studio/$itemId",
        params: { itemId: post.id },
      });
    } catch {
      toast("Could not create post", { tone: "warn" });
    }
  };

  return (
    <div className="fade max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm muted flex items-center gap-2">
            Write about what you actually learned
          </p>
          <h1 className="serif text-4xl md:text-5xl mt-1">Content Studio</h1>
        </div>
        <Button variant="primary" onClick={() => void onNew()}>
          <Icon name="plus" />
          New post
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-7">
        <div className="flex gap-1 overflow-x-auto no-sb" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={cx(
              "btn btn-sm",
              filter === "all" ? "sage border-transparent" : "btn-g",
            )}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {PST.map(([k, label]) => (
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
              <span className="muted text-xs">{counts[k]}</span>
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={filter === "trash"}
            className={cx(
              "btn btn-sm",
              filter === "trash" ? "sage border-transparent" : "btn-g",
            )}
            onClick={() => setFilter("trash")}
            aria-label="Trash"
          >
            <Icon name="trash-2" />
            <span className="sr-only">Trash</span>
          </button>
        </div>
        <div className="relative flex-1 min-w-[12rem]">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 muted"
          />
          <label htmlFor="cq" className="sr-only">
            Search posts
          </label>
          <Input
            id="cq"
            className="search-input"
            placeholder="Search posts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        {listQuery.isLoading ? (
          <p className="text-sm muted py-8">Loading posts…</p>
        ) : items.length ? (
          <ul className="divide-y line border-y line">
            {items.map((p) => {
              const st = PST.find((x) => x[0] === p.status) ?? PST[1];
              return (
                <li key={p.id}>
                  <Link
                    to="/studio/$itemId"
                    params={{ itemId: p.id }}
                    className="flex items-start gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-[var(--sunk)]"
                  >
                    <Icon
                      name={st[2]}
                      className={cx(
                        "mt-1 shrink-0",
                        p.status === "published" || p.status === "ready"
                          ? "forest"
                          : "muted",
                      )}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium">
                        {p.title || "Untitled"}
                      </span>
                      <span className="block text-sm muted line-clamp-2 mt-0.5">
                        {p.preview || "No copy yet"}
                      </span>
                      <span className="flex flex-wrap gap-1.5 mt-2">
                        {p.platforms.map((k) => (
                          <span key={k} className="chip">
                            {PLAT_LABEL[k] ?? k}
                          </span>
                        ))}
                        {p.weekNumber ? (
                          <span className="chip">W{p.weekNumber}</span>
                        ) : null}
                        {p.imageCount ? (
                          <span className="chip">
                            <Icon name="image" className="!w-3 !h-3" />
                            {p.imageCount}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="text-xs muted text-right whitespace-nowrap">
                      <span className="block">{st[1].replace(/s$/, "")}</span>
                      {p.publishedAt || p.plannedAt ? (
                        <span className="block mt-1">
                          {p.status === "published" ? "" : "Planned "}
                          {fmtDate(p.publishedAt || p.plannedAt)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : filter === "trash" ? (
          <EmptyState
            icon="trash"
            title="Trash is empty"
            text="Deleted posts wait here until you restore them."
          />
        ) : (
          <EmptyState
            icon="pen-tool"
            title="Nothing here yet"
            text="Turn a verified week into a short post. Real numbers and one honest limitation beat polish."
            action={
              <Button variant="primary" onClick={() => void onNew()}>
                <Icon name="plus" />
                New post
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
