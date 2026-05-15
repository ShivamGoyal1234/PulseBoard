import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Clock,
  Share2,
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { LandingContain } from './LandingShell'

const SPARK_DATA = [
  { x: 1, y: 8 },
  { x: 2, y: 14 },
  { x: 3, y: 18 },
  { x: 4, y: 12 },
  { x: 5, y: 22 },
  { x: 6, y: 29 },
  { x: 7, y: 24 },
  { x: 8, y: 38 },
  { x: 9, y: 44 },
  { x: 10, y: 41 },
  { x: 11, y: 56 },
  { x: 12, y: 62 },
]

function FeatureCard({
  className = '',
  delay = 0,
  children,
}: {
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-bg-surface p-5 transition-all hover:border-border-strong ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Hover gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(600px circle at 30% 0%, var(--brand-primary-bg), transparent 50%)',
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.25 })
  const { theme } = useTheme()
  const t = tokens[theme]

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 scroll-mt-24"
    >
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-10"
        >
          <SectionLabel>Features</SectionLabel>
          <SectionHeading>
            Everything you need to run serious polls
          </SectionHeading>
          <p className="text-base text-txt-secondary leading-relaxed">
            A modern polling stack — live analytics, fraud-proof responses, AI
            insights, and a public results page that just works.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* Spotlight: real-time analytics with live bar chart */}
          <FeatureCard className="md:col-span-2 md:row-span-2 min-h-[280px]" delay={0}>
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-bg text-brand-text text-[11px] font-semibold px-2.5 py-1 border border-brand/15 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Live
                </div>
                <h3 className="text-xl font-semibold text-txt-primary mb-2">
                  Real-time analytics that move
                </h3>
                <p className="text-sm text-txt-secondary leading-relaxed">
                  Responses stream through Kafka → Redis → WebSocket. Watch
                  charts update without ever hitting refresh. Sub-50ms latency,
                  even under load.
                </p>
              </div>
              <span className="hidden sm:inline-flex h-10 w-10 rounded-xl bg-brand-bg items-center justify-center shrink-0">
                <Zap className="size-5 text-brand-text" aria-hidden />
              </span>
            </div>

            <div className="mt-5 relative">
              <div className="rounded-xl border border-border bg-bg-elevated p-3.5">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-semibold text-txt-primary">
                    Hourly response velocity
                  </span>
                  <span className="text-success-text inline-flex items-center gap-1">
                    <ArrowUpRight className="size-3" /> +48% vs yesterday
                  </span>
                </div>
                <div style={{ height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SPARK_DATA}>
                      <defs>
                        <linearGradient
                          id="feat-bar"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={t.chart[0]} stopOpacity={1} />
                          <stop offset="100%" stopColor={t.chart[0]} stopOpacity={0.35} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        cursor={{ fill: t.bgSubtle, opacity: 0.4 }}
                        contentStyle={{
                          background: t.bgElevated,
                          border: `1px solid ${t.borderDefault}`,
                          borderRadius: 8,
                          fontSize: 11,
                          color: t.textPrimary,
                        }}
                      />
                      <Bar
                        dataKey="y"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={inView}
                        animationDuration={1100}
                      >
                        {SPARK_DATA.map((_row, i) => (
                          <Cell
                            key={i}
                            fill={
                              i === SPARK_DATA.length - 1
                                ? t.chart[5]
                                : 'url(#feat-bar)'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard delay={0.05}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-success-bg items-center justify-center mb-4">
              <Shield className="size-5 text-success-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              Fraud-proof responses
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Browser fingerprinting detects duplicates — no login required for
              anonymous polls.
            </p>
          </FeatureCard>

          <FeatureCard delay={0.1}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-warning-bg items-center justify-center mb-4">
              <Sparkles className="size-5 text-warning-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              AI-powered insights
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              GPT-4o-mini turns aggregated responses into 2–3 sentences of
              specific, actionable findings.
            </p>
          </FeatureCard>

          <FeatureCard delay={0.15}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-info-bg items-center justify-center mb-4">
              <TrendingDown className="size-5 text-info-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              Drop-off detection
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              See exactly which question loses respondents. Fix poll design with
              data, not guesswork.
            </p>
          </FeatureCard>

          <FeatureCard delay={0.2}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-danger-bg items-center justify-center mb-4">
              <Clock className="size-5 text-danger-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              Smart expiry &amp; close
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Set a deadline or close anytime. We preserve all data — publish
              results when you&apos;re ready.
            </p>
          </FeatureCard>

          <FeatureCard delay={0.25}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-success-bg items-center justify-center mb-4">
              <Share2 className="size-5 text-success-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              One link, one click publish
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              The same poll URL becomes the public results page after you
              publish. Nothing to copy, nothing to migrate.
            </p>
          </FeatureCard>

          <FeatureCard delay={0.3}>
            <span className="inline-flex h-10 w-10 rounded-xl bg-brand-bg items-center justify-center mb-4">
              <Activity className="size-5 text-brand-text" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-txt-primary mb-1.5">
              Poll health score
            </h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              A 0–100 score blending completion, uniqueness and velocity. Know
              if a poll needs attention at a glance.
            </p>
          </FeatureCard>
        </div>
      </LandingContain>
    </section>
  )
}
