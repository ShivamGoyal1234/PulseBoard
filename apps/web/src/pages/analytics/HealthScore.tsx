import { useEffect, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { tokens } from '../../design/tokens'

interface HealthScoreProps {
  score: number
  size?: number
}

function healthLabel(score: number) {
  if (score >= 80) return { tone: 'Excellent', color: 'text-success-text' }
  if (score >= 60) return { tone: 'Healthy', color: 'text-success-text' }
  if (score >= 40) return { tone: 'Mixed signal', color: 'text-warning-text' }
  return { tone: 'Needs attention', color: 'text-danger-text' }
}

export function HealthScore({ score, size = 160 }: HealthScoreProps) {
  const { theme } = useTheme()
  const t = tokens[theme]

  // Animate the displayed number when score changes.
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const duration = 900
    const start = performance.now()
    let raf = 0
    const initial = shown
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - p) ** 3
      setShown(Math.round(initial + (score - initial) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score])

  const stroke = 10
  const radius = (size - stroke * 2) / 2
  const c = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = c * (1 - clamped / 100)

  const gradient =
    clamped >= 70
      ? ['#10B981', '#34D399']
      : clamped >= 40
        ? ['#F59E0B', '#FBBF24']
        : ['#DC2626', '#F87171']

  const label = healthLabel(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <defs>
            <linearGradient id="health-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
            <filter id="health-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={t.bgSubtle}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#health-grad)"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter="url(#health-glow)"
            style={{
              transition:
                'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-semibold tabular-nums text-txt-primary leading-none">
            {shown}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-txt-tertiary mt-1">
            / 100
          </p>
        </div>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${label.color}`}>{label.tone}</p>
        <p className="text-xs text-txt-tertiary max-w-[200px] mt-1 leading-relaxed">
          Blends completion, uniqueness and velocity.
        </p>
      </div>
    </div>
  )
}
