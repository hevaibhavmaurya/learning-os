import type { HTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

export type ChipTone = "default" | "v" | "a" | "g" | "d";

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone;
};

const toneClass: Record<ChipTone, string> = {
  default: "",
  v: "chip-v",
  a: "chip-a",
  g: "chip-g",
  d: "chip-d",
};

export function Chip({ tone = "default", className, ...props }: ChipProps) {
  return (
    <span className={cx("chip", toneClass[tone], className)} {...props} />
  );
}
