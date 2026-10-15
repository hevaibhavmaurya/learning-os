export const settingsKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
  overrides: () => [...settingsKeys.all, "overrides"] as const,
  audit: () => [...settingsKeys.all, "audit"] as const,
  pilot: () => [...settingsKeys.all, "pilot"] as const,
};
