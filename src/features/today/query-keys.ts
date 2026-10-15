export const todayKeys = {
  all: ["today"] as const,
  summary: () => [...todayKeys.all, "summary"] as const,
};
