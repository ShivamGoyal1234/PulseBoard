import type { ReactNode } from 'react'

const LANDING_CONTAINER =
  'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'

export function LandingContain({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`${LANDING_CONTAINER} ${className}`}>{children}</div>
}
