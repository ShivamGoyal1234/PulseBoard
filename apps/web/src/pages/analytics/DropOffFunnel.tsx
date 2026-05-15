import type { QuestionStat } from '../../types'

interface DropOffFunnelProps {
  stats: QuestionStat[]
}

export function DropOffFunnel({ stats }: DropOffFunnelProps) {
  const sorted = [...stats].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-txt-primary">
        Completion funnel
      </h3>
      <div className="space-y-2">
        {sorted.map((q, idx) => {
          const prev = idx > 0 ? sorted[idx - 1] : null
          const drop =
            prev && prev.completionRate > 0
              ? prev.completionRate - q.completionRate
              : 0
          const width = Math.min(100, Math.max(0, q.completionRate))
          const barColor =
            width >= 80
              ? 'bg-success-text'
              : width >= 50
                ? 'bg-warning-text'
                : 'bg-danger-text'
          const highlightDrop = drop > 20
          return (
            <div key={q.id} className="space-y-1">
              <div className="flex justify-between text-xs text-txt-secondary">
                <span className="truncate pr-2">{q.text}</span>
                <span>{q.completionRate}%</span>
              </div>
              <div
                className={`h-2 rounded-full bg-bg-subtle border border-border overflow-hidden ${
                  highlightDrop ? 'ring-1 ring-warning-border' : ''
                }`}
                title={`${q.completionRate}% of respondents answered this question`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
