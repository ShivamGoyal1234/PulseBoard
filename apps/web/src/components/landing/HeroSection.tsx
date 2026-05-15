import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '../Button'
import { LandingContain } from './LandingShell'

interface HeroSectionProps {
  onPrimary: () => void
  onDemo: () => void
}

const HERO_OPTIONS = [
  { id: 'ship', label: 'Ship more features', baseCount: 412 },
  { id: 'reli', label: 'Improve reliability', baseCount: 187 },
  { id: 'speed', label: 'Make the app faster', baseCount: 96 },
  { id: 'design', label: 'Better design system', baseCount: 58 },
]

const STATS = [
  { Icon: Users, value: '12,400+', label: 'polls created' },
  { Icon: Activity, value: '2.4M', label: 'responses' },
  { Icon: Zap, value: '<50ms', label: 'live latency' },
  { Icon: CheckCircle2, value: '99.99%', label: 'uptime' },
]

export function HeroSection({ onPrimary, onDemo }: HeroSectionProps) {
  const [vote, setVote] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [flyingPlus, setFlyingPlus] = useState<
    { id: number; left: number; delta: number }[]
  >([])

  // Periodically nudge counts to simulate live responses streaming in.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1400)
    return () => window.clearInterval(id)
  }, [])

  // Pop a floating "+1 +2" indicator alongside the chart on each live tick.
  useEffect(() => {
    if (tick === 0) return
    const id = Date.now()
    const left = 12 + Math.random() * 70
    const delta = Math.random() > 0.7 ? 2 : 1
    setFlyingPlus((arr) => [...arr.slice(-3), { id, left, delta }])
    const t = window.setTimeout(() => {
      setFlyingPlus((arr) => arr.filter((p) => p.id !== id))
    }, 1500)
    return () => window.clearTimeout(t)
  }, [tick])

  const counts = useMemo(() => {
    const drifts = [tick * 2, tick, Math.floor(tick / 2), Math.floor(tick / 3)]
    return HERO_OPTIONS.map((opt, idx) => ({
      ...opt,
      count:
        opt.baseCount +
        drifts[idx] +
        (vote === opt.id ? 1 : 0) +
        (idx === 0 ? Math.floor(tick / 4) : 0),
    }))
  }, [tick, vote])

  const total = counts.reduce((acc, c) => acc + c.count, 0)
  const withPct = counts.map((c) => ({
    ...c,
    pct: total > 0 ? Math.round((c.count / total) * 100) : 0,
  }))
  const winner = withPct.reduce((a, b) => (a.count > b.count ? a : b))

  return (
    <section className="relative overflow-hidden">
      {/* Animated background — grid + gradient orbs */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border-default) 1px, transparent 1px), linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage:
              'radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 80%)',
          }}
        />
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-20 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              'radial-gradient(circle, var(--brand-primary) 0%, transparent 60%)',
          }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute top-10 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-35"
          style={{
            background:
              'radial-gradient(circle, #22D3EE 0%, transparent 60%)',
          }}
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <LandingContain className="pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-bg-elevated/80 backdrop-blur border border-border text-xs font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm"
            >
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success-text" />
              </span>
              <span className="text-txt-secondary">
                Live: {total.toLocaleString()} responses streaming
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-txt-primary mb-5"
            >
              Polls that{' '}
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 60%, #8B5CF6 100%)',
                  }}
                >
                  actually mean
                </span>
                <motion.svg
                  aria-hidden
                  viewBox="0 0 220 12"
                  className="absolute -bottom-2 left-0 w-full h-3 text-brand/60"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  <motion.path
                    d="M2 9 Q 55 1 110 6 T 218 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.svg>
              </span>
              <br />
              something.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-lg text-txt-secondary leading-relaxed max-w-lg mb-9"
            >
              Build a poll in two minutes. Share one link. Watch live analytics,
              fingerprint-verified responses, AI insights, and drop-off funnels —
              all in one beautiful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-3 flex-wrap items-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onPrimary}
                aria-label="Create your first poll"
              >
                Create your first poll
                <ArrowRight size={18} />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={onDemo}
                aria-label="View live demo"
              >
                <Play size={16} />
                View live demo
              </Button>
              <a
                href="#architecture"
                className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border border-border bg-bg-elevated/70 text-txt-secondary hover:text-txt-primary hover:border-border-strong transition-colors"
                aria-label="See architecture"
              >
                <Sparkles className="size-3 text-brand" />
                Built differently — see how
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-xl"
            >
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-bg-elevated/60 backdrop-blur px-3 py-2.5"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 rounded-lg bg-brand-bg items-center justify-center">
                    <s.Icon className="size-4 text-brand-text" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-txt-primary leading-none tabular-nums">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-txt-tertiary truncate">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: interactive live poll widget */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            {/* Floating "+N" indicators */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <AnimatePresence>
                {flyingPlus.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -40 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4 }}
                    className="absolute text-[11px] font-semibold text-success-text bg-success-bg border border-success-border rounded-full px-2 py-0.5"
                    style={{ left: `${p.left}%`, top: '20%' }}
                  >
                    +{p.delta}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div
              className="relative rounded-2xl border border-border bg-bg-elevated overflow-hidden"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-subtle/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                <span className="ml-auto text-[11px] text-txt-tertiary font-mono truncate">
                  pulseboard.shivam-goyal.site/p/team-priorities
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1.5">
                      Q1 · Team poll
                    </p>
                    <h3 className="text-lg font-semibold text-txt-primary">
                      What should we focus on this quarter?
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-success-bg text-success-text px-2 py-1 rounded-full border border-success-border shrink-0">
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-text" />
                    </span>
                    Live
                  </span>
                </div>

                <div className="space-y-2.5">
                  {withPct.map((opt, idx) => {
                    const selected = vote === opt.id
                    const isLeader = opt.id === winner.id
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => setVote(opt.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative w-full text-left rounded-xl border overflow-hidden transition-colors px-3.5 py-3 ${
                          selected
                            ? 'border-brand/60 bg-brand-bg/40'
                            : 'border-border hover:border-border-strong bg-bg-surface'
                        }`}
                        aria-label={`Vote for ${opt.label}`}
                      >
                        {/* Filled bar */}
                        <motion.div
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-xl"
                          style={{
                            background: isLeader
                              ? 'linear-gradient(90deg, var(--brand-primary-bg) 0%, var(--brand-primary-bg) 100%)'
                              : 'var(--bg-subtle)',
                            opacity: isLeader ? 0.85 : 0.7,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${opt.pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.1 + idx * 0.07,
                          }}
                        />
                        <div className="relative flex items-center justify-between gap-3">
                          <span
                            className={`text-sm font-medium truncate ${
                              isLeader
                                ? 'text-brand-text'
                                : 'text-txt-primary'
                            }`}
                          >
                            {opt.label}
                            {selected ? (
                              <span className="ml-2 text-[11px] text-success-text">
                                · your vote
                              </span>
                            ) : null}
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-txt-primary shrink-0 flex items-center gap-2">
                            <motion.span
                              key={`${opt.id}-${opt.pct}`}
                              initial={{ y: -6, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.25 }}
                            >
                              {opt.pct}%
                            </motion.span>
                            <span className="text-[11px] text-txt-tertiary tabular-nums">
                              {opt.count.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Sparkline-ish footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-txt-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3 text-brand" />
                    AI insight: leaders pulling ahead by 9%
                  </span>
                  <span className="inline-flex items-center gap-1 text-success-text">
                    <TrendingUp className="size-3" />
                    +{Math.floor(tick / 2)} last min
                  </span>
                </div>
              </div>
            </div>

            {/* Floating mini-stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="hidden sm:flex absolute -bottom-6 -left-6 z-10 items-center gap-3 rounded-xl border border-border bg-bg-elevated px-3.5 py-2.5"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="relative h-10 w-10 shrink-0">
                <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="var(--bg-subtle)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="var(--brand-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 15 * (1 - 0.84),
                    }}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-txt-primary">
                  84
                </span>
              </div>
              <div>
                <p className="text-[10px] text-txt-tertiary uppercase tracking-wider">
                  Health score
                </p>
                <p className="text-xs font-medium text-success-text">
                  Healthy &middot; high signal
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </LandingContain>
    </section>
  )
}
