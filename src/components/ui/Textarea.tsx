import type { TextareaHTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cx("inp", className)} {...props} />;
}
