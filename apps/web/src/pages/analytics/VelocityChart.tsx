import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format, isToday } from 'date-fns'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'

interface VelocityChartProps {
  data: { bucket: string; count: number }[]
  height?: number
}

function formatBucket(bucket: string) {
  const d = new Date(bucket)
  return isToday(d) ? format(d, 'HH:mm') : format(d, 'MMM d')
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0].value as number
  return (
    <div
      className="rounded-lg border border-border bg-bg-elevated px-3 py-2"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <p className="text-[11px] text-txt-tertiary mb-0.5">{String(label)}</p>
      <p className="text-sm font-semibold text-txt-primary tabular-nums">
        {value.toLocaleString()}
        <span className="text-xs text-txt-tertiary ml-1 font-normal">
          responses
        </span>
      </p>
    </div>
  )
}

export function VelocityChart({ data, height = 220 }: VelocityChartProps) {
  const { theme } = useTheme()
  const t = tokens[theme]

  const chartData = data.map((row) => ({
    ...row,
    label: formatBucket(row.bucket),
  }))

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-txt-tertiary"
        style={{ height }}
      >
        Waiting for responses…
      </div>
    )
  }

  const lastValue = chartData[chartData.length - 1]?.count ?? 0

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 8, bottom: 0, left: -10 }}
        >
          <defs>
            <linearGradient id="velocity-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.chart[0]} stopOpacity={0.35} />
              <stop offset="50%" stopColor={t.chart[0]} stopOpacity={0.12} />
              <stop offset="100%" stopColor={t.chart[0]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="velocity-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={t.chart[0]} />
              <stop offset="100%" stopColor={t.chart[5]} />
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
            minTickGap={20}
          />
          <YAxis
            stroke={t.textTertiary}
            tick={{ fill: t.textTertiary, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: t.borderStrong,
              strokeDasharray: '3 3',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="url(#velocity-line)"
            strokeWidth={2.5}
            fill="url(#velocity-area)"
            animationDuration={900}
            activeDot={{
              r: 5,
              stroke: t.bgElevated,
              strokeWidth: 2,
              fill: t.chart[0],
            }}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="sr-only">Latest bucket: {lastValue} responses</p>
    </div>
  )
}
