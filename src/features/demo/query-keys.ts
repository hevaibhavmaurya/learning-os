/** Isolated demo Query cache namespace — never share keys with real features. */
export const demoKeys = {
  /** Literal `demo:` prefix so real invalidation cannot collide. */
  all: ["demo:"] as const,
  state: () => [...demoKeys.all, "state"] as const,
  snapshots: () => [...demoKeys.all, "snapshots"] as const,
  health: () => [...demoKeys.all, "health"] as const,
};
