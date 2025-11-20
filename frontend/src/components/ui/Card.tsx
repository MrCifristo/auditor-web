import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "w-full rounded-2xl border border-gray-100/70 bg-white p-8 shadow-lg shadow-gray-200/40",
        className
      )}
    >
      {(title || description) && (
        <header className="mb-6 space-y-1 text-center">
          {title && (
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}

