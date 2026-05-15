import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { pollsApi } from '../../api/polls'
import type { QuestionStat } from '../../types'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { VelocityChart } from '../analytics/VelocityChart'
import { DropOffFunnel } from '../analytics/DropOffFunnel'
import { HealthScore } from '../analytics/HealthScore'
import { OptionDistributionChart } from '../analytics/OptionDistributionChart'
import {
  DonutLegend,
  OptionDonutChart,
} from '../analytics/OptionDonutChart'

function formatCount(n: number) {
  return n.toLocaleString()
}

export function ResultsPage() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['results', id],
    queryFn: () => pollsApi.getResults(id!),
    enabled: Boolean(id),
  })

  const pollTitle = data?.poll?.title
  const pollDesc = data?.poll?.description

  const stats = useMemo(() => {
    if (!data) return null
    const { poll: _p, ...rest } = data
    return rest
  }, [data])

  const share = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page p-8 space-y-4 max-w-6xl mx-auto">
        <Skeleton variant="title" />
        <Skeleton variant="chart" />
        <Skeleton variant="card" />
      </div>
    )
  }

  if (error || !stats || !data?.poll) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-sm text-txt-secondary">
            Results aren&apos;t published yet, or this poll is unavailable.
          </p>
          <Link to="/">
            <Button variant="ghost" className="mt-4">
              ← Back to home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const questionStats = stats.questionStats as QuestionStat[]

  return (
    <main className="min-h-screen bg-bg-page pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 0%, rgba(34,211,238,0.18) 0%, transparent 60%)',
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-bg-elevated/80 backdrop-blur border border-border text-[11px] font-medium px-3 py-1.5 mb-6">
              <CheckCircle2 className="size-3.5 text-success-text" />
              <span className="text-txt-secondary">Published results</span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-semibold tracking-tight bg-clip-text text-transparent mb-3 leading-[1.1]"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--txt-primary) 0%, var(--brand-primary) 100%)',
              }}
            >
              {pollTitle}
            </h1>
            {pollDesc ? (
              <p className="text-base text-txt-secondary max-w-2xl mx-auto leading-relaxed mb-6">
                {pollDesc}
              </p>
            ) : null}

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="inline-flex flex-col items-center gap-1 mb-6"
            >
              <p
                className="text-6xl sm:text-7xl font-bold tabular-nums bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 60%, #8B5CF6 100%)',
                }}
              >
                {formatCount(stats.totalResponses)}
              </p>
              <p className="text-sm text-txt-secondary">total responses</p>
            </motion.div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="primary"
                onClick={() => void share()}
                aria-label="Share results link"
              >
                <Share2 size={16} />
                Share results
              </Button>
              <Link to="/register">
                <Button variant="ghost" aria-label="Create your own poll">
                  Create your own poll
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 relative space-y-8 sm:space-y-10">
        {/* Top stat row */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <StatTile
            label="Total responses"
            value={formatCount(stats.totalResponses)}
            Icon={Users}
          />
          <StatTile
            label="Unique respondents"
            value={formatCount(stats.uniqueRespondents)}
            Icon={Activity}
          />
          <StatTile
            label="Completion"
            value={`${stats.completionRate}%`}
            Icon={CheckCircle2}
          />
          <StatTile
            label="Health"
            value={String(stats.healthScore)}
            Icon={Sparkles}
          />
        </motion.section>

        {/* Velocity + Health */}
        <section className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-txt-primary">
                  Response timeline
                </h2>
                <p className="text-xs text-txt-tertiary mt-0.5">
                  When responses came in
                </p>
              </div>
            </div>
            <VelocityChart data={stats.timeline} height={240} />
          </Card>
          <Card className="p-5 sm:p-6 flex items-center justify-center">
            <HealthScore score={stats.healthScore} />
          </Card>
        </section>

        {/* Drop-off funnel */}
        <Card className="p-5 sm:p-6">
          <DropOffFunnel stats={questionStats} />
        </Card>

        {/* Per-question deep dive */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-primary">
              Question breakdown
            </h2>
            <p className="text-xs text-txt-tertiary">
              {questionStats.length} questions
            </p>
          </div>

          <div className="space-y-5">
            {questionStats.map((q, idx) => {
              const total = q.options.reduce((acc, o) => acc + o.count, 0)
              const max = Math.max(...q.options.map((o) => o.count), 0)
              const winner =
                max > 0 ? q.options.find((o) => o.count === max) : null

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                >
                  <Card className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1">
                          Q{idx + 1}
                        </p>
                        <h3 className="text-base sm:text-lg font-semibold text-txt-primary leading-snug">
                          {q.text}
                        </h3>
                        <p className="text-xs text-txt-tertiary mt-1">
                          {formatCount(total)} responses · {q.completionRate}%
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

                    <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6">
                      <div>
                        <OptionDistributionChart options={q.options} />
                      </div>
                      <div className="lg:border-l lg:border-border lg:pl-6">
                        <OptionDonutChart
                          options={q.options}
                          centerLabel={formatCount(total)}
                          centerSubLabel="votes"
                          height={200}
                        />
                        <DonutLegend options={q.options} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pt-2">
          <div
            className="relative overflow-hidden rounded-2xl p-8 text-center"
            style={{
              background:
                'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 50%), linear-gradient(135deg, transparent 50%, rgba(6,182,212,0.12) 100%)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 className="text-xl font-semibold text-txt-primary mb-1">
              Want to run your own poll?
            </h3>
            <p className="text-sm text-txt-secondary mb-4">
              Build in 2 minutes. Free forever for personal polls.
            </p>
            <Link to="/register">
              <Button aria-label="Create your own poll">
                Create your own poll
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatTile({
  label,
  value,
  Icon,
}: {
  label: string
  value: string
  Icon: LucideIcon
}) {
  return (
    <div
      className="rounded-2xl border border-border bg-bg-elevated p-4 backdrop-blur"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-txt-tertiary">
          {label}
        </p>
        <span className="inline-flex h-7 w-7 rounded-lg bg-brand-bg items-center justify-center">
          <Icon className="size-3.5 text-brand-text" aria-hidden />
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-txt-primary tabular-nums">
        {value}
      </p>
    </div>
  )
}
