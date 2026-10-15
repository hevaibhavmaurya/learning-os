import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import {
  statusChipMeta,
  type WeekDisplayState,
} from "@/shared/lib/week-status";

export function StatusChip({ state }: { state: WeekDisplayState }) {
  const meta = statusChipMeta(state);
  return (
    <Chip tone={meta.tone}>
      <Icon name={meta.icon} className="!w-3 !h-3" />
      {meta.label}
    </Chip>
  );
}

export function GapChip() {
  return (
    <Chip tone="g">
      <Icon name="circle-alert" className="!w-3 !h-3" />
      Gap
    </Chip>
  );
}

export function ReviewChip() {
  return (
    <Chip tone="a">
      <Icon name="rotate-ccw" className="!w-3 !h-3" />
      Review due
    </Chip>
  );
}

export function DemoBadge({ className = "hidden md:inline-flex" }: { className?: string }) {
  return (
    <Chip tone="a" className={className} title="You are viewing demo data">
      Demo data
    </Chip>
  );
}
