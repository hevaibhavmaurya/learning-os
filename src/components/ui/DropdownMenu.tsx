import type { ReactNode } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";

export function DropdownMenu({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content align="end" sideOffset={6} collisionPadding={8} className="surface z-[80] min-w-56 max-w-[calc(100vw-1rem)] p-1 shadow-soft">
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

export function DropdownMenuItem({ children, onSelect }: { children: ReactNode; onSelect: () => void }) {
  return (
    <DropdownPrimitive.Item onSelect={onSelect} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-[var(--sunk)]">
      {children}
    </DropdownPrimitive.Item>
  );
}
