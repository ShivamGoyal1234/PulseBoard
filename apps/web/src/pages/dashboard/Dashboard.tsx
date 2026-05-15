import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  ListChecks,
  Menu,
  Plus,
  Rocket,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { pollsApi } from '../../api/polls'
import type { Poll } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'
import { Sidebar } from '../../components/Sidebar'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { PollCard } from './PollCard'

type Tab = 'all' | 'active' | 'closed' | 'published'
type SortKey = 'recent' | 'responses' | 'expiring'

function firstName(name?: string) {
  if (!name) return 'there'
  return name.trim().split(/\s+/)[0]
}

function isExpired(poll: Poll) {
  return new Date(poll.expiresAt) < new Date() || !poll.isActive
}

function StatTile({
  label,
  value,
  Icon,
  tint,
  hint,
}: {
  label: string
  value: string | number
  Icon: LucideIcon
  tint: 'brand' | 'success' | 'info' | 'warning'
  hint?: string
}) {
  const tints: Record<
    typeof tint,
    { bg: string; text: string; ring: string }
  > = {
    brand: {
      bg: 'bg-brand-bg',
      text: 'text-brand-text',
      ring: 'ring-brand/15',
    },
    success: {
      bg: 'bg-success-bg',
      text: 'text-success-text',
      ring: 'ring-success-border',
    },
    info: {
      bg: 'bg-info-bg',
      text: 'text-info-text',
      ring: 'ring-info-border',
    },
    warning: {
      bg: 'bg-warning-bg',
      text: 'text-warning-text',
      ring: 'ring-warning-border',
    },
  }
  const c = tints[tint]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-bg-elevated p-4 transition-all hover:border-border-strong"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider text-txt-tertiary">
          {label}
        </p>
        <span
          className={`inline-flex h-8 w-8 rounded-xl items-center justify-center ${c.bg} ring-1 ${c.ring}`}
        >
          <Icon className={`size-4 ${c.text}`} aria-hidden />
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-txt-primary tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="text-[11px] text-txt-tertiary mt-1">{hint}</p>
      ) : null}
    </motion.div>
  )
}

const VALID_TABS: Tab[] = ['all', 'active', 'closed', 'published']

