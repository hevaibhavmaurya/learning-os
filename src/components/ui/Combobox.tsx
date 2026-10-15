import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Icon } from "@/components/ui/Icon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cx } from "@/shared/lib/cx";

export type ComboboxOption = { value: string; label: string };

export function Combobox({
  id,
  value,
  onValueChange,
  options,
  label,
  disabled,
  className,
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <button
        id={id}
        type="button"
        className={cx("inp flex items-center justify-between gap-2 text-left disabled:opacity-50", className)}
        aria-label={label}
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="truncate">{selected?.label ?? "Select…"}</span>
        <Icon name="chevrons-up-down" className="shrink-0 muted" />
      </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-[80] surface shadow-soft p-0 outline-none"
          style={{ width: "max(var(--radix-popover-trigger-width), 18rem)", maxWidth: "calc(100vw - 1rem)" }}
        >
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}…`} aria-label={`Search ${label.toLowerCase()}`} />
            <CommandList>
              <CommandEmpty>No matches found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.value} ${option.label}`}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {option.value === value ? <Icon name="check" className="ml-auto shrink-0" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
