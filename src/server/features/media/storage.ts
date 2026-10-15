type Step = () => Promise<unknown>;

export async function completeUpload(steps: {
  put: Step;
  markReady: Step;
  removeObject: Step;
  markFailed: Step;
  onCleanupError: (stage: string, error: unknown) => void;
}): Promise<void> {
  try {
    await steps.put();
    await steps.markReady();
  } catch (error) {
    // A rejected put may have persisted bytes before the rejection surfaced.
    try {
      await steps.removeObject();
    } catch (cleanupError) {
      steps.onCleanupError("object", cleanupError);
    }
    try {
      await steps.markFailed();
    } catch (cleanupError) {
      steps.onCleanupError("status", cleanupError);
    }
    throw error;
  }
}

export async function removeStoredImage(steps: {
  alreadyDeleting: boolean;
  markDeleting: Step;
  removeObject: Step;
  restoreReady: Step;
  removeRecord: Step;
  onCleanupError: (stage: string, error: unknown) => void;
}): Promise<{ cleanupPending: boolean }> {
  if (!steps.alreadyDeleting) await steps.markDeleting();
  try {
    await steps.removeObject();
  } catch (error) {
    if (!steps.alreadyDeleting) {
      try {
        await steps.restoreReady();
      } catch (cleanupError) {
        steps.onCleanupError("status", cleanupError);
      }
    }
    throw error;
  }
  try {
    await steps.removeRecord();
    return { cleanupPending: false };
  } catch (error) {
  // The object is gone and the orphaned tombstone is retryable via DELETE.
    steps.onCleanupError("record", error);
    return { cleanupPending: true };
  }
}
