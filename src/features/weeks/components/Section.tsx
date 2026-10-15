import type { ReactNode } from "react";
import { cx } from "@/shared/lib/cx";

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(className)}>
      <h2 className="text-xs font-medium muted uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
