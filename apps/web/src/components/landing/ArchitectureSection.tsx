import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Database,
  Fingerprint,
  Globe2,
  Layers,
  RadioTower,
  Send,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { LandingContain } from './LandingShell'

interface Node {
  id: string
  label: string
  sublabel: string
  Icon: LucideIcon
  color: string
  x: number
  y: number
}

const NODES: Node[] = [
  {
    id: 'voter',
    label: 'Respondent',
    sublabel: 'Browser fingerprint, no login',
    Icon: Fingerprint,
    color: '#4F46E5',
    x: 6,
    y: 50,
  },
  {
    id: 'api',
    label: 'Express API',
    sublabel: 'Validates + emits Kafka event',
    Icon: Send,
    color: '#0EA5E9',
    x: 26,
    y: 50,
  },
  {
    id: 'kafka',
    label: 'Kafka',
    sublabel: 'responses topic + DLQ',
    Icon: RadioTower,
    color: '#F59E0B',
    x: 48,
    y: 50,
  },
  {
    id: 'consumer',
    label: 'Consumer',
    sublabel: 'Idempotent writes',
    Icon: Layers,
    color: '#10B981',
    x: 70,
    y: 24,
  },
  {
    id: 'redis',
    label: 'Redis',
    sublabel: 'Counters + dedupe',
    Icon: Database,
    color: '#DC2626',
    x: 70,
    y: 76,
  },
  {
    id: 'socket',
    label: 'WebSocket',
    sublabel: '< 50ms to dashboard',
    Icon: Wifi,
    color: '#7C3AED',
    x: 88,
    y: 50,
  },
]

const EDGES: { from: string; to: string }[] = [
  { from: 'voter', to: 'api' },
  { from: 'api', to: 'kafka' },
  { from: 'kafka', to: 'consumer' },
  { from: 'kafka', to: 'redis' },
  { from: 'consumer', to: 'socket' },
  { from: 'redis', to: 'socket' },
]

const FEATURES: {
  Icon: LucideIcon
  title: string
  body: string
  bullet: string
}[] = [
  {
    Icon: RadioTower,
    title: 'Kafka pipeline with DLQ + replay',
    body: 'Every response is an event. A consumer writes to Postgres; failures land in a dead-letter topic with a one-click replay endpoint.',
    bullet: 'Zero silent data loss',
  },
  {
    Icon: Zap,
    title: 'Redis-backed live counters',
    body: 'In-flight tallies stay in Redis so high-volume polls remain instant. Fingerprint dedupe + per-poll cache keys keep state coherent.',
    bullet: 'Hot path stays out of Postgres',
  },
  {
    Icon: Wifi,
    title: 'WebSocket fan-out',
    body: 'A second consumer broadcasts deltas to subscribed dashboards over Socket.IO. Frontend merges server + live state without flicker.',
    bullet: 'Sub-50ms perceived latency',
  },
  {
    Icon: Brain,
    title: 'GPT-4o-mini narrative insights',
    body: '5 numbered, evidence-grounded takeaways generated from real aggregates, cached in Redis with a force-refresh path.',
    bullet: 'Charts + words, side by side',
  },
]

function getNode(id: string) {
  const n = NODES.find((node) => node.id === id)
  if (!n) throw new Error(`Unknown node: ${id}`)
  return n
}

/**
 * Compute a slight curved path between two nodes so multiple edges that share
 * endpoints visually separate.
 */
function curvedPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  curvature: number
) {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const dx = bx - ax
  const dy = by - ay
  const nx = -dy
  const ny = dx
  const len = Math.hypot(nx, ny) || 1
  const cx = mx + (nx / len) * curvature
  const cy = my + (ny / len) * curvature
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`
}

export function ArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.25 })

  return (
    <section
      id="architecture"
      ref={sectionRef}
      className="relative overflow-hidden border-y border-border py-20 scroll-mt-24"
    >
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, var(--brand-primary-bg) 0%, transparent 70%)',
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
            'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 80%)',
        }}
      />

      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-10"
        >
          <SectionLabel>How it works under the hood</SectionLabel>
          <SectionHeading>
            Built like a small distributed system
          </SectionHeading>
          <p className="text-base text-txt-secondary leading-relaxed">
            Not a CRUD app. Every vote flows through Kafka with a dead-letter
            queue, Redis caches the hot path, and WebSockets push deltas to
            dashboards in real time.
          </p>
        </motion.div>

        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-bg-surface p-5 sm:p-8"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="grid grid-cols-12 items-start gap-6">
            <div className="col-span-12 lg:col-span-9">
              <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 56"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="arch-edge"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
                    </linearGradient>
                    <radialGradient id="packet-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  {EDGES.map((e, i) => {
                    const from = getNode(e.from)
                    const to = getNode(e.to)
                    const fx = (from.x / 100) * 100
                    const fy = (from.y / 100) * 56
                    const tx = (to.x / 100) * 100
                    const ty = (to.y / 100) * 56
                    // Add slight curvature for the fork edges so they don't overlap.
                    const curvature =
                      e.from === 'kafka' || e.from === 'redis' || e.to === 'socket'
                        ? (i % 2 === 0 ? 2.2 : -2.2)
                        : 0
                    const d = curvedPath(fx, fy, tx, ty, curvature)
                    return (
                      <g key={`${e.from}-${e.to}`}>
                        <motion.path
                          d={d}
                          stroke="url(#arch-edge)"
                          strokeWidth={0.45}
                          fill="none"
                          strokeDasharray="0.8 1.6"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={
                            inView
                              ? { pathLength: 1, opacity: 1 }
                              : { pathLength: 0, opacity: 0 }
                          }
                          transition={{
                            duration: 0.9,
                            delay: 0.2 + i * 0.12,
                            ease: 'easeOut',
                          }}
                        />
                        {/* Animated packet flying along the path */}
                        <motion.circle
                          r={0.7}
                          fill="url(#packet-grad)"
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.4, delay: 1 + i * 0.12 }}
                        >
                          <animateMotion
                            dur="3.6s"
                            repeatCount="indefinite"
                            begin={`${0.6 + i * 0.35}s`}
                            path={d}
                            rotate="auto"
                          />
                        </motion.circle>
                      </g>
                    )
                  })}
                </svg>

                {NODES.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={
                      inView
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.85 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.05 + i * 0.08,
                      ease: 'easeOut',
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  >
                    <div
                      className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-2.5 py-1.5 sm:px-3 sm:py-2"
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <span
                        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 rounded-lg items-center justify-center shrink-0"
                        style={{ background: `${n.color}1F`, color: n.color }}
                      >
                        <n.Icon className="size-4" aria-hidden />
                      </span>
                      <div className="text-left min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-txt-primary leading-tight whitespace-nowrap">
                          {n.label}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-txt-tertiary leading-tight whitespace-nowrap hidden sm:block">
                          {n.sublabel}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend strip */}
              <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-[11px] text-txt-tertiary">
                <Fingerprint className="size-3" />
                Vote submitted
                <ArrowRight className="size-3" />
                <RadioTower className="size-3" />
                Kafka topic
                <ArrowRight className="size-3" />
                <Layers className="size-3" />
                Durable write
                <ArrowRight className="size-3" />
                <Database className="size-3" />
                Redis counters
                <ArrowRight className="size-3" />
                <Wifi className="size-3" />
                Live dashboard
              </div>
            </div>

            {/* Side panel: live story */}
            <div className="col-span-12 lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div
                className="rounded-xl border border-border bg-bg-elevated p-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-7 w-7 rounded-lg bg-success-bg text-success-text items-center justify-center">
                    <Zap className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-[11px] font-semibold text-txt-primary">
                    Ingest latency
                  </p>
                </div>
                <p className="text-xl font-semibold text-txt-primary tabular-nums">
                  &lt; 50ms
                </p>
                <p className="text-[10px] text-txt-tertiary">
                  vote → dashboard
                </p>
              </div>
              <div
                className="rounded-xl border border-border bg-bg-elevated p-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-7 w-7 rounded-lg bg-brand-bg text-brand-text items-center justify-center">
                    <BarChart3 className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-[11px] font-semibold text-txt-primary">
                    Replay-safe
                  </p>
                </div>
                <p className="text-xl font-semibold text-txt-primary tabular-nums">
                  DLQ
                </p>
                <p className="text-[10px] text-txt-tertiary">
                  one-click replay
                </p>
              </div>
              <div
                className="rounded-xl border border-border bg-bg-elevated p-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-7 w-7 rounded-lg bg-warning-bg text-warning-text items-center justify-center">
                    <Sparkles className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-[11px] font-semibold text-txt-primary">
                    AI summaries
                  </p>
                </div>
                <p className="text-xl font-semibold text-txt-primary tabular-nums">
                  5 / poll
                </p>
                <p className="text-[10px] text-txt-tertiary">
                  GPT-4o-mini · cached
                </p>
              </div>
              <div
                className="rounded-xl border border-border bg-bg-elevated p-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-7 w-7 rounded-lg bg-info-bg text-info-text items-center justify-center">
                    <Globe2 className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-[11px] font-semibold text-txt-primary">
                    Public API
                  </p>
                </div>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
                >
                  Swagger UI
                  <ArrowRight className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-bg-surface p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 rounded-xl bg-brand-bg text-brand-text items-center justify-center shrink-0">
                  <f.Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-txt-primary mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm text-txt-secondary leading-relaxed">
                    {f.body}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-bg border border-success-border text-success-text text-[11px] font-medium px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
                    {f.bullet}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </LandingContain>
    </section>
  )
}
