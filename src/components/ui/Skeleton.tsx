import type { HTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cx("skel", className)} aria-hidden="true" {...props} />;
}
