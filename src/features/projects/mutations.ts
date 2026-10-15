import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/api";
import { projectKeys } from "@/features/projects/query-keys";
import type {
  PersonalProjectCreate,
  PersonalProjectUpdate,
} from "@/shared/contracts/projects";

export function useCreatePersonalProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PersonalProjectCreate) =>
      projectsApi.createPersonal(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
      void qc.invalidateQueries({ queryKey: projectKeys.ideas() });
    },
  });
}

export function useUpdatePersonalProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PersonalProjectUpdate) =>
      projectsApi.updatePersonal(projectId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useDeletePersonalProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deletePersonal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useAddProjectLog(projectRef: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      projectsApi.addLog(projectRef, { body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.detail(projectRef) });
    },
  });
}

export function useAddProjectDecision(projectRef: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: string) =>
      projectsApi.addDecision(projectRef, { decision }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.detail(projectRef) });
    },
  });
}

export function useUpdateProjectLinks(projectRef: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { repoUrl?: string | null; demoUrl?: string | null }) =>
      projectsApi.updateLinks(projectRef, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.detail(projectRef) });
    },
  });
}

export function useVerifyProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.verify,
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({
        queryKey: projectKeys.detail(vars.projectId),
      });
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useSkipP02() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.skipP02,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.detail("P02") });
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => projectsApi.createIdea({ text }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.ideas() });
    },
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteIdea(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.ideas() });
    },
  });
}

export function useConvertIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ideaId,
      title,
    }: {
      ideaId: string;
      title: string;
    }) => projectsApi.convertIdea(ideaId, { title }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: projectKeys.list() });
      void qc.invalidateQueries({ queryKey: projectKeys.ideas() });
    },
  });
}
