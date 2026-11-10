/**
 * Week numbers with special rules in the v6 roadmap (82 weeks; Stage 1 = 1–33).
 * Must agree with content/roadmap.json (validated by scripts/content-build.ts).
 */

export const TOTAL_WEEKS = 82;
export const TOTAL_BLOCKS = 15;
export const STAGE1_FINAL_WEEK = 33;
export const STAGE2_FIRST_WEEK = 34;

/** Block 4 (backend/system design) — Python worker work and the checkpoint. */
export const BACKEND_BLOCK_FIRST_WEEK = 13;
/** Python checkpoint must pass before this week is verified. */
export const PYTHON_CHECKPOINT_WEEK = 19;
/** First week unlocked only after the Python checkpoint passes. */
export const PYTHON_UNLOCKS_WEEK = 20;

/** Systems-language checkpoint gates verification from OS internals onward. */
export const SYSTEMS_CHECKPOINT_WEEK = 39;
export const OS_INTERNALS_FINAL_WEEK = 44;

/** Live pilot runs across the go-live and handover units. */
export const PILOT_FIRST_WEEK = 31;
export const PILOT_FINAL_WEEK = 32;

/** CUDA basics: measured GPU evidence required. */
export const MEASURED_GPU_WEEK = 67;
/** Measuring power / joules per token: modeled or referenced evidence allowed when labeled. */
export const MODELED_HARDWARE_WEEKS = [74, 75] as const;

/** Final week: open-source contribution submission. */
export const CONTRIBUTION_WEEK = 82;

export function isPilotWeek(weekNumber: number): boolean {
  return weekNumber >= PILOT_FIRST_WEEK && weekNumber <= PILOT_FINAL_WEEK;
}

export function allowsModeledHardwareEvidence(weekNumber: number): boolean {
  return (MODELED_HARDWARE_WEEKS as readonly number[]).includes(weekNumber);
}
