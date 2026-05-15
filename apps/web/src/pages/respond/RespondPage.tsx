import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lock,
  Send,
  Sparkles,
} from 'lucide-react'
import { pollsApi } from '../../api/polls'
import { responsesApi } from '../../api/responses'
import { useFingerprint } from '../../hooks/useFingerprint'
import type { Question } from '../../types'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/Button'
import { QuestionStep } from './QuestionStep'

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const expires = new Date(expiresAt).getTime()
  const ms = Math.max(0, expires - now)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)

  const label = days > 0
    ? `${days}d ${hours}h left`
    : hours > 0
      ? `${hours}h ${minutes}m left`
      : `${minutes}m ${seconds}s left`

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning-text bg-warning-bg border border-warning-border rounded-full px-2.5 py-1"
      aria-live="polite"
      title={`Closes ${new Date(expiresAt).toLocaleString()}`}
    >
      <Clock className="size-3" />
      {label}
    </span>
  )
}

function StepDots({
  total,
  current,
  answered,
}: {
  total: number
  current: number
  answered: boolean[]
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === current
        const isDone = answered[i]
        return (
          <span
            key={i}
            aria-hidden
            className={`transition-all rounded-full ${
              isCurrent
                ? 'h-2 w-6 bg-brand'
                : isDone
                  ? 'h-2 w-2 bg-brand'
                  : 'h-2 w-2 bg-bg-subtle'
            }`}
          />
        )
      })}
    </div>
  )
}

