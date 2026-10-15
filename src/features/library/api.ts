import type {
  NoteCreate,
  NoteDetailResponse,
  NoteListQuery,
  NoteListResponse,
  NoteUpdate,
  NoteUpdateResponse,
} from "@/shared/contracts/notes";
import { apiFetch } from "@/shared/lib/api";

function toQuery(params: NoteListQuery): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.tag) sp.set("tag", params.tag);
  if (params.filter) sp.set("filter", params.filter);
  if (params.weekNumber != null) sp.set("weekNumber", String(params.weekNumber));
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.includeArchived) sp.set("includeArchived", "1");
  if (params.includeTrashed) sp.set("includeTrashed", "1");
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const libraryApi = {
  list(params: NoteListQuery = { limit: 50 }) {
    return apiFetch<NoteListResponse>(`/api/notes${toQuery(params)}`);
  },
  get(id: string) {
    return apiFetch<NoteDetailResponse>(`/api/notes/${encodeURIComponent(id)}`);
  },
  create(body: NoteCreate) {
    return apiFetch<NoteDetailResponse>("/api/notes", {
      method: "POST",
      body,
    });
  },
  update(id: string, body: NoteUpdate) {
    return apiFetch<NoteUpdateResponse>(`/api/notes/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    });
  },
  archive(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/notes/${encodeURIComponent(id)}/archive`,
      { method: "POST" },
    );
  },
  unarchive(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/notes/${encodeURIComponent(id)}/unarchive`,
      { method: "POST" },
    );
  },
  trash(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/notes/${encodeURIComponent(id)}/trash`,
      { method: "POST" },
    );
  },
  restore(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/notes/${encodeURIComponent(id)}/restore`,
      { method: "POST" },
    );
  },
  purge(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/notes/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};
