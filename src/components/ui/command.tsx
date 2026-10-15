/**
 * shadcn Command (cmdk) styled with Learning OS tokens.
 * @see https://ui.shadcn.com/docs/components/base/command
 */
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Icon } from "@/components/ui/Icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";
import { cn } from "@/shared/lib/cn";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden rounded-[14px] bg-[var(--surface)] text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Jump to",
  description = "Search weeks, destinations, notes, and projects",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn("flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-xl", className)}
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          // cmdk focuses the input; prevent Radix from focusing the first button.
          e.preventDefault();
          const root = e.currentTarget as HTMLElement | null;
          root?.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:muted [&_[cmdk-group]]:px-1 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex items-center gap-2 border-b line px-3"
      cmdk-input-wrapper=""
    >
      <Icon name="search" className="shrink-0 muted" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-12 w-full bg-transparent text-sm outline-none border-0 shadow-none ring-0",
          "focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none",
          "focus-visible:outline-none focus-visible:ring-0",
          "placeholder:text-[var(--muted)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "min-h-0 max-h-80 overflow-y-auto overflow-x-hidden overscroll-contain py-1",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn("py-8 text-center text-sm muted", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("my-1 h-px bg-[var(--line)]", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2 py-2 text-sm outline-none",
        "data-[selected=true]:bg-[var(--sunk)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest muted", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
