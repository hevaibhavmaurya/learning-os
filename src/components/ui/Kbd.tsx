import type { HTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

export type KbdProps = HTMLAttributes<HTMLElement>;

export function Kbd({ className, ...props }: KbdProps) {
  return <kbd className={cx("kbd", className)} {...props} />;
}
