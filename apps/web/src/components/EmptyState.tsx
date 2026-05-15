import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
      <div className="rounded-full bg-bg-subtle p-3 border border-border">
        <Icon className="text-brand" size={28} aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-txt-primary">{title}</p>
        {description ? (
          <p className="text-sm text-txt-secondary mt-1 max-w-md mx-auto">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
