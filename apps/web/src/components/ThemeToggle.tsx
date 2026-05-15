import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-border bg-bg-subtle hover:bg-bg-input text-txt-secondary hover:text-txt-primary transition-all duration-150 active:scale-[0.97]"
    >
      {theme === 'light' ? (
        <Sun size={14} className="text-amber-500" />
      ) : (
        <Moon size={14} className="text-brand" />
      )}
      <span className="text-xs capitalize">{theme}</span>
    </button>
  )
}
