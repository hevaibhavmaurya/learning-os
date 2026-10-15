import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/Calendar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/shared/lib/cn";

function parseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}

/** Keep date-only values in local calendar time, without UTC conversion. */
export function DatePicker({ id, value, onValueChange, label, disabled, className }: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button id={id} type="button" aria-label={label} disabled={disabled} className={cn("inp flex items-center justify-between gap-2 text-left disabled:opacity-50", className)}>
          <span className={cn(!selected && "muted")}>{selected ? selected.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Pick a date"}</span>
          <Icon name="calendar-days" className="shrink-0 muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} collisionPadding={8} aria-label={label} className="surface z-[80] w-auto p-3 shadow-soft outline-none">
          <Calendar mode="single" autoFocus selected={selected} defaultMonth={selected} onSelect={(date) => {
            if (!date) return;
            onValueChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
            setOpen(false);
          }} />
          {value ? <button type="button" className="btn btn-g btn-sm mt-2 w-full" onClick={() => { onValueChange(""); setOpen(false); }}>Clear date</button> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
