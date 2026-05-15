import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './Button'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Only active when the path matches exactly (default: startsWith). */
  exact?: boolean
}

const PRIMARY: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/polls/new', label: 'New poll', icon: Plus },
]

const SECONDARY: NavItem[] = [
  { to: '/dashboard?tab=published', label: 'Analytics hub', icon: BarChart3 },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.to.split('?')[0]
  return pathname.startsWith(item.to.split('?')[0])
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? 'bg-brand-bg text-brand-text font-medium'
          : 'text-txt-secondary hover:bg-bg-subtle hover:text-txt-primary'
      }`}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-0.5 rounded-r-full"
          style={{
            background:
              'linear-gradient(180deg, var(--brand-primary) 0%, #06B6D4 100%)',
          }}
        />
      ) : null}
      <Icon size={17} aria-hidden />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-bg-surface border-r border-border flex flex-col h-full min-h-screen">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="relative inline-flex h-9 w-9 rounded-xl items-center justify-center text-txt-inverse text-sm font-bold overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            P
            <span
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 50%)',
              }}
            />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-txt-primary leading-none">
              PulseBoard
            </p>
            <p className="text-[10px] text-txt-tertiary mt-0.5">Real-time polls</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-txt-tertiary">
            Workspace
          </p>
          <div className="space-y-0.5">
            {PRIMARY.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(location.pathname, item)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-txt-tertiary">
            Insights
          </p>
          <div className="space-y-0.5">
            {SECONDARY.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(location.pathname, item)}
              />
            ))}
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-txt-secondary hover:bg-bg-subtle hover:text-txt-primary transition-colors"
              aria-label="Settings"
            >
              <Settings size={17} />
              <span className="truncate">Settings</span>
              <span className="ml-auto text-[10px] text-txt-tertiary">
                Soon
              </span>
            </button>
          </div>
        </div>

        {/* Upgrade tease */}
        <div className="px-1 pt-2">
          <div
            className="relative overflow-hidden rounded-xl border border-border p-3.5"
            style={{
              background:
                'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 80%)',
            }}
          >
            <div className="flex items-start gap-2.5">
              <span className="inline-flex h-7 w-7 rounded-lg bg-brand text-txt-inverse items-center justify-center shrink-0">
                <Sparkles size={14} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-txt-primary">
                  Unlock AI insights
                </p>
                <p className="text-[11px] text-txt-secondary leading-relaxed mt-0.5">
                  Get GPT-powered summaries of every poll.
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {user ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-bg-subtle">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="h-9 w-9 rounded-full bg-brand-bg text-brand-text border border-border flex items-center justify-center text-xs font-semibold">
                {initials(user.name)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-txt-primary truncate leading-none">
                {user.name}
              </p>
              <p className="text-[11px] text-txt-tertiary truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => void logout()}
          aria-label="Sign out"
        >
          <LogOut size={14} />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
