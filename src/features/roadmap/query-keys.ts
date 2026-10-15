export const roadmapKeys = {
  all: ["roadmap"] as const,
  summary: () => [...roadmapKeys.all, "summary"] as const,
};
