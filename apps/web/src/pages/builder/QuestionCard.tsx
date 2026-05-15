import { useFormContext, type Control } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Copy, GripVertical, Trash2 } from 'lucide-react'
import type { PollBuilderForm } from './schema'
import { OptionList } from './OptionList'

interface QuestionCardProps {
  qIndex: number
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
  disabled?: boolean
  control: Control<PollBuilderForm>
  onDuplicate: () => void
  onRemove: () => void
  totalQuestions?: number
}

export function QuestionCard({
  qIndex,
  dragHandleProps,
  isDragging,
  disabled,
  control,
  onDuplicate,
  onRemove,
  totalQuestions,
}: QuestionCardProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PollBuilderForm>()
  const required = watch(`questions.${qIndex}.isRequired`)
  const questionText = watch(`questions.${qIndex}.text`) ?? ''
  const questionError = errors.questions?.[qIndex]?.text?.message

  const canDelete = (totalQuestions ?? 0) > 1 && !disabled

  return (
    <motion.div
      layout
      className={`group relative rounded-2xl border bg-bg-elevated transition-all overflow-hidden ${
        isDragging
          ? 'opacity-60 scale-[1.01] cursor-grabbing border-brand bg-brand-bg/30'
          : 'border-border hover:border-border-strong'
      }`}
      style={{ boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, var(--brand-primary) 0%, #06B6D4 100%)',
        }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              className="p-1 rounded-md text-txt-tertiary hover:text-txt-primary hover:bg-bg-subtle cursor-grab active:cursor-grabbing disabled:opacity-30"
              aria-label="Drag to reorder question"
              disabled={disabled}
              {...dragHandleProps}
            >
              <GripVertical size={16} />
            </button>
            <span
              className="inline-flex h-10 w-10 rounded-xl items-center justify-center text-txt-inverse text-sm font-bold"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-primary) 0%, #06B6D4 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
              aria-label={`Question ${qIndex + 1}`}
            >
              Q{qIndex + 1}
            </span> 
          </div>

          <div className="flex-1 min-w-0 space-y-3.5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor={`q-${qIndex}-text`}
                  className="text-[11px] uppercase tracking-wider text-txt-tertiary font-semibold"
                >
                  Question
                </label>
                <span className="text-[11px] text-txt-tertiary tabular-nums">
                  {questionText.length}/500
                </span>
              </div>
              <textarea
                id={`q-${qIndex}-text`}
                className={`w-full min-h-[56px] px-3.5 py-2.5 bg-bg-input border rounded-xl text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand/20 transition-all ${
                  questionError ? 'border-danger-border' : 'border-border'
                }`}
                placeholder="Ask something meaningful…"
                rows={2}
                maxLength={500}
                disabled={disabled}
                aria-invalid={Boolean(questionError)}
                {...register(`questions.${qIndex}.text` as const)}
              />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-txt-tertiary font-semibold mb-2">
                Options
              </p>
              <OptionList
                qIndex={qIndex}
                disabled={disabled}
                control={control}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <label
                className="inline-flex items-center gap-2 text-xs font-medium text-txt-secondary cursor-pointer select-none"
                aria-label="Required question"
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={required}
                  disabled={disabled}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    required ? 'bg-brand' : 'bg-bg-subtle border border-border'
                  }`}
                  onClick={() =>
                    setValue(`questions.${qIndex}.isRequired`, !required)
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-bg-elevated shadow transition-transform ${
                      required ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                {required ? 'Required' : 'Optional'}
              </label>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary rounded-md px-2 py-1 hover:bg-bg-subtle transition-colors disabled:opacity-40"
                  aria-label="Duplicate question"
                  disabled={disabled}
                  onClick={onDuplicate}
                >
                  <Copy size={13} />
                  Duplicate
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-danger-text hover:bg-danger-bg rounded-md px-2 py-1 transition-colors disabled:opacity-40"
                  aria-label="Delete question"
                  disabled={!canDelete}
                  title={
                    !canDelete && (totalQuestions ?? 0) <= 1
                      ? 'A poll needs at least one question'
                      : undefined
                  }
                  onClick={onRemove}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
