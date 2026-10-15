import type {
  Idea,
  IdeaListResponse,
  PersonalProjectCreate,
  PersonalProjectDetailResponse,
  PersonalProjectUpdate,
  ProjectDetailResponse,
  ProjectListResponse,
} from "@/shared/contracts/projects";
import {
  projectDecisionCreateSchema,
  projectLinksUpdateSchema,
  projectLogCreateSchema,
  projectSkipSchema,
  projectVerifySchema,
} from "@/shared/contracts/projects";
import { apiFetch } from "@/shared/lib/api";
import type { z } from "zod";

type LogCreate = z.infer<typeof projectLogCreateSchema>;
type DecisionCreate = z.infer<typeof projectDecisionCreateSchema>;
type LinksUpdate = z.infer<typeof projectLinksUpdateSchema>;
type ProjectVerify = z.infer<typeof projectVerifySchema>;
type ProjectSkip = z.infer<typeof projectSkipSchema>;

export const projectsApi = {
  list() {
    return apiFetch<ProjectListResponse>("/api/projects");
  },
  getRoadmap(projectId: string) {
    return apiFetch<ProjectDetailResponse>(
      `/api/projects/${encodeURIComponent(projectId)}`,
    );
  },
  getPersonal(projectId: string) {
    return apiFetch<PersonalProjectDetailResponse>(
      `/api/projects/personal/${encodeURIComponent(projectId)}`,
    );
  },
  get(projectId: string) {
    if (/^P\d{2}$/i.test(projectId)) {
      return this.getRoadmap(projectId);
    }
    return this.getPersonal(projectId);
  },
  createPersonal(body: PersonalProjectCreate) {
    return apiFetch<{ id: string }>("/api/projects/personal", {
      method: "POST",
      body,
    });
  },
  updatePersonal(id: string, body: PersonalProjectUpdate) {
    return apiFetch<{ ok: true; revision?: number }>(
      `/api/projects/personal/${encodeURIComponent(id)}`,
      { method: "PATCH", body },
    );
  },
  deletePersonal(id: string) {
    return apiFetch<{ ok: true }>(
      `/api/projects/personal/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
  addLog(projectRef: string, body: LogCreate) {
    return apiFetch<{ id: string }>(
      `/api/projects/${encodeURIComponent(projectRef)}/logs`,
      { method: "POST", body },
    );
  },
  addDecision(projectRef: string, body: DecisionCreate) {
    return apiFetch<{ id: string }>(
      `/api/projects/${encodeURIComponent(projectRef)}/decisions`,
      { method: "POST", body },
    );
  },
  updateLinks(projectRef: string, body: LinksUpdate) {
    return apiFetch<{ ok: true }>(
      `/api/projects/${encodeURIComponent(projectRef)}/links`,
      { method: "PUT", body },
    );
  },
  verify(body: ProjectVerify) {
    return apiFetch<{ ok: true }>(
      `/api/projects/${encodeURIComponent(body.projectId)}/verify`,
      {
        method: "POST",
        body: {
          expectedRevision: body.expectedRevision,
          acceptanceEvidence: body.acceptanceEvidence,
          learnerConfirmed: body.learnerConfirmed,
        },
      },
    );
  },
  skipP02(body: ProjectSkip) {
    return apiFetch<{ ok: true }>("/api/projects/P02/skip", {
      method: "POST",
      body: {
        expectedRevision: body.expectedRevision,
        skipped: body.skipped,
      },
    });
  },
  listIdeas() {
    return apiFetch<IdeaListResponse>("/api/ideas");
  },
  createIdea(body: { text: string }) {
    return apiFetch<Idea>("/api/ideas", { method: "POST", body });
  },
  deleteIdea(id: string) {
    return apiFetch<{ ok: true }>(`/api/ideas/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
  convertIdea(id: string, body: PersonalProjectCreate) {
    return apiFetch<{ id: string }>(
      `/api/ideas/${encodeURIComponent(id)}/convert`,
      { method: "POST", body },
    );
  },
};
