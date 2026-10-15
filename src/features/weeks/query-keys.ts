export const weekKeys = {
  all: ["weeks"] as const,
  detail: (weekNumber: number) =>
    [...weekKeys.all, "detail", weekNumber] as const,
  notes: (weekNumber: number) =>
    [...weekKeys.all, "notes", weekNumber] as const,
};