export function Dashboard() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const initialTab = (params.get('tab') as Tab) ?? 'all'
  const [tab, setTabState] = useState<Tab>(
    VALID_TABS.includes(initialTab) ? initialTab : 'all'
  )
  const [sort, setSort] = useState<SortKey>('recent')
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  // Keep ?tab=… in the URL in sync with the active filter pill.
  const setTab = (next: Tab) => {
    setTabState(next)
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  // Respond to external URL changes (e.g. sidebar nav click).
  useEffect(() => {
    const t = params.get('tab') as Tab | null
    if (t && VALID_TABS.includes(t) && t !== tab) {
      setTabState(t)
    } else if (!t && tab !== 'all') {
      setTabState('all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['polls'],
    queryFn: pollsApi.list,
  })

  const polls = data ?? []

  const counts = useMemo(() => {
    const active = polls.filter((p) => !isExpired(p)).length
    const closed = polls.filter((p) => isExpired(p)).length
    const published = polls.filter((p) => p.isPublished).length
    return {
      all: polls.length,
      active,
      closed,
      published,
    }
  }, [polls])

  const totalResponses = useMemo(
    () => polls.reduce((acc, p) => acc + (p.responseCount ?? 0), 0),
    [polls]
  )

  const filtered = useMemo(() => {
    let list = polls.filter((p) => {
      if (tab === 'active') return !isExpired(p)
      if (tab === 'closed') return isExpired(p)
      if (tab === 'published') return p.isPublished
      return true
    })

    const q = search.trim().toLowerCase()
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q))

    list = [...list]
    if (sort === 'recent') {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (sort === 'responses') {
      list.sort((a, b) => (b.responseCount ?? 0) - (a.responseCount ?? 0))
    } else if (sort === 'expiring') {
      list.sort(
        (a, b) =>
          new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
      )
    }
    return list
  }, [polls, tab, search, sort])

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'closed', label: 'Closed', count: counts.closed },
    { id: 'published', label: 'Published', count: counts.published },
  ]

  return (
    <div className="min-h-screen bg-bg-page flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-surface">
          <button
            type="button"
            aria-label="Open navigation"
            className="p-2 rounded-md border border-border bg-bg-elevated"
            onClick={() => setMobileNav((v) => !v)}
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-medium text-txt-primary">Dashboard</span>
        </div>
        {mobileNav ? (
          <div className="md:hidden border-b border-border bg-bg-surface px-4 py-3">
            <Sidebar />
          </div>
        ) : null}

        <main className="flex-1 w-full">
          {/* Greeting hero */}
          <section className="relative overflow-hidden border-b border-border">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 90% 0%, rgba(6,182,212,0.18) 0%, transparent 60%)',
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--border-default) 1px, transparent 1px), linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)',
                backgroundSize: '52px 52px',
                maskImage:
                  'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
              }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-2">
                    Welcome back
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold tracking-tight bg-clip-text text-transparent leading-tight"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--txt-primary) 0%, var(--brand-primary) 100%)',
                    }}
                  >
                    Hello, {firstName(user?.name)} 👋
                  </h1>
                  <p className="text-sm text-txt-secondary mt-2 max-w-md">
                    Here&apos;s what&apos;s happening across your polls today.
                  </p>
                </motion.div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/polls/new">
                    <Button aria-label="Create new poll">
                      <Plus size={16} />
                      New poll
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Body */}
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Stat tiles */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile
                label="Total polls"
                value={counts.all}
                Icon={ListChecks}
                tint="brand"
              />
              <StatTile
                label="Active"
                value={counts.active}
                Icon={Activity}
                tint="success"
                hint={
                  counts.active > 0 ? 'Collecting responses' : 'No live polls'
                }
              />
              <StatTile
                label="Total responses"
                value={totalResponses.toLocaleString()}
                Icon={BarChart3}
                tint="info"
              />
              <StatTile
                label="Published"
                value={counts.published}
                Icon={Rocket}
                tint="warning"
                hint="Public results live"
              />
            </section>

            {/* Toolbar */}
            <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 order-2 lg:order-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={tab === t.id}
                    aria-label={`Filter ${t.label}`}
                    onClick={() => setTab(t.id)}
                    className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                      tab === t.id
                        ? 'bg-brand text-txt-inverse border-brand shadow-sm'
                        : 'bg-bg-elevated text-txt-secondary border-border hover:border-border-strong hover:text-txt-primary'
                    }`}
                  >
                    {t.label}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full tabular-nums ${
                        tab === t.id
                          ? 'bg-white/20 text-txt-inverse'
                          : 'bg-bg-subtle text-txt-secondary'
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 order-1 lg:order-2">
                <div className="relative flex-1 lg:flex-initial">
                  <Search
                    className="size-4 text-txt-tertiary absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search polls…"
                    aria-label="Search polls"
                    className="w-full lg:w-64 pl-9 pr-3 h-9 text-sm rounded-lg border border-border bg-bg-elevated text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="relative inline-flex items-center">
                  <SlidersHorizontal
                    className="size-4 text-txt-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden
                  />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort polls"
                    className="appearance-none pl-9 pr-7 h-9 text-sm rounded-lg border border-border bg-bg-elevated text-txt-primary focus:outline-none focus:border-brand"
                  >
                    <option value="recent">Most recent</option>
                    <option value="responses">Most responses</option>
                    <option value="expiring">Expiring soon</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-danger-border bg-danger-bg p-6 text-center">
                <p className="text-sm text-danger-text font-medium">
                  Could not load polls
                </p>
                <p className="text-xs text-danger-text/80 mt-1">
                  Try refreshing the page.
                </p>
              </div>
            ) : filtered.length === 0 && polls.length === 0 ? (
              <div className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
                <div className="relative px-8 py-12 text-center">
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 opacity-30"
                    style={{
                      background:
                        'radial-gradient(ellipse 60% 60% at 50% 0%, var(--brand-primary-bg) 0%, transparent 70%)',
                    }}
                  />
                  <div className="inline-flex h-14 w-14 rounded-2xl bg-brand-bg items-center justify-center mb-4">
                    <Sparkles className="size-6 text-brand-text" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-txt-primary mb-1">
                    Create your first poll
                  </h3>
                  <p className="text-sm text-txt-secondary mb-5 max-w-md mx-auto">
                    Build a poll in 2 minutes, share one link, and watch
                    responses flow into your dashboard in real-time.
                  </p>
                  <Link to="/polls/new">
                    <Button aria-label="Create poll">
                      <Plus size={16} />
                      Create poll
                    </Button>
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching polls"
                description="Try a different filter or search term."
                action={
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch('')
                      setTab('all')
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <section className="space-y-3">
                <div className="flex items-center justify-between text-xs text-txt-tertiary">
                  <span>
                    Showing{' '}
                    <span className="text-txt-primary font-medium">
                      {filtered.length}
                    </span>{' '}
                    poll{filtered.length === 1 ? '' : 's'}
                  </span>
                  <span className="hidden sm:inline">
                    {totalResponses.toLocaleString()} total responses
                  </span>
                </div>
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {filtered.map((p: Poll, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                    >
                      <PollCard
                        poll={p}
                        onDeleted={() => void refetch()}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
