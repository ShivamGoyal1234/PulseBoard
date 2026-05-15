import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg'

const widths: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: Size
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog overlay"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${widths[size]} bg-bg-elevated border border-border rounded-xl shadow-lg animate-scale-in`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {title ? (
            <h2 className="text-sm font-semibold text-txt-primary">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-txt-tertiary hover:text-txt-primary hover:bg-bg-subtle"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
