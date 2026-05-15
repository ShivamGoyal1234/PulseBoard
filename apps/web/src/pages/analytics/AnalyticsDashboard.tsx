import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Eye,
  PieChart as PieIcon,
  Rocket,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { pollsApi } from '../../api/polls'
import type { Analytics, QuestionStat } from '../../types'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Sidebar } from '../../components/Sidebar'
import { Skeleton } from '../../components/Skeleton'
import { useSocket, type AnalyticsUpdate } from '../../hooks/useSocket'
import { VelocityChart } from './VelocityChart'
import { DropOffFunnel } from './DropOffFunnel'
import { HealthScore } from './HealthScore'
import { InsightCard } from './InsightCard'
import { DLQPanel } from './DLQPanel'
import { LiveBadge } from './LiveBadge'
import { OptionDistributionChart } from './OptionDistributionChart'
import { DonutLegend, OptionDonutChart } from './OptionDonutChart'
import { QuestionComparisonChart } from './QuestionComparisonChart'
import { ResponseSharePie } from './ResponseSharePie'

type ChartView = 'bar' | 'donut'

function useAnimatedCount(target: number) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    if (prev.current === target) return
    const start = prev.current
    const diff = target - start
    const duration = 600
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        prev.current = target
      }
    }
    requestAnimationFrame(tick)
  }, [target])

  return display
}

function mergeAnalytics(
  base: Analytics,
  live: AnalyticsUpdate | null
): Analytics {
  if (!live) return base
  const total = live.totalResponses
  const nextQuestions: QuestionStat[] = base.questionStats.map((q) => {
    const liveOpts = live.questionStats[q.id]
    const options = q.options.map((o) => {
      const count =
        liveOpts && typeof liveOpts[o.id] === 'number'
          ? liveOpts[o.id]
          : o.count
      const percent =
        total > 0 ? Math.round((count / total) * 100) : o.percent
      return { ...o, count, percent }
    })
    return { ...q, options, completionRate: q.completionRate }
  })

  return {
    ...base,
    totalResponses: total,
    questionStats: nextQuestions,
  }
}

interface MetricTileProps {
  label: string
  value: string
  Icon: LucideIcon
  tint: 'brand' | 'success' | 'info' | 'warning'
  pulse?: boolean
}

function MetricTile({ label, value, Icon, tint, pulse }: MetricTileProps) {
  const tints: Record<
    MetricTileProps['tint'],
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-border bg-bg-elevated p-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider text-txt-tertiary">
          {label}
        </p>
        <span
          className={`relative inline-flex h-8 w-8 rounded-xl items-center justify-center ${c.bg} ring-1 ${c.ring}`}
        >
          <Icon className={`size-4 ${c.text}`} aria-hidden />
          {pulse ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-text" />
            </span>
          ) : null}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-txt-primary tabular-nums">
        {value}
      </p>
    </motion.div>
  )
}

