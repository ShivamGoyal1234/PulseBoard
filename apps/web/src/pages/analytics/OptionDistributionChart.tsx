import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Trophy } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'

interface OptionRow {
  id: string
  text: string
  count: number
  percent: number
}

interface OptionDistributionChartProps {
  options: OptionRow[]
  /** Highlight the bar with the highest count using the brand gradient. */
  showWinner?: boolean
  height?: number
}

function truncate(label: string, max = 28) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

export function OptionDistributionChart({
  options,
  showWinner = true,
  height,
}: OptionDistributionChartProps) {
  const { theme } = useTheme()
  const t = tokens[theme]

  const max = Math.max(...options.map((o) => o.count), 0)
  const winnerId = useMemo(() => {
    if (!showWinner || max <= 0) return null
    return options.find((o) => o.count === max)?.id ?? null
  }, [options, max, showWinner])

  const data = options.map((o) => ({
    ...o,
    label: truncate(o.text),
  }))

  const computedHeight =
    height ?? Math.max(110, options.length * 44 + 24)

  return (
    <div className="w-full" style={{ height: computedHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 0, left: 0 }}
          barCategoryGap={10}
        >
          <defs>
            <linearGradient id="opt-bar-winner" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={t.chart[0]} stopOpacity={0.95} />
              <stop offset="100%" stopColor={t.chart[5]} stopOpacity={0.95} />
            </linearGradient>
            <linearGradient id="opt-bar-default" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={t.chart[0]} stopOpacity={0.55} />
              <stop offset="100%" stopColor={t.chart[0]} stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <XAxis type="number" hide domain={[0, max > 0 ? max : 1]} />
          <YAxis
            type="category"
            dataKey="label"
            width={170}
            tick={{ fill: t.textSecondary, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: t.borderDefault }}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: t.bgSubtle, opacity: 0.4 }}
            contentStyle={{
              background: t.bgElevated,
              border: `1px solid ${t.borderDefault}`,
              borderRadius: 8,
              fontSize: 12,
              color: t.textPrimary,
              boxShadow: t.shadowMd,
            }}
            formatter={(_v, _n, item) => {
              const row = item.payload as OptionRow
              return [
                `${row.count.toLocaleString()} (${row.percent}%)`,
                'Responses',
              ]
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as OptionRow | undefined
              return row?.text ?? ''
            }}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 8, 8]}
            animationDuration={1000}
            isAnimationActive
          >
            {data.map((row) => {
              const isWinner = row.id === winnerId
              return (
                <Cell
                  key={row.id}
                  fill={isWinner ? 'url(#opt-bar-winner)' : 'url(#opt-bar-default)'}
                />
              )
            })}
            <LabelList
              dataKey="percent"
              position="right"
              formatter={(v: unknown) =>
                typeof v === 'number' ? `${v}%` : ''
              }
              fill={t.textPrimary}
              fontSize={12}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {winnerId ? (
        <div
          className="sr-only"
          aria-live="polite"
        >
          <Trophy aria-hidden /> Leading option highlighted
        </div>
      ) : null}
    </div>
  )
}
