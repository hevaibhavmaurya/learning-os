import { useCallback, useEffect, useRef, useState } from "react";
import { isStaleRevisionError } from "@/shared/lib/api";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

export type AutosaveSaveFn<T> = (
  payload: T,
  expectedRevision: number,
) => Promise<{ revision: number }>;

export type UseAutosaveOptions<T> = {
  documentId: string;
  revision: number;
  debounceMs?: number;
  save: AutosaveSaveFn<T>;
  onRevision?: (revision: number) => void;
  onConflict?: (localDraft: T) => void;
  enabled?: boolean;
};

export type UseAutosaveResult<T> = {
  status: SaveStatus;
  schedule: (payload: T) => void;
  flush: () => Promise<boolean>;
  pendingDraft: T | null;
  clearDraft: () => void;
  conflictDraft: T | null;
};

/**
 * Debounced document autosave with revision precondition.
 * Drafts are retained until the server acknowledges the save.
 */
export function useAutosave<T>({
  documentId,
  revision,
  debounceMs = 450,
  save,
  onRevision,
  onConflict,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveResult<T> {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [pendingDraft, setPendingDraft] = useState<T | null>(null);
  const [conflictDraft, setConflictDraft] = useState<T | null>(null);

  const revisionRef = useRef(revision);
  const draftRef = useRef<T | null>(null);
  const timerRef = useRef<number | null>(null);
  const inflightRef = useRef<Promise<boolean> | null>(null);
  const saveRef = useRef(save);
  const onRevisionRef = useRef(onRevision);
  const onConflictRef = useRef(onConflict);

  useEffect(() => {
    revisionRef.current = revision;
  }, [revision]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    onRevisionRef.current = onRevision;
  }, [onRevision]);

  useEffect(() => {
    onConflictRef.current = onConflict;
  }, [onConflict]);

  useEffect(() => {
    // Reset per document
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    draftRef.current = null;
    // A document identity change must discard status from the previous document.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPendingDraft(null);
    setConflictDraft(null);
    setStatus("idle");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [documentId]);

  const persist = useCallback(async (): Promise<boolean> => {
    if (!enabled) return true;
    if (inflightRef.current) {
      await inflightRef.current;
    }

    // A newer edit may have arrived while the previous save was in flight.
    const payload = draftRef.current;
    if (payload == null) return true;

    const expected = revisionRef.current;
    const run = (async () => {
      setStatus("saving");
      try {
        const result = await saveRef.current(payload, expected);
        // Only clear draft if nothing newer was typed during the request
        if (draftRef.current === payload) {
          draftRef.current = null;
          setPendingDraft(null);
        }
        revisionRef.current = result.revision;
        onRevisionRef.current?.(result.revision);
        setStatus("saved");
        return true;
      } catch (err) {
        if (isStaleRevisionError(err)) {
          setConflictDraft(payload);
          setStatus("conflict");
          onConflictRef.current?.(payload);
          return false;
        }
        setStatus("error");
        return false;
      }
    })();

    const inflight = run.finally(() => {
      if (inflightRef.current === inflight) inflightRef.current = null;
    });
    inflightRef.current = inflight;
    return inflight;
  }, [enabled]);

  const schedule = useCallback(
    (payload: T) => {
      if (!enabled) return;
      draftRef.current = payload;
      setPendingDraft(payload);
      setStatus("saving");
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void persist();
      }, debounceMs);
    },
    [debounceMs, enabled, persist],
  );

  const flush = useCallback(async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return persist();
  }, [persist]);

  const clearDraft = useCallback(() => {
    draftRef.current = null;
    setPendingDraft(null);
    setConflictDraft(null);
  }, []);

  useEffect(() => {
    const onLeave = () => {
      if (draftRef.current != null) {
        // Best-effort beacon-style flush is handled by callers via flush()
        void persist();
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      void persist();
    };
  }, [persist]);

  return {
    status,
    schedule,
    flush,
    pendingDraft,
    clearDraft,
    conflictDraft,
  };
}
