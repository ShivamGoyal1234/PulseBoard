import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { pollsApi } from '../../api/polls'
import { Spinner } from '../../components/Spinner'

interface AiPollGeneratorProps {
  onApply: (draft: {
    title: string
    description?: string
    questions: {
      text: string
      isRequired: boolean
      options: { text: string }[]
    }[]
  }) => void
}

const SUGGESTIONS = [
  'Engineering team retro for Q4',
  'Customer NPS for a SaaS tool',
  'Event planning — pick the team offsite venue',
  'Product priorities for the next sprint',
]

export function AiPollGenerator({ onApply }: AiPollGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (text: string) => {
    const cleaned = text.trim()
    if (cleaned.length < 4) {
      toast.error('Describe your poll in a few words first')
      return
    }
    setBusy(true)
    try {
      const draft = await pollsApi.generateDraft(cleaned)
      onApply(draft)
      toast.success('Draft ready — review and edit before publishing')
    } catch {
      toast.error('Could not generate a draft. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-brand/20 p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 55%), radial-gradient(ellipse 60% 100% at 100% 0%, rgba(6,182,212,0.18) 0%, transparent 60%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Decorative orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full blur-3xl opacity-50"
        style={{
          background:
            'radial-gradient(circle, var(--brand-primary) 0%, transparent 60%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 rounded-xl items-center justify-center text-txt-inverse shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Wand2 size={16} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-txt-primary leading-tight">
                Describe your poll, we&apos;ll draft it
              </h2>
              <p className="text-[11px] text-txt-tertiary mt-0.5 inline-flex items-center gap-1">
                <Sparkles className="size-3 text-brand" />
                Powered by GPT-4o-mini · always editable after
              </p>
            </div>
          </div>
        </div>

        <motion.div
          role="group"
          aria-label="AI poll generator"
          className="space-y-3"
        >
          <label className="sr-only" htmlFor="ai-prompt">
            Describe your poll
          </label>
          <div className="relative">
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void submit(prompt)
                }
              }}
              placeholder="e.g. Run a team retro for the engineering squad — what went well, what didn't, and what to try next sprint"
              maxLength={500}
              rows={3}
              disabled={busy}
              className="w-full min-h-[88px] px-3.5 py-2.5 pr-32 bg-bg-elevated/80 backdrop-blur border border-border rounded-xl text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand/20"
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
              <span className="text-[10px] text-txt-tertiary tabular-nums hidden sm:inline">
                {prompt.length}/500
              </span>
              <button
                type="button"
                disabled={busy || prompt.trim().length < 4}
                aria-label="Generate poll"
                onClick={() => void submit(prompt)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-txt-inverse disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {busy ? (
                  <>
                    <Spinner className="text-current" />
                    Drafting…
                  </>
                ) : (
                  <>
                    Generate
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-txt-tertiary font-semibold mr-1 inline-flex items-center">
              Try
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => {
                  setPrompt(s)
                  void submit(s)
                }}
                className="text-[11px] font-medium rounded-full px-2.5 py-1 border border-border bg-bg-elevated/70 text-txt-secondary hover:text-txt-primary hover:border-border-strong transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
