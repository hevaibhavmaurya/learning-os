import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type LayerEntry = {
  id: string;
  node: ReactNode;
};

type LayerContextValue = {
  open: (node: ReactNode) => string;
  close: (id?: string) => void;
  closeAll: () => void;
  hasLayer: boolean;
};

const LayerContext = createContext<LayerContextValue | null>(null);

export function LayerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<LayerEntry[]>([]);
  const lastFocus = useRef<HTMLElement | null>(null);

  const closeAll = useCallback(() => {
    setStack([]);
    const el = lastFocus.current;
    if (el && document.body.contains(el)) el.focus();
    lastFocus.current = null;
  }, []);

  const close = useCallback(
    (id?: string) => {
      setStack((prev) => {
        if (!prev.length) return prev;
        const next = id ? prev.filter((e) => e.id !== id) : prev.slice(0, -1);
        if (!next.length) {
          const el = lastFocus.current;
          queueMicrotask(() => {
            if (el && document.body.contains(el)) el.focus();
            lastFocus.current = null;
          });
        }
        return next;
      });
    },
    [],
  );

  const open = useCallback((node: ReactNode) => {
    const id = `layer-${Math.random().toString(36).slice(2, 9)}`;
    lastFocus.current = document.activeElement as HTMLElement | null;
    setStack((prev) => [...prev, { id, node }]);
    return id;
  }, []);

  useEffect(() => {
    if (!stack.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stack.length, close]);

  const value = useMemo(
    () => ({
      open,
      close,
      closeAll,
      hasLayer: stack.length > 0,
    }),
    [open, close, closeAll, stack.length],
  );

  return (
    <LayerContext.Provider value={value}>
      {children}
      <div id="layer" data-layer-host="">
        {stack.map((entry) => (
          <LayerItem key={entry.id} id={entry.id}>
            {entry.node}
          </LayerItem>
        ))}
      </div>
    </LayerContext.Provider>
  );
}

function LayerItem({ id, children }: { id: string; children: ReactNode }) {
  return <div data-layer-id={id}>{children}</div>;
}

export function useLayer(): LayerContextValue {
  const ctx = useContext(LayerContext);
  if (!ctx) throw new Error("useLayer must be used within LayerProvider");
  return ctx;
}

/** Focus the first focusable control inside a container; trap Tab. */
export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reactId = useId();

  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

    const initial =
      root.querySelector<HTMLElement>(
        "input,textarea,select,[contenteditable],button.btn-p,button",
      ) ?? focusables()[0];
    initial?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [active, reactId]);

  return ref;
}
