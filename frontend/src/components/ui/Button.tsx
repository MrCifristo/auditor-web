"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "border border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

export function Button({
  className,
  variant = "primary",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Procesando..." : children}
    </button>
  );
}