export function AnalyticsDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pollId = id!
  const [chartView, setChartView] = useState<ChartView>('bar')
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)

  const { data: poll } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => pollsApi.get(pollId),
  })

  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['analytics', pollId],
    queryFn: () => pollsApi.getAnalytics(pollId),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    enabled: Boolean(pollId),
  })

  const { connected, analytics: live } = useSocket(pollId)

  const merged = useMemo(
    () => (analytics ? mergeAnalytics(analytics, live) : undefined),
    [analytics, live]
  )

  const displayCount = useAnimatedCount(merged?.totalResponses ?? 0)

  const publish = async () => {
    try {
      await pollsApi.publish(pollId)
      toast.success('Results published! Anyone with the link can now view them.')
      void refetch()
    } catch {
      toast.error('Could not publish results')
    }
  }

  if (isLoading || !analytics || !merged) {
    return (
      <div className="min-h-screen bg-bg-page flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-8 space-y-4 max-w-5xl">
          <Skeleton variant="title" />
          <Skeleton variant="chart" />
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  const orderedQuestions = [...merged.questionStats].sort(
    (a, b) => a.order - b.order
  )
  const activeQuestion = orderedQuestions[activeQuestionIdx] ?? orderedQuestions[0]

  return (
    <div className="min-h-screen bg-bg-page flex flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 w-full">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 90% 0%, rgba(6,182,212,0.15) 0%, transparent 60%)',
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
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-txt-tertiary hover:text-txt-secondary inline-flex items-center gap-1 mb-3"
            >
              <ArrowLeft className="size-3.5" /> Back to dashboard
            </button>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-brand font-semibold">
                  Analytics
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="text-2xl sm:text-3xl font-semibold tracking-tight bg-clip-text text-transparent leading-tight"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--txt-primary) 0%, var(--brand-primary) 100%)',
                    }}
                  >
                    {poll?.title ?? 'Poll analytics'}
                  </h1>
                  {poll?.isPublished ? (
                    <Badge variant="info">Published</Badge>
                  ) : (
                    <Badge variant="warning">Draft results</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-txt-secondary">
                  {connected ? (
                    <>
                      <LiveBadge />
                      <span>Streaming live · updates in real-time</span>
                    </>
                  ) : (
                    <span>Offline · using last snapshot</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!poll?.isPublished ? (
                  <Button
                    aria-label="Publish results"
                    onClick={() => void publish()}
                  >
                    <Rocket size={16} />
                    Publish results
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  aria-label="Open respond page"
                  onClick={() => window.open(`/p/${pollId}`, '_blank')}
                >
                  <ExternalLink size={16} />
                  Open live link
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-7">
          {/* Metric tiles */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricTile
              label="Total responses"
              value={displayCount.toLocaleString()}
              Icon={Users}
              tint="brand"
              pulse={connected}
            />
            <MetricTile
              label="Unique respondents"
              value={merged.uniqueRespondents.toLocaleString()}
              Icon={Activity}
              tint="info"
            />
            <MetricTile
              label="Completion rate"
              value={`${merged.completionRate}%`}
              Icon={CheckCircle2}
              tint="success"
            />
            <MetricTile
              label="Health score"
              value={String(merged.healthScore)}
              Icon={Sparkles}
              tint="warning"
            />
          </section>

          <section>
            <InsightCard pollId={pollId} variant="hero" />
          </section>

          <section className="grid grid-cols-12 gap-4 sm:gap-6">
            <Card className="col-span-12 lg:col-span-8 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-txt-primary">
                    Response velocity
                  </h2>
                  <p className="text-xs text-txt-tertiary mt-0.5">
                    Hourly response rate
                  </p>
                </div>
                {connected ? <LiveBadge /> : null}
              </div>
              <VelocityChart data={merged.timeline} height={240} />
            </Card>
            <Card className="col-span-12 lg:col-span-4 p-5 sm:p-6 flex items-center justify-center">
              <HealthScore score={merged.healthScore} />
            </Card>
          </section>

          <section className="grid grid-cols-12 gap-4 sm:gap-6">
            <Card className="col-span-12 lg:col-span-7 p-5 sm:p-6">
              <QuestionComparisonChart questions={orderedQuestions} />
            </Card>
            <Card className="col-span-12 lg:col-span-5 p-5 sm:p-6">
              <ResponseSharePie questions={orderedQuestions} />
            </Card>
          </section>

          <section>
            <Card className="p-5 sm:p-6">
              <DropOffFunnel stats={orderedQuestions} />
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-txt-primary inline-flex items-center gap-2">
                <Eye className="size-4 text-brand" />
                Question deep dive
              </h2>
              <div className="inline-flex rounded-lg p-0.5 bg-bg-subtle border border-border text-xs">
                <button
                  type="button"
                  aria-pressed={chartView === 'bar'}
                  onClick={() => setChartView('bar')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'bar'
                      ? 'bg-bg-elevated text-txt-primary shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  <BarChart3 className="size-3.5" />
                  Bars
                </button>
                <button
                  type="button"
                  aria-pressed={chartView === 'donut'}
                  onClick={() => setChartView('donut')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'donut'
                      ? 'bg-bg-elevated text-txt-primary shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  <PieIcon className="size-3.5" />
                  Donut
                </button>
              </div>
            </div>

            <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-bg-page/85 backdrop-blur border-y border-border">
              <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
                {orderedQuestions.map((q, idx) => {
                  const active = idx === activeQuestionIdx
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setActiveQuestionIdx(idx)}
                      aria-pressed={active}
                      title={q.text}
                      className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
                        active
                          ? 'bg-brand text-txt-inverse border-brand'
                          : 'bg-bg-elevated text-txt-secondary border-border hover:border-border-strong'
                      }`}
                    >
                      <span className="font-semibold">Q{idx + 1}</span>
                      <span className="truncate max-w-[160px] sm:max-w-[220px]">
                        {q.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {activeQuestion ? (
              <QuestionPanel
                question={activeQuestion}
                index={activeQuestionIdx}
                view={chartView}
              />
            ) : null}
          </section>

          <DLQPanel pollId={pollId} />

          <div className="pb-10">
            <Button
              variant="ghost"
              aria-label="Back to dashboard"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function QuestionPanel({
  question,
  index,
  view,
}: {
  question: QuestionStat
  index: number
  view: ChartView
}) {
  const total = question.options.reduce((acc, o) => acc + o.count, 0)
  const max = Math.max(...question.options.map((o) => o.count), 0)
  const winner = max > 0 ? question.options.find((o) => o.count === max) : null

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1">
              Q{index + 1}
              {question.isRequired ? (
                <span className="ml-2 text-danger-text">Required</span>
              ) : null}
            </p>
            <h3 className="text-base sm:text-lg font-semibold text-txt-primary leading-snug">
              {question.text}
            </h3>
            <p className="text-xs text-txt-tertiary mt-1">
              {total.toLocaleString()} responses · {question.completionRate}%
              completion
            </p>
          </div>
          {winner ? (
            <div className="inline-flex items-center gap-2 self-start rounded-xl border border-success-border bg-success-bg px-3 py-1.5">
              <Trophy className="size-3.5 text-success-text" />
              <span className="text-xs">
                <span className="text-success-text font-semibold">
                  Leading:
                </span>{' '}
                <span className="text-txt-primary font-medium">
                  {winner.text}
                </span>{' '}
                <span className="text-success-text font-semibold tabular-nums">
                  · {winner.percent}%
                </span>
              </span>
            </div>
          ) : null}
        </div>

        {view === 'bar' ? (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <OptionDistributionChart options={question.options} />
            </div>
            <div className="col-span-12 lg:col-span-4 lg:border-l lg:border-border lg:pl-6">
              <p className="text-xs font-semibold text-txt-primary mb-3">
                Vote totals
              </p>
              <ul className="space-y-2 text-xs">
                {question.options.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-txt-secondary truncate">
                      {o.text}
                    </span>
                    <span className="text-txt-primary font-medium tabular-nums shrink-0">
                      {o.count.toLocaleString()}{' '}
                      <span className="text-txt-tertiary font-normal">
                        ({o.percent}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <OptionDonutChart
                options={question.options}
                centerLabel={total.toLocaleString()}
                centerSubLabel="votes"
                height={260}
              />
            </div>
            <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-border lg:pl-6">
              <p className="text-xs font-semibold text-txt-primary mb-1">
                Distribution
              </p>
              <DonutLegend options={question.options} />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
