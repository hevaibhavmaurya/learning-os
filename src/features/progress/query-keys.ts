export const progressKeys = {
  all: ["progress"] as const,
  summary: () => [...progressKeys.all, "summary"] as const,
};
