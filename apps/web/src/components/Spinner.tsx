import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-brand ${className}`}
      size={18}
      aria-label={label}
      role="status"
    />
  )
}
