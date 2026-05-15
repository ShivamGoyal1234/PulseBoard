import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './Button'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function Navbar() {
  const { user, logout, isAuthed } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (!open) return
    const update = () => {
      const r = btnRef.current?.getBoundingClientRect()
      if (r) {
        setMenuPos({ top: r.bottom + 8, left: r.right - 200, width: 200 })
      }
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      const menu = document.getElementById('user-menu-popover')
      if (menu?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const active = (path: string) =>
    location.pathname === path ? 'border-b-2 border-brand text-brand' : ''

  return (
    <header className="bg-bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="pulseBoard home"
          >
            <span className="inline-flex h-8 w-8 rounded-md bg-brand items-center justify-center text-txt-inverse text-sm font-bold">
              P
            </span>
            <span className="font-semibold text-txt-primary">pulseBoard</span>
          </Link>
          {isAuthed() ? (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 pb-0.5 ${active('/dashboard')}`}
              >
                <LayoutDashboard size={16} aria-hidden />
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 pb-0.5 ${active('/dashboard')}`}
              >
                My Polls
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {isAuthed() && user ? (
            <div className="relative">
              <button
                type="button"
                ref={btnRef}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-bg-subtle border border-transparent hover:border-border transition-colors"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="User menu"
                onClick={() => setOpen((v) => !v)}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-brand-bg text-brand-text border border-border flex items-center justify-center text-xs font-semibold">
                    {initials(user.name)}
                  </span>
                )}
                <span className="hidden sm:inline text-sm text-txt-secondary max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={16} className="text-txt-tertiary" />
              </button>
              {open
                ? createPortal(
                    <div
                      id="user-menu-popover"
                      className="fixed z-[100] bg-bg-elevated border border-border rounded-lg shadow-lg py-1 text-sm"
                      style={{
                        top: menuPos.top,
                        left: menuPos.left,
                        minWidth: menuPos.width,
                      }}
                      role="menu"
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-txt-primary"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        My Dashboard
                      </Link>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-txt-primary text-left"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false)
                          void logout()
                        }}
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                      <div className="px-3 py-2 text-txt-tertiary text-xs flex items-center gap-2">
                        <Settings size={14} />
                        Settings coming soon
                      </div>
                    </div>,
                    document.body
                  )
                : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" aria-label="Log in">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" aria-label="Create account">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
