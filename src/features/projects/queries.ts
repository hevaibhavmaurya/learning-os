import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/api";
import { projectKeys } from "@/features/projects/query-keys";

export function useProjectsList() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => projectsApi.list(),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectsApi.getRoadmap(projectId),
    enabled: Boolean(projectId) && /^P\d{2}$/i.test(projectId),
  });
}

export function usePersonalProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectsApi.getPersonal(projectId),
    enabled: Boolean(projectId) && !/^P\d{2}$/i.test(projectId),
  });
}

export function useIdeas() {
  return useQuery({
    queryKey: projectKeys.ideas(),
    queryFn: () => projectsApi.listIdeas(),
  });
}
