import * as SelectPrimitive from "@radix-ui/react-select";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/shared/lib/cx";

export type SelectOption = { value: string; label: string };

export function Select({ id, value, onValueChange, options, label, disabled, className }: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value || "__empty__"} onValueChange={(next) => onValueChange(next === "__empty__" ? "" : next)} disabled={disabled}>
      <SelectPrimitive.Trigger id={id} aria-label={label} className={cx("inp flex items-center justify-between gap-2 text-left disabled:opacity-50", className)}>
        <SelectPrimitive.Value placeholder="Select…" />
        <SelectPrimitive.Icon><Icon name="chevron-down" className="muted" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={4} className="z-[80] max-h-72 overflow-hidden surface shadow-soft" style={{ minWidth: "var(--radix-select-trigger-width)" }}>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value || "__empty__"} className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-8 text-sm outline-none data-[highlighted]:bg-[var(--sunk)]">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2"><Icon name="check" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
