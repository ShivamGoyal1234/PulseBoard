import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-txt-inverse hover:bg-brand-hover active:scale-[0.98] transition-all shadow-sm',
  ghost:
    'bg-transparent border border-border text-txt-primary hover:bg-bg-subtle',
  danger:
    'bg-danger-bg text-danger-text border border-danger-border hover:brightness-95',
  success:
    'bg-success-bg text-success-text border border-success-border hover:brightness-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'pointer-events-none opacity-70' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner className="text-current" /> : null}
      {children}
    </button>
  )
}
