import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...rest },
  ref
) {
  const inputId = id ?? (typeof rest.name === 'string' ? rest.name : undefined)
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-txt-primary"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={`h-9 px-3 bg-bg-input border rounded-lg text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand/20 transition-all ${
          error
            ? 'border-danger-border focus:ring-danger/20'
            : 'border-border'
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger-text mt-1">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-xs text-txt-tertiary mt-1">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
