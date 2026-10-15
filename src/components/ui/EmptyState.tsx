import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export type EmptyStateProps = {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
};

/** Matches reference `emptyState(icon, title, text, action)`. */
export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6 fade">
      <div className="mx-auto h-12 w-12 rounded-full sage grid place-items-center mb-4">
        <Icon name={icon} className="!w-5 !h-5" />
      </div>
      <div className="serif text-2xl">{title}</div>
      <p className="text-sm muted mt-1.5 max-w-sm mx-auto">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
