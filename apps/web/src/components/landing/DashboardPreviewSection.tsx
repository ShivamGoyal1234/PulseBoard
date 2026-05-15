import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  BarChart3,
  LayoutDashboard,
  List,
  Sparkles,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'
import { LandingContain } from './LandingShell'

const VELOCITY = [
  { t: '09:00', v: 4 },
  { t: '10:00', v: 8 },
  { t: '11:00', v: 14 },
  { t: '12:00', v: 22 },
  { t: '13:00', v: 19 },
  { t: '14:00', v: 28 },
  { t: '15:00', v: 36 },
  { t: '16:00', v: 41 },
  { t: '17:00', v: 33 },
  { t: '18:00', v: 48 },
]

const OPTION_BARS = [
  { label: 'Ship more features', pct: 64, count: 412 },
  { label: 'Improve reliability', pct: 28, count: 187 },
  { label: 'Make the app faster', pct: 12, count: 96 },
]

const COMPLETION_DATA = [
  { name: 'Completed', value: 84 },
  { name: 'Dropped', value: 16 },
]

function MetricCard({
  label,
  value,
  trend,
  delay,
  live,
}: {
  label: string
  value: string
  trend?: string
  delay: number
  live?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-xl border border-border bg-bg-elevated p-3.5"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[10px] text-txt-tertiary uppercase tracking-wider">
          {label}
        </p>
        {live ? (
          <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-text" />
          </span>
        ) : null}
      </div>
      <p className="text-xl font-semibold text-txt-primary tabular-nums">
        {value}
      </p>
      {trend ? (
        <p className="text-[11px] text-success-text mt-0.5 inline-flex items-center gap-1">
          <TrendingUp className="size-3" />
          {trend}
        </p>
      ) : null}
    </motion.div>
  )
}

export function DashboardPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const t = tokens[theme]

  return (
    <section
      ref={sectionRef}
      className="relative z-10 pb-16 md:pb-24"
      aria-label="Dashboard preview"
    >
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-2xl border border-border bg-bg-surface overflow-hidden"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-subtle/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <div className="flex-1 flex justify-center px-2 min-w-0">
              <span className="text-txt-tertiary text-xs truncate font-mono">
                pulseboard.shivam-goyal.site/dashboard
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row min-h-[420px]">
            {/* Sidebar */}
            <aside className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-border bg-bg-page/60 p-4 flex md:flex-col gap-3 md:gap-0">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <span className="inline-flex h-8 w-8 rounded-md bg-brand items-center justify-center text-txt-inverse text-xs font-bold">
                  P
                </span>
                <span className="font-semibold text-sm text-txt-primary">
                  PulseBoard
                </span>
              </div>
              <nav className="flex md:flex-col gap-1 text-xs overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-brand-bg text-brand-text font-medium whitespace-nowrap">
                  <LayoutDashboard className="size-4 shrink-0" aria-hidden />
                  Dashboard
                </span>
                <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-txt-secondary whitespace-nowrap">
                  <BarChart3 className="size-4 shrink-0" aria-hidden />
                  Analytics
                </span>
                <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-txt-secondary whitespace-nowrap">
                  <List className="size-4 shrink-0" aria-hidden />
                  My polls
                </span>
                <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-txt-secondary whitespace-nowrap">
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  AI insights
                </span>
                <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-txt-secondary whitespace-nowrap">
                  <Settings className="size-4 shrink-0" aria-hidden />
                  Settings
                </span>
              </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0 p-4 sm:p-5 space-y-4 bg-bg-surface">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-txt-primary">
                    Q4 Team priorities
                  </h3>
                  <p className="text-xs text-txt-tertiary mt-0.5">
                    Updated in real-time
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-success-bg text-success-text px-2 py-1 rounded-full border border-success-border">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-text" />
                  </span>
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                  label="Total responses"
                  value="1,284"
                  trend="+12 last min"
                  delay={0.1}
                  live
                />
                <MetricCard
                  label="Completion rate"
                  value="84%"
                  trend="+2%"
                  delay={0.2}
                />
                <MetricCard
                  label="Health score"
                  value="92"
                  trend="Healthy"
                  delay={0.3}
                />
                <MetricCard
                  label="Active polls"
                  value="3"
                  delay={0.4}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-3">
                {/* Velocity area chart */}
                <div
                  className="lg:col-span-2 rounded-xl border border-border bg-bg-elevated p-3.5"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-txt-primary">
                      Response velocity
                    </p>
                    <p className="text-[11px] text-success-text inline-flex items-center gap-1">
                      <TrendingUp className="size-3" />
                      Trending up
                    </p>
                  </div>
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={VELOCITY}>
                        <defs>
                          <linearGradient
                            id="preview-area"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={t.chart[0]}
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="100%"
                              stopColor={t.chart[0]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          contentStyle={{
                            background: t.bgElevated,
                            border: `1px solid ${t.borderDefault}`,
                            borderRadius: 8,
                            fontSize: 11,
                            color: t.textPrimary,
                          }}
                          labelStyle={{ color: t.textTertiary }}
                        />
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={t.chart[0]}
                          strokeWidth={2.5}
                          fill="url(#preview-area)"
                          animationDuration={1200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut */}
                <div
                  className="rounded-xl border border-border bg-bg-elevated p-3.5 flex flex-col"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <p className="text-xs font-semibold text-txt-primary mb-2">
                    Completion
                  </p>
                  <div className="relative flex-1 min-h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={COMPLETION_DATA}
                          dataKey="value"
                          innerRadius="68%"
                          outerRadius="100%"
                          stroke="none"
                          paddingAngle={2}
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={inView}
                          animationDuration={1100}
                        >
                          <Cell fill={t.chart[0]} />
                          <Cell fill={t.bgSubtle} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-semibold text-txt-primary tabular-nums">
                        84%
                      </p>
                      <p className="text-[10px] text-txt-tertiary">complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option bars */}
              <div
                className="rounded-xl border border-border bg-bg-elevated p-3.5 space-y-2.5"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <p className="text-xs font-semibold text-txt-primary mb-1">
                  Top results — Q1 priorities
                </p>
                {OPTION_BARS.map((opt, idx) => (
                  <div key={opt.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span
                        className={
                          idx === 0
                            ? 'font-medium text-brand-text'
                            : 'text-txt-secondary'
                        }
                      >
                        {opt.label}
                      </span>
                      <span className="text-txt-tertiary tabular-nums">
                        {opt.count} ({opt.pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            idx === 0
                              ? `linear-gradient(90deg, ${t.chart[0]} 0%, ${t.chart[5]} 100%)`
                              : t.chart[0] + 'AA',
                        }}
                        initial={{ width: 0 }}
                        animate={
                          inView ? { width: `${opt.pct}%` } : { width: 0 }
                        }
                        transition={{
                          duration: 1,
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.4 + idx * 0.12,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </LandingContain>
    </section>
  )
}
