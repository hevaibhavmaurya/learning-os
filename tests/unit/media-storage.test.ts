import { describe, expect, it, vi } from "vitest";
import { completeUpload, removeStoredImage } from "../../src/server/features/media/storage";

const step = () => vi.fn(async () => {});

describe("media storage consistency", () => {
  it("marks a successful R2 upload ready", async () => {
    const put = step();
    const markReady = step();
    const removeObject = step();
    await completeUpload({ put, markReady, removeObject, markFailed: step(), onCleanupError: vi.fn() });
    expect(put).toHaveBeenCalledOnce();
    expect(markReady).toHaveBeenCalledOnce();
    expect(removeObject).not.toHaveBeenCalled();
  });

  it("removes R2 bytes and marks failed when D1 cannot mark an upload ready", async () => {
    const error = new Error("D1 unavailable");
    const removeObject = step();
    const markFailed = step();
    await expect(completeUpload({
      put: step(), markReady: vi.fn(async () => { throw error; }),
      removeObject, markFailed, onCleanupError: vi.fn(),
    })).rejects.toBe(error);
    expect(removeObject).toHaveBeenCalledOnce();
    expect(markFailed).toHaveBeenCalledOnce();
  });

  it("still marks failed if R2 put or cleanup fails", async () => {
    const markFailed = step();
    const onCleanupError = vi.fn();
    await expect(completeUpload({
      put: vi.fn(async () => { throw new Error("R2 put failed"); }),
      markReady: step(),
      removeObject: vi.fn(async () => { throw new Error("R2 delete failed"); }),
      markFailed, onCleanupError,
    })).rejects.toThrow("R2 put failed");
    expect(markFailed).toHaveBeenCalledOnce();
    expect(onCleanupError).toHaveBeenCalledWith("object", expect.any(Error));
  });

  it("tombstones before R2 delete and leaves a retryable record on D1 failure", async () => {
    const calls: string[] = [];
    const onCleanupError = vi.fn();
    const result = await removeStoredImage({
      alreadyDeleting: false,
      markDeleting: async () => { calls.push("tombstone"); },
      removeObject: async () => { calls.push("r2"); },
      restoreReady: step(),
      removeRecord: async () => { calls.push("d1"); throw new Error("D1 unavailable"); },
      onCleanupError,
    });
    expect(calls).toEqual(["tombstone", "r2", "d1"]);
    expect(result).toEqual({ cleanupPending: true });
    expect(onCleanupError).toHaveBeenCalledWith("record", expect.any(Error));

    const retryMarkDeleting = step();
    const retried = await removeStoredImage({
      alreadyDeleting: true,
      markDeleting: retryMarkDeleting,
      removeObject: step(), restoreReady: step(), removeRecord: step(),
      onCleanupError: vi.fn(),
    });
    expect(retried).toEqual({ cleanupPending: false });
    expect(retryMarkDeleting).not.toHaveBeenCalled();
  });

  it("restores visible status if R2 deletion fails", async () => {
    const restoreReady = step();
    const removeRecord = step();
    await expect(removeStoredImage({
      alreadyDeleting: false, markDeleting: step(),
      removeObject: vi.fn(async () => { throw new Error("R2 unavailable"); }),
      restoreReady, removeRecord, onCleanupError: vi.fn(),
    })).rejects.toThrow("R2 unavailable");
    expect(restoreReady).toHaveBeenCalledOnce();
    expect(removeRecord).not.toHaveBeenCalled();
  });

  it("does not touch R2 when D1 cannot create the deletion tombstone", async () => {
    const removeObject = step();
    await expect(removeStoredImage({
      alreadyDeleting: false,
      markDeleting: vi.fn(async () => { throw new Error("D1 unavailable"); }),
      removeObject, restoreReady: step(), removeRecord: step(), onCleanupError: vi.fn(),
    })).rejects.toThrow("D1 unavailable");
    expect(removeObject).not.toHaveBeenCalled();
  });
});
