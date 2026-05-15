import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import {
  MoreVertical,
  Edit2,
  BarChart2,
  Trash2,
  Share2,
  Rocket,
  Ban,
  Calendar,
  Users,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, formatDistanceToNowStrict } from 'date-fns'
import type { Poll } from '../../types'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { pollsApi } from '../../api/polls'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'

interface PollCardProps {
  poll: Poll
  onDeleted?: () => void
}

function sparklineFor(id: string, total: number) {
  const hash = id
    .split('')
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)
  const points = 14
  const base = Math.max(2, total / points)
  const arr: { i: number; v: number }[] = []
  let v = base
  for (let i = 0; i < points; i++) {
    const noise = (((hash >> (i % 16)) & 7) - 3) / 4
    v = Math.max(0, v + noise + (i / points) * (base * 0.4))
    arr.push({ i, v: Math.round(v * 10) / 10 })
  }
  return arr
}

export function PollCard({ poll, onDeleted }: PollCardProps) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const t = tokens[theme]
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [busy, setBusy] = useState(false)

  const expiredByTime = useMemo(
    () => new Date(poll.expiresAt) < new Date(),
    [poll.expiresAt]
  )
  const closedByCreator = !poll.isActive && !expiredByTime
  const live = poll.isActive && !expiredByTime

  const responses = poll.responseCount ?? 0
  const responseTarget = 100
  const progress = Math.min(100, Math.round((responses / responseTarget) * 100))

  const status = poll.isPublished
    ? ('published' as const)
    : closedByCreator
      ? ('closed' as const)
      : expiredByTime
        ? ('expired' as const)
        : ('active' as const)

  const accent: Record<typeof status, string> = {
    active: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
    published: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
    closed: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
    expired: 'linear-gradient(90deg, #DC2626 0%, #F87171 100%)',
  }

  const sparklineColor =
    status === 'active'
      ? '#10B981'
      : status === 'published'
        ? t.chart[0]
        : status === 'closed'
          ? '#F59E0B'
          : '#DC2626'

  const statusBadge = (() => {
    switch (status) {
      case 'published':
        return <Badge variant="info">Published</Badge>
      case 'closed':
        return <Badge variant="warning">Closed</Badge>
      case 'expired':
        return <Badge variant="warning">Expired</Badge>
      default:
        return <Badge variant="success">Active</Badge>
    }
  })()

  const expiresLabel = (() => {
    const exp = new Date(poll.expiresAt)
    if (expiredByTime) return `Ended ${formatDistanceToNowStrict(exp)} ago`
    return `Closes in ${formatDistanceToNowStrict(exp)}`
  })()

  const spark = useMemo(
    () => sparklineFor(poll.id, responses),
    [poll.id, responses]
  )

  const shareLink = `${window.location.origin}/p/${poll.id}`
  const richShareLink = `${import.meta.env.VITE_API_URL ?? ''}/share/p/${poll.id}`

  const handlePublish = async () => {
    setBusy(true)
    try {
      await pollsApi.publish(poll.id)
      toast.success('Results published')
      onDeleted?.()
    } catch {
      toast.error('Could not publish')
    } finally {
      setBusy(false)
      setMenuOpen(false)
    }
  }

  const handleClosePoll = async () => {
    setBusy(true)
    try {
      await pollsApi.update(poll.id, { isActive: false })
      toast.success('Poll closed — no new responses')
      setConfirmClose(false)
      onDeleted?.()
    } catch (e) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.error
          ? String(e.response.data.error)
          : 'Could not close poll'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await pollsApi.delete(poll.id)
      toast.success('Poll deleted')
      setConfirmDelete(false)
      onDeleted?.()
    } catch (e) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.error
          ? String(e.response.data.error)
          : 'Could not delete poll'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18 }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-bg-surface cursor-pointer"
        style={{ boxShadow: 'var(--shadow-sm)' }}
        role="button"
        tabIndex={0}
        aria-label={`Open analytics for ${poll.title}`}
        onClick={() => navigate(`/polls/${poll.id}/analytics`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/polls/${poll.id}/analytics`)
          }
        }}
      >
        {/* Top accent strip */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accent[status] }}
        />

        {/* Hover gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(600px circle at 30% 0%, var(--brand-primary-bg), transparent 60%)',
          }}
        />

        <div className="relative p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {statusBadge}
                {live ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success-text">
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-text" />
                    </span>
                    Live
                  </span>
                ) : null}
              </div>
              <h3 className="text-base font-semibold text-txt-primary leading-snug line-clamp-2">
                {poll.title}
              </h3>
              {poll.description ? (
                <p className="text-xs text-txt-tertiary mt-1 line-clamp-1">
                  {poll.description}
                </p>
              ) : null}
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                className="p-1.5 rounded-md text-txt-tertiary hover:text-txt-primary hover:bg-bg-subtle"
                aria-label="Poll actions"
                aria-expanded={menuOpen}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((v) => !v)
                }}
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 mt-2 w-52 bg-bg-elevated border border-border rounded-xl py-1 text-sm z-20"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate(`/polls/${poll.id}/edit`)
                    }}
                  >
                    <Edit2 size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate(`/polls/${poll.id}/analytics`)
                    }}
                  >
                    <BarChart2 size={15} />
                    Analytics
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                    role="menuitem"
                    onClick={async () => {
                      setMenuOpen(false)
                      await navigator.clipboard.writeText(shareLink)
                      toast.success('Share link copied')
                    }}
                  >
                    <Share2 size={15} />
                    Copy share link
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                    role="menuitem"
                    onClick={async () => {
                      setMenuOpen(false)
                      await navigator.clipboard.writeText(richShareLink)
                      toast.success('Share link with preview copied')
                    }}
                  >
                    <Sparkles size={15} />
                    Copy link with preview
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      window.open(`/p/${poll.id}`, '_blank')
                    }}
                  >
                    <ExternalLink size={15} />
                    Open public link
                  </button>
                  {live ? (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmClose(true)
                      }}
                    >
                      <Ban size={15} />
                      Close poll
                    </button>
                  ) : null}
                  {!poll.isPublished ? (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle text-left text-txt-primary"
                      role="menuitem"
                      onClick={() => void handlePublish()}
                    >
                      <Rocket size={15} />
                      Publish results
                    </button>
                  ) : null}
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-danger-bg text-left text-danger-text"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setConfirmDelete(true)
                    }}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Stats row + sparkline */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-txt-tertiary uppercase tracking-wider mb-0.5">
                Responses
              </p>
              <p className="text-2xl font-semibold text-txt-primary tabular-nums leading-none">
                {responses.toLocaleString()}
              </p>
              <p className="text-[11px] text-txt-tertiary mt-1.5">
                target {responseTarget}
              </p>
            </div>
            <div className="flex-1 max-w-[140px] h-12 -mb-1 opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={spark}
                  margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`spark-${poll.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={sparklineColor}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={sparklineColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={sparklineColor}
                    strokeWidth={2}
                    fill={`url(#spark-${poll.id})`}
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    progress >= 80
                      ? 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)'
                      : status === 'active'
                        ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                        : 'var(--brand-primary)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-txt-secondary pt-1 border-t border-border">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3 text-txt-tertiary" aria-hidden />
              {responses.toLocaleString()} responses
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              title={format(new Date(poll.expiresAt), 'PPpp')}
            >
              <Calendar className="size-3 text-txt-tertiary" aria-hidden />
              {expiresLabel}
            </span>
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Close poll?"
        size="sm"
      >
        <p className="text-sm text-txt-secondary mb-4">
          Respondents will no longer be able to submit answers. Existing
          responses stay saved; you can still view analytics and publish results.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmClose(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={busy}
            onClick={() => void handleClosePoll()}
          >
            Close poll
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete poll?"
        size="sm"
      >
        <p className="text-sm text-txt-secondary mb-4">
          This permanently removes the poll and its responses.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
