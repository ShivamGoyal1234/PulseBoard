import { useFieldArray, useFormContext, type Control } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import type { PollBuilderForm } from './schema'

interface OptionListProps {
  qIndex: number
  disabled?: boolean
  control: Control<PollBuilderForm>
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const MAX_OPTIONS = 10
const MIN_OPTIONS = 2

export function OptionList({ qIndex, disabled, control }: OptionListProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<PollBuilderForm>()
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  })

  return (
    <div className="space-y-2">
      {fields.map((field, oIndex) => {
        const err =
          errors.questions?.[qIndex]?.options?.[oIndex]?.text?.message ?? ''
        const letter = LETTERS[oIndex] ?? String(oIndex + 1)
        const canRemove = fields.length > MIN_OPTIONS && !disabled
        return (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`group flex items-center gap-2 rounded-xl border bg-bg-elevated px-2 py-1.5 transition-all ${
              err ? 'border-danger-border bg-danger-bg/20' : 'border-border hover:border-border-strong'
            }`}
          >
            <span
              className={`inline-flex h-8 w-8 shrink-0 rounded-lg items-center justify-center text-xs font-bold transition-colors ${
                err
                  ? 'bg-danger-bg text-danger-text'
                  : 'bg-bg-subtle text-txt-secondary group-hover:bg-brand-bg group-hover:text-brand-text'
              }`}
              aria-hidden
            >
              {letter}
            </span>

            <input
              className="flex-1 h-9 px-2 bg-transparent text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none"
              placeholder={`Option ${letter}`}
              aria-label={`Option ${letter}`}
              aria-invalid={Boolean(err)}
              disabled={disabled}
              {...register(`questions.${qIndex}.options.${oIndex}.text` as const)}
            />

            <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="p-1 rounded-md hover:bg-bg-subtle text-txt-tertiary disabled:opacity-30"
                aria-label="Move option up"
                disabled={disabled || oIndex === 0}
                onClick={() => swap(oIndex, oIndex - 1)}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="p-1 rounded-md hover:bg-bg-subtle text-txt-tertiary disabled:opacity-30"
                aria-label="Move option down"
                disabled={disabled || oIndex === fields.length - 1}
                onClick={() => swap(oIndex, oIndex + 1)}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-danger-bg text-txt-tertiary hover:text-danger-text disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-txt-tertiary shrink-0"
              aria-label="Remove option"
              disabled={!canRemove}
              title={!canRemove ? 'Need at least 2 options' : undefined}
              onClick={() => remove(oIndex)}
            >
              <X size={14} />
            </button>
          </motion.div>
        )
      })}

      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover rounded-md px-1.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || fields.length >= MAX_OPTIONS}
        aria-label="Add option"
        onClick={() =>
          append({ text: '', order: fields.length }, { shouldFocus: true })
        }
      >
        <Plus size={13} />
        Add option
        <span className="text-txt-tertiary font-normal">
          ({fields.length}/{MAX_OPTIONS})
        </span>
      </button>
    </div>
  )
}
