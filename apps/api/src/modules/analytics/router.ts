import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { analyticsService } from './service'
import { pollQueries } from '../../db/queries/polls'
import { pollService } from '../polls/service'
import { kafka, TOPICS } from '../../config/kafka'
import { producer } from '../../kafka/producer'

const router = Router()

async function assertOwner(pollId: string, userId: string) {
  const poll = await pollQueries.findById(pollId)
  if (!poll) throw new Error('NOT_FOUND')
  if (poll.creatorId !== userId) throw new Error('FORBIDDEN')
  return poll
}

router.get('/:id/analytics', requireAuth, async (req, res, next) => {
  try {
    await assertOwner(req.params.id, req.user!.id)
    const data = await analyticsService.getAnalytics(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/results', async (req, res, next) => {
  try {
    const poll = await pollQueries.findById(req.params.id)
    if (!poll) throw new Error('NOT_FOUND')
    if (!poll.isPublished) {
      res.status(403).json({ error: 'Results not yet published' })
      return
    }
    const data = await analyticsService.getAnalytics(req.params.id)
    res.json({
      ...data,
      poll: { title: poll.title, description: poll.description },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/insights', requireAuth, async (req, res, next) => {
  try {
    await assertOwner(req.params.id, req.user!.id)
    const force =
      req.query.force === 'true' ||
      req.query.force === '1' ||
      req.query.refresh === 'true'
    const insight = await pollService.getInsights(req.params.id, force)
    res.json({ insight })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/dlq-stats', requireAuth, async (req, res, next) => {
  try {
    await assertOwner(req.params.id, req.user!.id)
    const { failed } = await analyticsService.dlqOffsetEstimate()
    res.json({ processed: 0, failed, pending: 0 })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/dlq-replay', requireAuth, async (req, res, next) => {
  try {
    await assertOwner(req.params.id, req.user!.id)
    const pollId = req.params.id

    const consumer = kafka.consumer({
      groupId: `dlq-replay-${Date.now()}`,
    })
    await consumer.connect()
    await consumer.subscribe({
      topic: TOPICS.RESPONSES_DLQ,
      fromBeginning: true,
    })

    let replayed = 0

    const runPromise = consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return
        try {
          const payload = JSON.parse(message.value.toString()) as {
            pollId?: string
            original?: {
              pollId: string
              responseId: string
              fingerprint?: string
              questionAnswers: { questionId: string; optionId: string }[]
              timestamp: string
            }
          }
          if (payload.pollId !== pollId || !payload.original) return
          await producer.send({
            topic: TOPICS.RESPONSES,
            messages: [
              {
                key: payload.pollId,
                value: JSON.stringify(payload.original),
              },
            ],
          })
          replayed++
        } catch {
          /* skip malformed */
        }
      },
    })

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          await consumer.disconnect()
        } catch {
          /* ignore */
        }
        resolve()
      }, 2500)
    })

    await runPromise.catch(() => undefined)

    res.json({ replayed })
  } catch (err) {
    next(err)
  }
})

export default router
