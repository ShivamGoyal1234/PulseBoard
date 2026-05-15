import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Info,
  ListChecks,
  Plus,
  Rocket,
  Save,
  Settings2,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { pollsApi } from '../../api/polls'
import type { CreatePollInput } from '../../api/polls'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Sidebar } from '../../components/Sidebar'
import { Skeleton } from '../../components/Skeleton'
import {
  createPollFrontendSchema,
  type PollBuilderForm,
  type PollOptionForm,
  type PollQuestionForm,
} from './schema'
import { AiPollGenerator } from './AiPollGenerator'
import { QuestionCard } from './QuestionCard'
import { PollPreview } from './PollPreview'

const PRESETS = [
  { label: '1 day', ms: 1 * 24 * 60 * 60 * 1000 },
  { label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', ms: 30 * 24 * 60 * 60 * 1000 },
]

function toCreatePollPayload(data: PollBuilderForm): CreatePollInput {
  return {
    title: data.title,
    description: data.description,
    expiresAt: data.expiresAt,
    isAnonymous: data.isAnonymous,
    showResults: data.showResults,
    questions: data.questions.map((q: PollQuestionForm, qi: number) => ({
      text: q.text,
      isRequired: q.isRequired,
      order: qi,
      options: q.options.map((o: PollOptionForm, oi: number) => ({
        text: o.text,
        order: oi,
      })),
    })),
  }
}

function SortableQuestion({
  id,
  qIndex,
  disabled,
  control,
  onDuplicate,
  onRemove,
  totalQuestions,
}: {
  id: string
  qIndex: number
  disabled?: boolean
  control: ReturnType<typeof useForm<PollBuilderForm>>['control']
  onDuplicate: () => void
  onRemove: () => void
  totalQuestions: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard
        qIndex={qIndex}
        control={control}
        disabled={disabled}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        totalQuestions={totalQuestions}
      />
    </div>
  )
}

interface PollBuilderProps {
  mode?: 'edit' | 'create'
}

interface SectionHeadingProps {
  Icon: LucideIcon
  title: string
  description?: string
  step?: number
  action?: React.ReactNode
}

function SectionHeading({
  Icon,
  title,
  description,
  step,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className="relative inline-flex h-10 w-10 rounded-xl items-center justify-center bg-brand-bg text-brand-text shrink-0">
          <Icon className="size-4" aria-hidden />
          {typeof step === 'number' ? (
            <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand text-txt-inverse text-[10px] font-bold px-1">
              {step}
            </span>
          ) : null}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-txt-primary leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-xs text-txt-tertiary mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function SettingRow({
  Icon,
  title,
  description,
  value,
  onToggle,
  disabled,
}: {
  Icon: LucideIcon
  title: string
  description: string
  value: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`inline-flex h-9 w-9 rounded-lg items-center justify-center shrink-0 ${
            value ? 'bg-brand-bg text-brand-text' : 'bg-bg-subtle text-txt-secondary'
          }`}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-txt-primary">{title}</p>
          <p className="text-xs text-txt-tertiary mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={title}
        disabled={disabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          value ? 'bg-brand' : 'bg-bg-subtle border border-border'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-bg-elevated shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function PollBuilder({ mode = 'create' }: PollBuilderProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const isEdit = mode === 'edit' && Boolean(id)

  const { data: poll, isLoading } = useQuery({
    queryKey: ['poll', id],
    queryFn: () => pollsApi.get(id!),
    enabled: isEdit,
  })

  const { data: analytics } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => pollsApi.getAnalytics(id!),
    enabled: isEdit && Boolean(id),
  })

  const lockQuestions = Boolean(analytics && analytics.totalResponses > 0)

  const methods = useForm<PollBuilderForm>({
    resolver: zodResolver(createPollFrontendSchema),
    defaultValues: {
      title: '',
      description: '',
      isAnonymous: false,
      showResults: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      questions: [
        {
          text: '',
          isRequired: true,
          order: 0,
          options: [
            { text: '', order: 0 },
            { text: '', order: 1 },
          ],
        },
      ],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = methods

  const {
    fields: questionFields,
    append: addQuestion,
    remove: removeQuestion,
    move: moveQuestion,
  } = useFieldArray({ control, name: 'questions' })

  useEffect(() => {
    if (!poll || !isEdit) return
    reset({
      title: poll.title,
      description: poll.description ?? '',
      isAnonymous: poll.isAnonymous,
      showResults: poll.showResults,
      expiresAt: new Date(poll.expiresAt).toISOString(),
      questions:
        poll.questions?.map((q, qi) => ({
          text: q.text,
          isRequired: q.isRequired,
          order: qi,
          options: q.options
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((o, oi) => ({
              text: o.text,
              order: oi,
            })),
        })) ?? [],
    })
  }, [poll, isEdit, reset])

  const values = watch()

  const questionIds = useMemo(
    () => questionFields.map((f) => f.id),
    [questionFields]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = questionIds.indexOf(String(active.id))
    const newIndex = questionIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    moveQuestion(oldIndex, newIndex)
  }

  const onSubmit = async (data: PollBuilderForm) => {
    setSaving(true)
    try {
      if (isEdit && id) {
        await pollsApi.update(id, {
          title: data.title,
          description: data.description,
          expiresAt: data.expiresAt,
          isAnonymous: data.isAnonymous,
          showResults: data.showResults,
        })
        toast.success('Poll updated')
        navigate(`/polls/${id}/analytics`)
        return
      }
      const payload = toCreatePollPayload(data)
      const created = await pollsApi.create(payload)
      toast.success('Poll created')
      navigate(`/polls/${created.id}/analytics`)
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.response?.data?.error ?? 'Could not save poll')
      } else {
        toast.error('Could not save poll')
      }
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = () => {
    toast.success('Draft saved locally in this session')
  }

  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen bg-bg-page flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-8 space-y-4 max-w-3xl">
          <Skeleton variant="title" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  const expiresLocal = values.expiresAt
    ? (() => {
        const d = new Date(values.expiresAt)
        const p = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
      })()
    : ''

  // Build a small "is ready" indicator the user can scan as they fill the form.
  const titleOk = Boolean(values.title?.trim())
  const allQuestionsOk = values.questions.every(
    (q: PollQuestionForm) =>
      Boolean(q.text?.trim()) &&
      q.options.length >= 2 &&
      q.options.every((o: PollOptionForm) => Boolean(o.text?.trim()))
  )
  const ready = titleOk && allQuestionsOk && values.questions.length > 0

  const totalOptions = values.questions.reduce(
    (acc: number, q: PollQuestionForm) => acc + q.options.length,
    0
  )

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-bg-page flex flex-col md:flex-row">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <motion.div className="flex-1 min-w-0 flex flex-col">
          <section className="relative overflow-hidden border-b border-border">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 90% 0%, rgba(6,182,212,0.18) 0%, transparent 60%)',
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
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1.5">
                    {isEdit ? 'Editing poll' : 'New poll'}
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold tracking-tight bg-clip-text text-transparent leading-tight"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--txt-primary) 0%, var(--brand-primary) 100%)',
                    }}
                  >
                    {isEdit
                      ? values.title || 'Edit your poll'
                      : 'Build something worth answering'}
                  </h1>
                  <p className="text-sm text-txt-secondary mt-2 max-w-xl">
                    {isEdit
                      ? 'Tweak settings and copy. Questions are locked once responses start arriving.'
                      : 'Compose a poll with thoughtful questions, share one link, and watch responses pour in live.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated border border-border px-2.5 py-1 text-[11px] text-txt-secondary">
                      <ListChecks className="size-3 text-brand" />
                      {values.questions.length} question
                      {values.questions.length === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated border border-border px-2.5 py-1 text-[11px] text-txt-secondary">
                      <Sparkles className="size-3 text-brand" />
                      {totalOptions} option{totalOptions === 1 ? '' : 's'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                        ready
                          ? 'bg-success-bg border-success-border text-success-text'
                          : 'bg-warning-bg border-warning-border text-warning-text'
                      }`}
                    >
                      <CheckCircle2 className="size-3" />
                      {ready ? 'Ready to publish' : 'Needs a few more fields'}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={saveDraft}>
                    <Save size={16} />
                    Save draft
                  </Button>
                  <Button
                    type="submit"
                    form="poll-builder-form"
                    loading={saving}
                    disabled={!ready}
                  >
                    {isEdit ? (
                      <>
                        <CheckCircle2 size={16} /> Save changes
                      </>
                    ) : (
                      <>
                        <Rocket size={16} /> Publish poll
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {!isEdit ? (
            <motion.div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
              <AiPollGenerator
                onApply={(draft) => {
                  reset({
                    title: draft.title ?? '',
                    description: draft.description ?? '',
                    isAnonymous: values.isAnonymous,
                    showResults: values.showResults,
                    expiresAt: values.expiresAt,
                    questions: draft.questions.map((q, qi) => ({
                      text: q.text,
                      isRequired: q.isRequired,
                      order: qi,
                      options: q.options.map((o, oi) => ({
                        text: o.text,
                        order: oi,
                      })),
                    })),
                  })
                }}
              />
            </motion.div>
          ) : null}

          <form
            id="poll-builder-form"
            className="flex flex-col flex-1 min-w-0"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
          <div
            className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-7 sm:pb-9 ${
              isEdit ? 'py-7 sm:py-9' : 'pt-6'
            }`}
          >
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-6 pb-32 lg:pb-10">
                {/* Section 1: Basics */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-2xl border border-border bg-bg-surface p-5 sm:p-6"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <SectionHeading
                    Icon={Info}
                    step={1}
                    title="Basics"
                    description="Give your poll a clear title and a friendly description."
                  />
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="poll-title"
                        className="text-sm font-medium text-txt-primary"
                      >
                        Title
                      </label>
                      <input
                        id="poll-title"
                        className="mt-1.5 w-full text-base px-3 py-2.5 bg-bg-input border border-border rounded-xl text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                        placeholder="e.g. Where should we host the team offsite?"
                        aria-label="Poll title"
                        aria-invalid={Boolean(errors.title)}
                        {...methods.register('title')}
                      />
                      {errors.title ? (
                        <p className="text-xs text-danger-text mt-1">
                          Title is required
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="poll-description"
                        className="text-sm font-medium text-txt-primary"
                      >
                        Description{' '}
                        <span className="text-txt-tertiary font-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="poll-description"
                        className="mt-1.5 w-full min-h-[96px] px-3 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                        placeholder="Add helpful context for respondents — when and where, who's voting, why their input matters."
                        rows={3}
                        {...methods.register('description')}
                      />
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="rounded-2xl border border-border bg-bg-surface p-5 sm:p-6"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <SectionHeading
                    Icon={Calendar}
                    step={2}
                    title="Schedule"
                    description="Pick a close time. You can also close manually any time."
                  />
                  <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
                    <Input
                      label="Closes at"
                      type="datetime-local"
                      aria-label="Poll expiry"
                      value={expiresLocal}
                      onChange={(e) =>
                        setValue(
                          'expiresAt',
                          new Date(e.target.value).toISOString(),
                          { shouldValidate: true }
                        )
                      }
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => {
                        const expiry = new Date(values.expiresAt).getTime()
                        const target = Date.now() + p.ms
                        const isActive = Math.abs(expiry - target) < 60_000
                        return (
                          <button
                            key={p.label}
                            type="button"
                            className={`px-2.5 py-1.5 text-xs rounded-full border transition-all ${
                              isActive
                                ? 'bg-brand text-txt-inverse border-brand shadow-sm'
                                : 'bg-bg-elevated text-txt-secondary border-border hover:border-border-strong hover:text-txt-primary'
                            }`}
                            aria-label={`Set expiry to ${p.label}`}
                            aria-pressed={isActive}
                            onClick={() =>
                              setValue(
                                'expiresAt',
                                new Date(Date.now() + p.ms).toISOString(),
                                { shouldValidate: true }
                              )
                            }
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="rounded-2xl border border-border bg-bg-surface p-5 sm:p-6"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <SectionHeading
                    Icon={Settings2}
                    step={3}
                    title="Settings"
                    description="Decide how people respond and what they see after submitting."
                  />
                  <div className="space-y-3">
                    <SettingRow
                      Icon={Globe2}
                      title="Anonymous responses"
                      description="No login required. We use a browser fingerprint to deduplicate."
                      value={values.isAnonymous}
                      onToggle={() =>
                        setValue('isAnonymous', !values.isAnonymous, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <SettingRow
                      Icon={values.showResults ? Eye : EyeOff}
                      title="Show results after submit"
                      description="Send respondents to the public results page once they vote."
                      value={values.showResults}
                      onToggle={() =>
                        setValue('showResults', !values.showResults, {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="rounded-2xl border border-border bg-bg-surface p-5 sm:p-6"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <SectionHeading
                    Icon={ListChecks}
                    step={4}
                    title="Questions"
                    description="Drag to reorder. Add up to 20 questions, each with 2–10 options."
                    action={
                      <span className="text-[11px] text-txt-tertiary tabular-nums">
                        {values.questions.length} / 20
                      </span>
                    }
                  />

                  {isEdit && lockQuestions ? (
                    <div className="text-xs text-warning-text bg-warning-bg border border-warning-border rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2">
                      <Info className="size-4 shrink-0 mt-0.5" />
                      <span>
                        This poll already has responses. Question text and
                        options are locked, but you can still update settings.
                      </span>
                    </div>
                  ) : null}

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={questionIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {questionFields.map((field, index) => (
                          <SortableQuestion
                            key={field.id}
                            id={field.id}
                            qIndex={index}
                            control={control}
                            disabled={Boolean(isEdit && lockQuestions)}
                            totalQuestions={questionFields.length}
                            onDuplicate={() => {
                              const current = methods.getValues(
                                `questions.${index}`
                              ) as PollQuestionForm
                              addQuestion(
                                {
                                  ...current,
                                  text: `${current.text} (copy)`,
                                  options: current.options.map(
                                    (o: PollOptionForm) => ({
                                      ...o,
                                      text: o.text,
                                    })
                                  ),
                                },
                                { shouldFocus: false }
                              )
                            }}
                            onRemove={() => removeQuestion(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <button
                    type="button"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-brand/40 rounded-2xl py-4 text-sm font-medium text-brand hover:bg-brand-bg hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add question"
                    disabled={
                      Boolean(isEdit && lockQuestions) ||
                      values.questions.length >= 20
                    }
                    onClick={() =>
                      addQuestion(
                        {
                          text: '',
                          isRequired: true,
                          order: questionFields.length,
                          options: [
                            { text: '', order: 0 },
                            { text: '', order: 1 },
                          ],
                        },
                        { shouldFocus: false }
                      )
                    }
                  >
                    <Plus size={16} />
                    Add another question
                  </button>
                </motion.section>
              </div>

              <aside className="col-span-12 lg:col-span-4">
                <div className="lg:sticky lg:top-6">
                  <PollPreview data={values} />
                </div>
              </aside>
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-bg-surface/95 backdrop-blur-sm p-3 flex justify-end gap-2 z-40">
            <Button type="button" variant="ghost" onClick={saveDraft}>
              <Save size={16} />
              Draft
            </Button>
            <Button type="submit" loading={saving} disabled={!ready}>
              {isEdit ? (
                <>
                  <CheckCircle2 size={16} /> Save
                </>
              ) : (
                <>
                  <Rocket size={16} /> Publish
                </>
              )}
            </Button>
          </div>
        </form>
        </motion.div>
      </div>
    </FormProvider>
  )
}
