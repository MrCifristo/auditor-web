"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, trailing, className, type = "text", ...props }, ref) => (
    <div className="space-y-1 text-left">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          className={clsx(
            "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            trailing && "pr-11",
            className
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            {trailing}
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
);

Input.displayName = "Input";

