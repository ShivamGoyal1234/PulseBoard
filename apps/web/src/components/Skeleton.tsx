type Variant = 'text' | 'title' | 'avatar' | 'card' | 'chart'

const variantClasses: Record<Variant, string> = {
  text: 'h-4 w-full',
  title: 'h-6 w-48',
  avatar: 'h-10 w-10 rounded-full',
  card: 'h-32 w-full rounded-lg',
  chart: 'h-48 w-full rounded-lg',
}

interface SkeletonProps {
  variant?: Variant
  className?: string
}

export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-bg-subtle rounded skeleton-shimmer ${variantClasses[variant]} ${className}`}
      aria-hidden
    />
  )
}
