import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

function toPascalCase(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export type IconName = string;

export type IconProps = LucideProps & {
  /** Lucide kebab-case name, matching reference `ic(name)`. */
  name: IconName;
};

/**
 * Thin wrapper around lucide-react icons by kebab-case name string,
 * matching reference `ic(n, c)` defaults (16 / stroke 1.75).
 */
export function Icon({
  name,
  className = "",
  size = 16,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  const key = toPascalCase(name);
  const Comp = (LucideIcons as unknown as Record<
    string,
    ComponentType<LucideProps> | undefined
  >)[key];

  if (!Comp) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] unknown lucide icon: ${name}`);
    }
    return null;
  }

  return (
    <Comp
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    />
  );
}
