import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/**
 * Floating, fixed-position theme switcher. Used on app pages (Dashboard,
 * PollBuilder, AnalyticsDashboard) that hide the top Navbar because they
 * already have a sidebar.
 */
export function FloatingThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-elevated text-txt-secondary hover:text-txt-primary transition-all hover:scale-105 active:scale-95"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, var(--brand-primary-bg), transparent 70%)',
          }}
        />
        <span className="relative inline-flex items-center justify-center">
          {isDark ? (
            <Moon size={16} className="text-brand" />
          ) : (
            <Sun size={16} className="text-amber-500" />
          )}
        </span>
      </button>
    </div>
  )
}
