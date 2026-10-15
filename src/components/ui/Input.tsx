import type { ComponentPropsWithRef } from "react";
import { cx } from "@/shared/lib/cx";

export type InputProps = ComponentPropsWithRef<"input"> & { unstyled?: boolean };

export function Input({ className, unstyled = false, ...props }: InputProps) {
  return <input className={cx(!unstyled && "inp", className)} {...props} />;
}
