import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/shared/lib/cn";

/** Calendar primitive used by the shadcn Popover + Calendar date-picker pattern. */
export function Calendar({ className, ...props }: ComponentProps<typeof DayPicker>) {
  return <DayPicker showOutsideDays className={cn("los-calendar", className)} {...props} />;
}
