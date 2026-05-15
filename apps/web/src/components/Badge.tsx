import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'live'

const styles: Record<Variant, string> = {
  default: 'bg-bg-subtle text-txt-secondary border border-border',
  success: 'bg-success-bg text-success-text border border-success-border',
  warning: 'bg-warning-bg text-warning-text border border-warning-border',
  danger: 'bg-danger-bg text-danger-text border border-danger-border',
  info: 'bg-info-bg text-info-text border border-info-border',
  live: 'bg-success-bg text-success-text border border-success-border',
}

interface BadgeProps {
  variant?: Variant
  children?: ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  if (variant === 'live') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${styles.live}`}
      >
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="animate-ping absolute h-2 w-2 rounded-full bg-success-text opacity-75" />
          <span className="h-2 w-2 rounded-full bg-success-text" />
        </span>
        Live
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
