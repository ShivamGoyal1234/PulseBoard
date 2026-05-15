import { redis } from '../../config/redis'
import { kafka, TOPICS } from '../../config/kafka'
import { pollQueries } from '../../db/queries/polls'
import { analyticsQueries } from '../../db/queries/analytics'

interface OptionCountRow {
  question_id: string
  option_id: string
  count: number
}

interface DropRow {
  id: string
  text: string
  order: number
  answered: number
  total: number
}

interface TimelineRow {
  bucket: string | Date
  count: number
}

interface UniqueRow {
  count: number
}

export const analyticsService = {
  async getAnalytics(pollId: string) {
    const cacheKey = `analytics:${pollId}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached) as Record<string, unknown>

    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')

    const [{ count: totalResponses }] = await pollQueries.responseCount(pollId)
    const optionCountsResult = await pollQueries.optionCounts(pollId)
    const dropOffResult = await pollQueries.dropOffStats(pollId)
    const timeline = await pollQueries.velocityTimeline(pollId)

    const uniqueResult = await analyticsQueries.uniqueRespondents(pollId)

    const optionRows = optionCountsResult.rows as unknown as OptionCountRow[]
    const dropRows = dropOffResult.rows as unknown as DropRow[]
    const timelineRows = timeline.rows as unknown as TimelineRow[]
    const uniqueRows = uniqueResult.rows as unknown as UniqueRow[]

    const questionStats = poll.questions.map((q) => {
      const dropRow = dropRows.find((r) => r.id === q.id)
      const answered = dropRow?.answered ?? 0
      const completionRate =
        totalResponses > 0 ? Math.round((answered / totalResponses) * 100) : 0

      return {
        id: q.id,
        text: q.text,
        order: q.order,
        isRequired: q.isRequired,
        completionRate,
        options: q.options.map((o) => {
          const row = optionRows.find(
            (r) => r.question_id === q.id && r.option_id === o.id
          )
          const count = row?.count ?? 0
          return {
            id: o.id,
            text: o.text,
            count,
            percent:
              totalResponses > 0
                ? Math.round((count / totalResponses) * 100)
                : 0,
          }
        }),
      }
    })

    const completionRates = questionStats.map((q) => q.completionRate)
    const avgCompletion =
      completionRates.length > 0
        ? Math.round(
            completionRates.reduce((a, b) => a + b, 0) / completionRates.length
          )
        : 0
    const uniqueCount = uniqueRows[0]?.count ?? 0
    const uniqueRatio =
      totalResponses > 0
        ? Math.round((uniqueCount / totalResponses) * 100)
        : 100
    const daysActive = Math.max(
      1,
      (Date.now() - new Date(poll.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    const velocityScore = Math.min(
      100,
      Math.round((totalResponses / daysActive) * 10)
    )
    const healthScore = Math.round(
      avgCompletion * 0.4 + uniqueRatio * 0.3 + velocityScore * 0.3
    )

    const mappedTimeline = timelineRows.map((r) => {
      const bucket =
        r.bucket instanceof Date ? r.bucket.toISOString() : String(r.bucket)
      return { bucket, count: r.count }
    })

    const result = {
      totalResponses,
      uniqueRespondents: uniqueCount,
      completionRate: avgCompletion,
      healthScore,
      questionStats,
      timeline: mappedTimeline,
    }

    await redis.setex(cacheKey, 30, JSON.stringify(result))
    return result
  },

  async dlqOffsetEstimate(): Promise<{ failed: number }> {
    const admin = kafka.admin()
    await admin.connect()
    const offsets = await admin.fetchTopicOffsets(TOPICS.RESPONSES_DLQ)
    await admin.disconnect()
    const failed = offsets.reduce(
      (sum, p) => sum + (Number(p.high) - Number(p.low)),
      0
    )
    return { failed }
  },
}
