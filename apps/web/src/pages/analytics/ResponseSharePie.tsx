import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'
import type { QuestionStat } from '../../types'

interface ResponseSharePieProps {
  questions: QuestionStat[]
  /** Initial question id to display (defaults to the first question). */
  defaultQuestionId?: string
  height?: number
}

interface PieRow {
  id: string
  text: string
  count: number
  percent: number
}

function truncate(label: string, max = 22) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

/**
 * A proper pie chart (not donut) with an interactive active slice that
 * pops out on hover, a center summary, and a chip-style question switcher.
 */
export function ResponseSharePie({
  questions,
  defaultQuestionId,
  height = 280,
}: ResponseSharePieProps) {
  const { theme } = useTheme()
  const t = tokens[theme]

  const ordered = useMemo(
    () => [...questions].sort((a, b) => a.order - b.order),
    [questions]
  )

  const [activeQId, setActiveQId] = useState<string>(
    defaultQuestionId ?? ordered[0]?.id ?? ''
  )

  const activeQ = ordered.find((q) => q.id === activeQId) ?? ordered[0]

  const data: PieRow[] = useMemo(() => {
    if (!activeQ) return []
    return activeQ.options.map((o) => ({
      id: o.id,
      text: o.text,
      count: o.count,
      percent: o.percent,
    }))
  }, [activeQ])

  const total = data.reduce((acc, r) => acc + r.count, 0)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const winnerIdx =
    data.length > 0
      ? data.reduce(
          (best, _r, i) => (data[i].count > data[best].count ? i : best),
          0
        )
      : -1

  const highlightIdx = hoverIdx ?? winnerIdx
  const highlight = highlightIdx >= 0 ? data[highlightIdx] : null

  if (!activeQ) {
    return (
      <div className="text-xs text-txt-tertiary text-center py-8">
        No questions yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-txt-primary">
            Vote share
          </h2>
          <p className="text-xs text-txt-tertiary mt-0.5 truncate">
            {activeQ.text}
          </p>
        </div>

        {/* Question switcher */}
        {ordered.length > 1 ? (
          <div className="flex gap-1 flex-wrap">
            {ordered.map((q, idx) => {
              const active = q.id === activeQ.id
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setActiveQId(q.id)
                    setHoverIdx(null)
                  }}
                  aria-pressed={active}
                  title={q.text}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${
                    active
                      ? 'bg-brand-bg text-brand-text border-brand/30'
                      : 'bg-bg-elevated text-txt-secondary border-border hover:border-border-strong'
                  }`}
                >
                  Q{idx + 1}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {total === 0 ? (
        <div
          className="flex items-center justify-center text-xs text-txt-tertiary"
          style={{ height }}
        >
          No responses on this question yet
        </div>
      ) : (
        <>
          <div className="relative w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: t.bgElevated,
                    border: `1px solid ${t.borderDefault}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: t.textPrimary,
                    boxShadow: t.shadowMd,
                  }}
                  formatter={(_v, _n, item) => {
                    const row = item.payload as PieRow
                    return [
                      `${row.count.toLocaleString()} (${row.percent}%)`,
                      row.text,
                    ]
                  }}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="text"
                  outerRadius="80%"
                  innerRadius={0}
                  stroke={t.bgElevated}
                  strokeWidth={3}
                  paddingAngle={2}
                  activeIndex={highlightIdx}
                  activeShape={(props: unknown) => {
                    const p = props as {
                      cx: number
                      cy: number
                      innerRadius: number
                      outerRadius: number
                      startAngle: number
                      endAngle: number
                      fill: string
                    }
                    return (
                      <Sector
                        cx={p.cx}
                        cy={p.cy}
                        innerRadius={p.innerRadius}
                        outerRadius={p.outerRadius + 8}
                        startAngle={p.startAngle}
                        endAngle={p.endAngle}
                        fill={p.fill}
                      />
                    )
                  }}
                  onMouseEnter={(_e, idx) => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  animationDuration={800}
                >
                  {data.map((row, idx) => (
                    <Cell
                      key={row.id}
                      fill={t.chart[idx % t.chart.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center summary card (overlapping the pie corner so it doesn't block) */}
            {highlight ? (
              <div className="pointer-events-none absolute top-2 left-2 max-w-[55%]">
                <div
                  className="rounded-lg border border-border bg-bg-elevated/80 backdrop-blur px-2.5 py-1.5"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <p className="text-[10px] text-txt-tertiary uppercase tracking-wider truncate">
                    {hoverIdx !== null ? 'Hover' : 'Leading'}
                  </p>
                  <p
                    className="text-xs font-semibold text-txt-primary truncate"
                    title={highlight.text}
                  >
                    {truncate(highlight.text, 24)}
                  </p>
                  <p className="text-base font-bold tabular-nums leading-none mt-0.5">
                    {highlight.percent}%
                    <span className="text-[10px] font-normal text-txt-tertiary ml-1">
                      {highlight.count.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Legend with hover sync */}
          <ul className="grid grid-cols-1 gap-1.5 text-[11px]">
            {data.map((row, idx) => (
              <li
                key={row.id}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className={`flex items-center gap-2 px-1.5 py-1 rounded-md cursor-default transition-colors ${
                  idx === highlightIdx ? 'bg-bg-subtle' : ''
                }`}
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: t.chart[idx % t.chart.length] }}
                />
                <span
                  className="text-txt-secondary truncate flex-1"
                  title={row.text}
                >
                  {row.text}
                </span>
                <span className="text-txt-primary font-medium tabular-nums">
                  {row.percent}%
                </span>
                <span className="text-txt-tertiary tabular-nums w-12 text-right">
                  {row.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
