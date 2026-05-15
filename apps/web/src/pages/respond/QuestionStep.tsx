import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Question } from '../../types'

interface QuestionStepProps {
  question: Question
  selected?: string
  onSelect: (optionId: string) => void
  /** Optional step number shown as "Question N of total". */
  stepNumber?: number
  total?: number
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export function QuestionStep({
  question,
  selected,
  onSelect,
  stepNumber,
  total,
}: QuestionStepProps) {
  const sorted = [...question.options].sort((a, b) => a.order - b.order)

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        {typeof stepNumber === 'number' && typeof total === 'number' ? (
          <p className="text-[11px] uppercase tracking-wider text-brand font-semibold">
            Question {stepNumber} of {total}
            {question.isRequired ? (
              <span className="ml-2 text-danger-text">· Required</span>
            ) : (
              <span className="ml-2 text-txt-tertiary">· Optional</span>
            )}
          </p>
        ) : null}
        <h2 className="text-xl sm:text-2xl font-semibold text-txt-primary leading-snug">
          {question.text}
        </h2>
        <p className="text-xs text-txt-tertiary">
          Tap an option to select it. You can change your answer until you
          submit.
        </p>
      </header>

      <div className="grid gap-3">
        {sorted.map((opt, idx) => {
          const isSel = selected === opt.id
          const letter = LETTERS[idx] ?? String(idx + 1)
          return (
            <motion.button
              key={opt.id}
              type="button"
              aria-pressed={isSel}
              aria-label={`Select ${opt.text}`}
              onClick={() => onSelect(opt.id)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className={`group relative overflow-hidden rounded-2xl border text-left px-4 py-4 sm:px-5 sm:py-5 transition-all ${
                isSel
                  ? 'border-brand bg-brand-bg/40'
                  : 'border-border bg-bg-surface hover:border-border-strong'
              }`}
              style={{
                boxShadow: isSel ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              {/* Hover spotlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(400px circle at 30% 0%, var(--brand-primary-bg), transparent 60%)',
                }}
              />
              {/* Selected accent edge */}
              {isSel ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--brand-primary) 0%, #06B6D4 100%)',
                  }}
                />
              ) : null}

              <div className="relative flex items-center gap-4">
                {/* Letter badge */}
                <span
                  className={`shrink-0 inline-flex h-10 w-10 rounded-xl items-center justify-center font-semibold text-sm transition-all ${
                    isSel
                      ? 'bg-brand text-txt-inverse'
                      : 'bg-bg-subtle text-txt-secondary group-hover:bg-brand-bg group-hover:text-brand-text'
                  }`}
                >
                  {letter}
                </span>

                <span
                  className={`flex-1 min-w-0 text-base font-medium ${
                    isSel ? 'text-brand-text' : 'text-txt-primary'
                  }`}
                >
                  {opt.text}
                </span>

                {/* Check indicator */}
                <span
                  aria-hidden
                  className={`shrink-0 inline-flex h-7 w-7 rounded-full items-center justify-center border-2 transition-all ${
                    isSel
                      ? 'border-brand bg-brand'
                      : 'border-border bg-bg-elevated group-hover:border-border-strong'
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSel ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex"
                      >
                        <Check
                          className="size-4 text-txt-inverse"
                          strokeWidth={3}
                          aria-hidden
                        />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
