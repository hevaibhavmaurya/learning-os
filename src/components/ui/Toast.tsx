import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/shared/lib/cx";

export type ToastTone = "default" | "warn";

export type ToastOptions = {
  tone?: ToastTone;
  icon?: string;
  undo?: () => void;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
  icon: string;
  undo?: () => void;
};

type ToastContextValue = {
  toast: (message: string, opts?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, opts: ToastOptions = {}) => {
      const id = `toast-${Math.random().toString(36).slice(2, 9)}`;
      const tone = opts.tone ?? "default";
      const item: ToastItem = {
        id,
        message,
        tone,
        icon: opts.icon || (tone === "warn" ? "info" : "check"),
        undo: opts.undo,
      };
      setItems((prev) => [...prev, item]);
      const ms =
        opts.durationMs ?? (opts.undo ? 6000 : 3200);
      window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        id="toasts"
        className="fixed z-[60] bottom-20 md:bottom-5 right-4 left-4 md:left-auto md:w-96 space-y-2 pointer-events-none"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="fade pointer-events-auto surface shadow-soft px-4 py-3 text-sm flex items-center gap-3"
          >
            <span className={cx(t.tone === "warn" ? "amber" : "forest")}>
              <Icon name={t.icon} />
            </span>
            <span className="flex-1">{t.message}</span>
            {t.undo ? (
              <Button
                size="sm"
                variant="ghost"
                data-u=""
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
              >
                Undo
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
