import type { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">
      {children}
    </p>
  )
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold text-txt-primary tracking-tight leading-tight mb-4">
      {children}
    </h2>
  )
}
