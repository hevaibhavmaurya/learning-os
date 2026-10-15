import type {
  ButtonHTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
} from "react";
import { cx } from "@/shared/lib/cx";

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
};

/** Single tab control — use `aria-selected` matching reference `.tab`. */
export function Tab({
  selected = false,
  className,
  type = "button",
  role = "tab",
  ...props
}: TabProps) {
  return (
    <button
      type={type}
      role={role}
      aria-selected={selected}
      className={cx("tab", className)}
      {...props}
    />
  );
}

export type TabListProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
};

export function TabList({
  children,
  className,
  onKeyDown,
  ...props
}: TabListProps) {
  return (
    <div
      role="tablist"
      className={cx("border-b line flex", className)}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}
