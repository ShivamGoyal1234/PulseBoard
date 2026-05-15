import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Sparkles,
} from 'lucide-react'
import type {
  PollBuilderForm,
  PollOptionForm,
  PollQuestionForm,
} from './schema'

interface PollPreviewProps {
  data: PollBuilderForm
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function timeUntil(iso: string) {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (Number.isNaN(ms) || ms <= 0) return 'closed'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export function PollPreview({ data }: PollPreviewProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selected, setSelected] = useState<Record<number, number>>({})

  const visibleQuestions = useMemo<PollQuestionForm[]>(
    () =>
      data.questions.filter(
        (q: PollQuestionForm) =>
          q.text.trim() ||
          q.options.some((o: PollOptionForm) => o.text.trim())
      ),
    [data.questions]
  )

  const safeActive = Math.min(activeIdx, Math.max(0, visibleQuestions.length - 1))
  const current = visibleQuestions[safeActive]
  const timeLabel = timeUntil(data.expiresAt)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-brand font-semibold inline-flex items-center gap-1.5">
          <Eye className="size-3" />
          Live preview
        </p>
        <span className="text-[11px] text-txt-tertiary">
          Updates as you edit
        </span>
      </div>

      {/* Browser-style frame */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-bg-surface"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              'linear-gradient(90deg, var(--brand-primary) 0%, #06B6D4 100%)',
          }}
        />

        {/* Chrome */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg-subtle/60">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="w-2 h-2 rounded-full bg-green-400/80" />
          <span className="ml-auto text-[10px] text-txt-tertiary font-mono truncate">
            pulseboard.shivam-goyal.site/p/preview
          </span>
        </div>

        {/* Inner content with brand-tinted gradient */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 80% 0%, var(--brand-primary-bg) 0%, transparent 70%)',
              opacity: 0.55,
            }}
          />

          <div className="relative p-4 sm:p-5 space-y-4">
            {/* Header */}
            <header className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-brand font-semibold">
                  <Sparkles className="size-3" />
                  PulseBoard poll
                </div>
                {timeLabel ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning-text bg-warning-bg border border-warning-border rounded-full px-2 py-0.5">
                    <Clock className="size-3" />
                    {timeLabel}
                  </span>
                ) : null}
              </div>
              <h3 className="text-base font-semibold text-txt-primary leading-snug line-clamp-2">
                {data.title || 'Untitled poll'}
              </h3>
              {data.description ? (
                <p className="text-xs text-txt-secondary line-clamp-2">
                  {data.description}
                </p>
              ) : null}
            </header>

            {/* Step indicator */}
            {visibleQuestions.length > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-txt-tertiary inline-flex items-center gap-1">
                  <ClipboardList className="size-3" />
                  Q{safeActive + 1} of {visibleQuestions.length}
                </span>
                <div className="flex items-center gap-1">
                  {visibleQuestions.map((_q: PollQuestionForm, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Preview question ${i + 1}`}
                      className={`transition-all rounded-full ${
                        i === safeActive
                          ? 'h-1.5 w-5 bg-brand'
                          : 'h-1.5 w-1.5 bg-bg-subtle hover:bg-border-strong'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Question */}
            {current ? (
              <motion.section
                key={safeActive}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                <p className="text-sm font-medium text-txt-primary leading-snug">
                  {current.text || (
                    <span className="text-txt-tertiary italic">
                      Question goes here…
                    </span>
                  )}
                  {current.isRequired ? (
                    <span className="ml-1 text-danger-text" aria-hidden>
                      *
                    </span>
                  ) : null}
                </p>

                <div className="space-y-1.5">
                  {current.options.map((o: PollOptionForm, oi: number) => {
                    const isSel = selected[safeActive] === oi
                    const letter = LETTERS[oi] ?? String(oi + 1)
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() =>
                          setSelected((prev) => ({ ...prev, [safeActive]: oi }))
                        }
                        className={`group relative w-full flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          isSel
                            ? 'border-brand bg-brand-bg/40'
                            : 'border-border bg-bg-elevated hover:border-border-strong'
                        }`}
                      >
                        <span
                          className={`inline-flex h-7 w-7 rounded-lg items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                            isSel
                              ? 'bg-brand text-txt-inverse'
                              : 'bg-bg-subtle text-txt-secondary group-hover:bg-brand-bg group-hover:text-brand-text'
                          }`}
                          aria-hidden
                        >
                          {letter}
                        </span>
                        <span
                          className={`flex-1 text-xs ${
                            isSel ? 'text-brand-text font-medium' : 'text-txt-primary'
                          } truncate`}
                        >
                          {o.text || (
                            <span className="text-txt-tertiary italic">
                              Option {letter}
                            </span>
                          )}
                        </span>
                        {isSel ? (
                          <CheckCircle2
                            className="size-4 text-brand shrink-0"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </motion.section>
            ) : (
              <div className="text-center text-xs text-txt-tertiary py-6 border border-dashed border-border rounded-xl">
                Add a question to see it here
              </div>
            )}

            {/* Submit mock */}
            <button
              type="button"
              disabled
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand text-txt-inverse text-xs font-medium px-3 py-2.5 opacity-90"
              aria-hidden
            >
              {visibleQuestions.length > 1 && safeActive < visibleQuestions.length - 1
                ? 'Next'
                : 'Submit response'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings echo */}
      <div className="flex flex-wrap gap-1.5">
        {data.isAnonymous ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-bg-subtle border border-border text-txt-secondary rounded-full px-2 py-0.5">
            Anonymous
          </span>
        ) : null}
        {data.showResults ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-bg-subtle border border-border text-txt-secondary rounded-full px-2 py-0.5">
            Results after submit
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-bg-subtle border border-border text-txt-secondary rounded-full px-2 py-0.5">
          {data.questions.length} question{data.questions.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
