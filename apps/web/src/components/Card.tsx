import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({
  children,
  hover,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`bg-bg-surface border border-border rounded-lg p-4 ${
        hover
          ? 'hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
