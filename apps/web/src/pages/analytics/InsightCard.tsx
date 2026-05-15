import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { pollsApi } from '../../api/polls'
import { Skeleton } from '../../components/Skeleton'

interface InsightCardProps {
  pollId: string  
  variant?: 'default' | 'hero'
}

function splitInsights(raw: string): string[] {
  if (!raw) return []
  const lines = raw
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    .filter(Boolean)

  if (lines.length === 0) return []
  return lines
}

export function InsightCard({ pollId, variant = 'default' }: InsightCardProps) {
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async (force = false) => {
    setLoading(true)
    try {
      const { insight } = await pollsApi.getInsights(pollId, { force })
      setText(insight)
      if (force) toast.success('Insights refreshed')
    } catch {
      toast.error('Could not load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId])

  const insights = useMemo(() => (text ? splitInsights(text) : []), [text])
  const isHero = variant === 'hero'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-brand/20 ${
        isHero ? 'p-5 sm:p-6' : 'p-4'
      }`}
      style={{
        background:
          'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 55%), radial-gradient(ellipse 60% 100% at 100% 0%, rgba(6,182,212,0.15) 0%, transparent 60%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-50"
        style={{
          background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 60%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 rounded-xl items-center justify-center text-txt-inverse shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={16} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className={`font-semibold text-txt-primary ${isHero ? 'text-base' : 'text-sm'}`}>
                PulseBoard Insights
              </h3>
              <p className="text-[11px] text-txt-tertiary">
                5 takeaways · powered by GPT-4o-mini
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-txt-secondary hover:text-txt-primary rounded-md px-2 py-1 hover:bg-bg-elevated/60 transition-colors"
            aria-label="Regenerate insights"
            onClick={() => void load(true)}
            disabled={loading}
          >
            <RefreshCw
              size={12}
              className={loading ? 'animate-spin' : ''}
              aria-hidden
            />
            Refresh
          </button>
        </div>

        {loading && !insights.length ? (
          <div className="space-y-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-txt-secondary">
            No insights yet. Try refreshing once you have some responses.
          </p>
        ) : insights.length === 1 ? (
          <p className="text-sm text-txt-primary leading-relaxed">
            {insights[0]}
          </p>
        ) : (
          <ol
            className={`grid gap-2.5 ${
              isHero ? 'sm:grid-cols-2' : ''
            }`}
          >
            {insights.slice(0, 5).map((line, idx) => (
              <motion.li
                key={`${idx}-${line.slice(0, 24)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated/70 backdrop-blur-sm px-3 py-2.5"
              >
                <span
                  className="inline-flex h-6 w-6 rounded-lg items-center justify-center text-[11px] font-bold text-txt-inverse shrink-0 mt-0.5"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
                  }}
                  aria-hidden
                >
                  {idx + 1}
                </span>
                <span className="text-sm text-txt-primary leading-snug">
                  {line}
                </span>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
