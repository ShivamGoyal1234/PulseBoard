import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { pollsApi } from '../../api/polls'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'

interface DLQPanelProps {
  pollId: string
}

export function DLQPanel({ pollId }: DLQPanelProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dlq', pollId],
    queryFn: () => pollsApi.getDLQStats(pollId),
    refetchInterval: 60_000,
  })

  const replay = async () => {
    try {
      const res = await pollsApi.replayDLQ(pollId)
      toast.success(`Replayed ${res.replayed} events`)
      void refetch()
    } catch {
      toast.error('Replay failed')
    }
  }

  if (isLoading || !data) {
    return <Skeleton variant="card" />
  }

  const healthy = data.failed === 0

  return (
    <div className="border border-border rounded-lg p-4 bg-bg-surface">
      <h3 className="text-sm font-semibold text-txt-primary mb-3">
        Event queue health
      </h3>
      {healthy ? (
        <div className="flex items-center gap-2 text-sm text-success-text">
          <CheckCircle2 size={18} aria-hidden />
          All events processed
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-warning-text">
            <AlertTriangle size={18} aria-hidden />
            <span>
              {data.failed} failed event{data.failed === 1 ? '' : 's'} in DLQ
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            aria-label="Retry failed events"
            onClick={() => void replay()}
          >
            Retry failed events
          </Button>
        </div>
      )}
    </div>
  )
}
