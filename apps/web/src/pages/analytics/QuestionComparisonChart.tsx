import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'
import type { QuestionStat } from '../../types'

type Mode = 'votes' | 'completion'

interface QuestionComparisonChartProps {
  questions: QuestionStat[]
  height?: number
}

function truncate(label: string, max = 20) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0].payload as {
    full: string
    votes: number
    completion: number
  }
  return (
    <div
      className="rounded-lg border border-border bg-bg-elevated px-3 py-2 max-w-xs"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <p className="text-xs font-medium text-txt-primary leading-snug mb-1">
        {row.full}
      </p>
      <p className="text-[11px] text-txt-secondary tabular-nums">
        {row.votes.toLocaleString()} votes ·{' '}
        <span className="text-success-text font-semibold">
          {row.completion}%
        </span>{' '}
        completion
      </p>
    </div>
  )
}

/**
 * Vertical bar chart comparing all questions in one view.
 * Two modes: total votes per question or completion rate per question.
 */
export function QuestionComparisonChart({
  questions,
  height = 260,
}: QuestionComparisonChartProps) {
  const { theme } = useTheme()
  const t = tokens[theme]
  const [mode, setMode] = useState<Mode>('votes')

  const data = useMemo(
    () =>
      [...questions]
        .sort((a, b) => a.order - b.order)
        .map((q, idx) => {
          const total = q.options.reduce((acc, o) => acc + o.count, 0)
          return {
            id: q.id,
            label: `Q${idx + 1}`,
            full: q.text,
            votes: total,
            completion: q.completionRate,
            value: mode === 'votes' ? total : q.completionRate,
          }
        }),
    [questions, mode]
  )

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const maxId = data.reduce((acc, d) => (d.value > acc.v ? { id: d.id, v: d.value } : acc), {
    id: '',
    v: -1,
  }).id

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-txt-primary">
            Question performance
          </h2>
          <p className="text-xs text-txt-tertiary mt-0.5">
            {mode === 'votes'
              ? 'Total votes received per question'
              : 'Completion rate per question'}
          </p>
        </div>
        <div
          className="inline-flex rounded-lg p-0.5 bg-bg-subtle border border-border text-xs"
          role="tablist"
          aria-label="Comparison metric"
        >
          {(['votes', 'completion'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === m
                  ? 'bg-bg-elevated text-txt-primary shadow-sm'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              {m === 'votes' ? 'Votes' : 'Completion'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 8, bottom: 0, left: -10 }}
            barCategoryGap={12}
          >
            <defs>
              <linearGradient id="qc-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.chart[0]} stopOpacity={1} />
                <stop offset="100%" stopColor={t.chart[0]} stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="qc-bar-leader" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.chart[5]} stopOpacity={1} />
                <stop offset="100%" stopColor={t.chart[0]} stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={t.borderDefault}
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke={t.textTertiary}
              tick={{ fill: t.textTertiary, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: t.borderDefault }}
            />
            <YAxis
              stroke={t.textTertiary}
              tick={{ fill: t.textTertiary, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
              domain={mode === 'completion' ? [0, 100] : [0, Math.ceil(maxValue * 1.1)]}
              tickFormatter={(v) =>
                mode === 'completion' ? `${v}%` : String(v)
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: t.bgSubtle, opacity: 0.4 }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              animationDuration={900}
            >
              {data.map((row) => (
                <Cell
                  key={row.id}
                  fill={row.id === maxId ? 'url(#qc-bar-leader)' : 'url(#qc-bar)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / labels */}
      <ul className="space-y-1 text-[11px] text-txt-secondary">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2 truncate">
            <span
              className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                d.id === maxId ? '' : 'opacity-60'
              }`}
              style={{
                background: d.id === maxId ? t.chart[5] : t.chart[0],
              }}
              aria-hidden
            />
            <span className="font-medium text-txt-primary tabular-nums shrink-0">
              {d.label}
            </span>
            <span className="truncate flex-1" title={d.full}>
              {truncate(d.full, 60)}
            </span>
            <span className="text-txt-tertiary tabular-nums shrink-0">
              {mode === 'votes'
                ? d.votes.toLocaleString()
                : `${d.completion}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
