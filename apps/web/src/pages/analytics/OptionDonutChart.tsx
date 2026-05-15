import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'

interface OptionRow {
  id: string
  text: string
  count: number
  percent: number
}

interface OptionDonutChartProps {
  options: OptionRow[]
  /** Big number rendered in the middle (typically total responses for the question). */
  centerLabel?: string
  centerSubLabel?: string
  height?: number
}

export function OptionDonutChart({
  options,
  centerLabel,
  centerSubLabel = 'responses',
  height = 220,
}: OptionDonutChartProps) {
  const { theme } = useTheme()
  const t = tokens[theme]

  const total = options.reduce((acc, o) => acc + o.count, 0)
  const data = options.map((o) => ({ ...o, value: o.count }))

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-txt-tertiary"
        style={{ height }}
      >
        No responses yet
      </div>
    )
  }

  return (
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
              const row = item.payload as OptionRow
              return [
                `${row.count.toLocaleString()} (${row.percent}%)`,
                row.text,
              ]
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationDuration={900}
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

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold text-txt-primary tabular-nums leading-none">
          {centerLabel ?? total.toLocaleString()}
        </p>
        <p className="text-[11px] text-txt-tertiary mt-1">{centerSubLabel}</p>
      </div>
    </div>
  )
}

interface DonutLegendProps {
  options: OptionRow[]
}

export function DonutLegend({ options }: DonutLegendProps) {
  const { theme } = useTheme()
  const t = tokens[theme]
  return (
    <ul className="space-y-2 mt-3">
      {options.map((o, idx) => (
        <li
          key={o.id}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: t.chart[idx % t.chart.length] }}
            />
            <span className="text-txt-secondary truncate">{o.text}</span>
          </span>
          <span className="text-txt-primary tabular-nums font-medium shrink-0">
            {o.percent}%
          </span>
        </li>
      ))}
    </ul>
  )
}
