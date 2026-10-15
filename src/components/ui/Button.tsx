import type { ComponentPropsWithRef } from "react";
import { cx } from "@/shared/lib/cx";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  default: "",
  primary: "btn-p",
  ghost: "btn-g",
  danger: "btn-danger",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function Button({
  variant = "default",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "btn",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
