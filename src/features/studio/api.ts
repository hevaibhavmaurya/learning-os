import type {
  PostDetailResponse,
  PostListItem,
  PostListQuery,
  PostListResponse,
  PostUpdate,
  PostUpdateResponse,
} from "@/shared/contracts/posts";
import { apiFetch } from "@/shared/lib/api";

function toQuery(params: PostListQuery): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  return q ? `?${q}` : "";
}

const BASE = "/api/studio/posts";

export const studioApi = {
  list(params: PostListQuery = { limit: 50 }) {
    return apiFetch<PostListResponse>(`${BASE}${toQuery(params)}`);
  },
  get(id: string) {
    return apiFetch<PostDetailResponse>(`${BASE}/${encodeURIComponent(id)}`);
  },
  create(body: { title: string; status?: string } = { title: "Untitled" }) {
    return apiFetch<PostDetailResponse>(BASE, {
      method: "POST",
      body: {
        title: body.title?.trim() || "Untitled",
        status: body.status,
      },
    });
  },
  update(id: string, body: PostUpdate) {
    return apiFetch<PostUpdateResponse>(`${BASE}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    });
  },
  duplicate(id: string) {
    return apiFetch<PostDetailResponse>(
      `${BASE}/${encodeURIComponent(id)}/duplicate`,
      { method: "POST" },
    );
  },
  trash(id: string) {
    return apiFetch<{ ok: true }>(
      `${BASE}/${encodeURIComponent(id)}/trash`,
      { method: "POST" },
    );
  },
  restore(id: string) {
    return apiFetch<{ ok: true }>(
      `${BASE}/${encodeURIComponent(id)}/restore`,
      { method: "POST" },
    );
  },
};

export type { PostListItem };
