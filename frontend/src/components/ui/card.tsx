import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function Card({ title, description, children, actions, className }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className
      )}
    >
      {(title || description || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h2>}
            {description && <p className="text-sm text-gray-500 dark:text-slate-300">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}