export function RespondPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getFingerprint } = useFingerprint()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [startTime] = useState(() => Date.now())
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitWillShowResults, setSubmitWillShowResults] = useState(false)
  const [alreadyVoted, setAlreadyVoted] = useState(false)

  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['publicPoll', id],
    queryFn: () => pollsApi.get(id!),
    enabled: Boolean(id),
  })

  const questions: Question[] = useMemo(
    () =>
      (poll?.questions ?? []).slice().sort((a, b) => a.order - b.order),
    [poll?.questions]
  )

  const isExpired = useMemo(() => {
    if (!poll) return false
    return new Date(poll.expiresAt) < new Date() || !poll.isActive
  }, [poll])

  const answeredArray = useMemo(
    () => questions.map((q) => Boolean(answers[q.id])),
    [questions, answers]
  )

  const progress = useMemo(() => {
    if (!questions.length) return 0
    const answered = answeredArray.filter(Boolean).length
    return Math.round((answered / questions.length) * 100)
  }, [answeredArray, questions.length])

  const requiredLeft = useMemo(
    () => questions.filter((q) => q.isRequired && !answers[q.id]),
    [questions, answers]
  )

  const canSubmit = requiredLeft.length === 0 && questions.length > 0

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(questions.length - 1, s + 1))
  }
  const goPrev = () => {
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
  }

  const handleSubmit = async () => {
    if (!id || !canSubmit || submitting) return
    setSubmitting(true)
    const fingerprint = await getFingerprint()
    const timeToComplete = Math.round((Date.now() - startTime) / 1000)
    try {
      const result = await responsesApi.submit(
        id,
        {
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
          timeToComplete,
        },
        fingerprint
      )
      void confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } })
      setSubmitWillShowResults(result.showResults)
      setSubmitted(true)
      if (result.showResults) {
        window.setTimeout(() => navigate(`/p/${id}/results`), 2000)
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setAlreadyVoted(true)
      } else {
        toast.error('Failed to submit. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- Loading / error / closed / already voted / submitted states ----------

  if (isLoading || !id) {
    return (
      <div className="min-h-screen bg-bg-page p-6 space-y-4 max-w-xl mx-auto">
        <Skeleton variant="title" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <CenterCard
        icon={<Lock className="size-9 text-txt-tertiary" aria-hidden />}
        title="Poll unavailable"
        description="We couldn't load this poll. The link may be broken or the poll may have been removed."
      />
    )
  }

  if (isExpired && poll.isPublished) {
    return <Navigate to={`/p/${id}/results`} replace />
  }

  if (isExpired) {
    return (
      <CenterCard
        icon={<Lock className="size-9 text-txt-tertiary" aria-hidden />}
        title="This poll has closed"
        description="The organizer has stopped collecting responses. Published results will appear on this link when they choose to share them."
      />
    )
  }

  if (alreadyVoted) {
    return (
      <CenterCard
        icon={
          <CheckCircle2 className="size-10 text-success-text" aria-hidden />
        }
        title="You have already responded"
        description="Thanks — your answers were recorded."
        action={
          poll.isPublished ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/p/${id}/results`)}
            >
              View published results
              <ArrowRight size={16} />
            </Button>
          ) : null
        }
      />
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-bg-page flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 35%, var(--success-bg) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="inline-flex h-20 w-20 rounded-full bg-success-bg items-center justify-center border-4 border-success-border mb-6"
        >
          <CheckCircle2
            className="size-10 text-success-text"
            aria-hidden
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-3xl sm:text-4xl font-semibold text-txt-primary"
        >
          Response recorded
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-sm text-txt-secondary mt-3 max-w-sm"
        >
          {submitWillShowResults
            ? 'Taking you to live results in a moment…'
            : 'Thanks for voting. You can close this tab safely.'}
        </motion.p>
      </main>
    )
  }

  // ---------- Main respond UI ----------

  const current = questions[step]
  const single = questions.length === 1

  return (
    <main className="min-h-screen bg-bg-page">
      {/* Sticky header with gradient + progress */}
      <header className="sticky top-0 z-10 backdrop-blur bg-bg-surface/80 border-b border-border">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-90"
            style={{
              background:
                'linear-gradient(135deg, var(--brand-primary-bg) 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 90% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-brand font-semibold mb-1.5">
                  <Sparkles className="size-3" />
                  PulseBoard poll
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-txt-primary leading-snug">
                  {poll.title}
                </h1>
                {poll.description ? (
                  <p className="text-sm text-txt-secondary mt-1 line-clamp-2">
                    {poll.description}
                  </p>
                ) : null}
              </div>
              <Countdown expiresAt={poll.expiresAt} />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-txt-tertiary inline-flex items-center gap-1.5">
                <ClipboardList className="size-3" />
                {single
                  ? '1 question'
                  : `${answeredArray.filter(Boolean).length} of ${questions.length} answered`}
              </span>
              {!single ? (
                <StepDots
                  total={questions.length}
                  current={step}
                  answered={answeredArray}
                />
              ) : null}
              <span className="text-[11px] text-txt-tertiary tabular-nums">
                {progress}%
              </span>
            </div>
          </div>

          {/* Bottom progress bar */}
          <div
            className="h-[3px] w-full bg-bg-subtle border-t border-border"
            aria-hidden
          >
            <motion.div
              className="h-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--brand-primary) 0%, #06B6D4 100%)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {single ? (
          <QuestionStep
            question={questions[0]}
            selected={answers[questions[0].id]}
            onSelect={(oid) => selectOption(questions[0].id, oid)}
          />
        ) : (
          <div className="relative">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={current?.id ?? step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {current ? (
                  <QuestionStep
                    question={current}
                    selected={answers[current.id]}
                    onSelect={(oid) => {
                      selectOption(current.id, oid)
                      if (step < questions.length - 1) {
                        window.setTimeout(() => goNext(), 250)
                      }
                    }}
                    stepNumber={step + 1}
                    total={questions.length}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3 pt-8">
              <Button
                variant="ghost"
                disabled={step === 0}
                aria-label="Previous question"
                onClick={goPrev}
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
              {step < questions.length - 1 ? (
                <Button
                  variant="primary"
                  disabled={!answers[current?.id ?? '']}
                  aria-label="Next question"
                  onClick={goNext}
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={!canSubmit}
                  loading={submitting}
                  aria-label="Submit responses"
                  onClick={() => void handleSubmit()}
                >
                  <Send size={16} />
                  Submit
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Single-question / last-question submit row */}
        {single ? (
          <div className="pt-8 border-t border-border mt-8">
            <Button
              type="button"
              className="w-full"
              disabled={!canSubmit}
              loading={submitting}
              aria-label="Submit responses"
              onClick={() => void handleSubmit()}
            >
              <Send size={16} />
              Submit response
            </Button>
            {!canSubmit ? (
              <p className="text-xs text-txt-tertiary mt-2 text-center">
                Select an option to submit.
              </p>
            ) : (
              <p className="text-xs text-txt-tertiary mt-2 text-center">
                Your response is anonymous and fingerprint-verified.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center pt-8 text-[11px] text-txt-tertiary">
            {requiredLeft.length > 0
              ? `${requiredLeft.length} required question${
                  requiredLeft.length === 1 ? '' : 's'
                } left to answer`
              : 'All required questions answered'}
          </div>
        )}
      </div>
    </main>
  )
}

function CenterCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-bg-page flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 35%, var(--brand-primary-bg) 0%, transparent 70%)',
        }}
      />
      <div className="inline-flex h-20 w-20 rounded-2xl bg-bg-elevated border border-border items-center justify-center mb-5">
        {icon}
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-txt-primary">
        {title}
      </h1>
      <p className="text-sm text-txt-secondary mt-3 max-w-md leading-relaxed">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </main>
  )
}
