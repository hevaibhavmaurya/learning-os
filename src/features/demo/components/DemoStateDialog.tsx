import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useLayer } from "@/components/ui/layer-context";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/shared/lib/cx";
import {
  useResetDemoSnapshot,
  useSwitchDemoMode,
} from "../mutations";
import {
  DEMO_SNAPSHOT_META,
  type AppDataMode,
  type DemoSnapshotId,
  readDataMode,
} from "../mode";
import { DEMO_SNAPSHOTS } from "../snapshots";

export function DemoStateDialog({ onClose }: { onClose?: () => void }) {
  const layer = useLayer();
  const { toast } = useToast();
  const switchMode = useSwitchDemoMode();
  const reset = useResetDemoSnapshot();
  const mode = readDataMode();

  const close = () => {
    layer.close();
    onClose?.();
  };

  const choose = async (next: AppDataMode) => {
    try {
      await switchMode.mutateAsync(next);
      close();
      toast(
        next === "real"
          ? "Switched to your records"
          : `Loaded demo: ${DEMO_SNAPSHOT_META[next.slice("demo:".length) as DemoSnapshotId].label}`,
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not switch demo", {
        tone: "warn",
      });
    }
  };

  return (
    <Dialog title="Demo state" label="Demo state" onClose={onClose}>
      <p className="text-sm muted mb-4">
        Switch between demo snapshots. Each snapshot and your own records are
        stored separately, so switching never changes your real data.
      </p>
      <div className="space-y-1.5" role="radiogroup" aria-label="Demo state">
        <ModeRadio
          checked={mode === "real"}
          title="Your records"
          blurb="Starts empty, Week 1 unlocked"
          demo={false}
          onSelect={() => void choose("real")}
        />
        {DEMO_SNAPSHOTS.map((id) => {
          const meta = DEMO_SNAPSHOT_META[id];
          const key = `demo:${id}` as const;
          return (
            <ModeRadio
              key={id}
              checked={mode === key}
              title={meta.label}
              blurb={meta.blurb}
              demo
              onSelect={() => void choose(key)}
            />
          );
        })}
      </div>
      {mode !== "real" ? (
        <Button
          size="sm"
          className="mt-4"
          onClick={() => {
            void reset
              .mutateAsync()
              .then(() => {
                close();
                toast("Demo snapshot restored");
              })
              .catch((err: unknown) =>
                toast(
                  err instanceof Error ? err.message : "Reset failed",
                  { tone: "warn" },
                ),
              );
          }}
        >
          <Icon name="rotate-ccw" />
          Reset this demo snapshot
        </Button>
      ) : null}
    </Dialog>
  );
}

function ModeRadio({
  checked,
  title,
  blurb,
  demo,
  onSelect,
}: {
  checked: boolean;
  title: string;
  blurb: string;
  demo: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cx(
        "w-full text-left flex items-center gap-3 rounded-lg border line px-3 py-2.5 hover:bg-[var(--sunk)]",
        checked && "ring-1 ring-[var(--forest)]",
      )}
    >
      <span className="h-4 w-4 rounded-full border line grid place-items-center">
        {checked ? (
          <span className="dot" style={{ background: "var(--forest)" }} />
        ) : null}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium">
          {title}
          {demo ? (
            <Chip tone="a" className="ml-1">
              Demo
            </Chip>
          ) : null}
        </span>
        <span className="block text-xs muted">{blurb}</span>
      </span>
    </button>
  );
}

export function openDemoStateDialog(layer: ReturnType<typeof useLayer>) {
  layer.open(<DemoStateDialog />);
}
