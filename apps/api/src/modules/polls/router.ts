import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../middleware/auth'
import { aiGenerateRateLimiter } from '../../middleware/rateLimiter'
import { validate } from '../../middleware/validate'
import { createPollSchema, updatePollSchema } from './schema'
import { pollService } from './service'
import { pollQueries } from '../../db/queries/polls'
import { db } from '../../db'
import { polls } from '../../db/schema'

const router = Router()

function stripPollForPublic<
  T extends {
    creatorId: string
    questions?: unknown
  },
>(poll: T) {
  const { creatorId: _c, ...rest } = poll
  return rest
}

router.post('/', requireAuth, validate(createPollSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id
    const poll = await pollService.createPoll(userId, req.body)
    res.status(201).json(poll)
  } catch (err) {
    next(err)
  }
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const list = await pollQueries.findByCreator(userId)
    const withCounts = await Promise.all(
      list.map(async (p) => {
        const [row] = await pollQueries.responseCount(p.id)
        return { ...p, responseCount: row.count }
      })
    )
    res.json({ polls: withCounts })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const poll = await pollQueries.findById(req.params.id)
    if (!poll) {
      next(new Error('NOT_FOUND'))
      return
    }

    if (poll.isActive && poll.expiresAt < new Date()) {
      await db
        .update(polls)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(polls.id, poll.id))
      poll.isActive = false
    }

    res.json(stripPollForPublic(poll))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAuth, validate(updatePollSchema), async (req, res, next) => {
  try {
    const poll = await pollService.updatePoll(req.params.id, req.user!.id, req.body)
    res.json(poll)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await pollService.deletePoll(req.params.id, req.user!.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

router.post('/:id/publish', requireAuth, async (req, res, next) => {
  try {
    const poll = await pollService.publishPoll(req.params.id, req.user!.id)
    res.json(poll)
  } catch (err) {
    next(err)
  }
})

router.post('/generate', requireAuth, aiGenerateRateLimiter, async (req, res, next) => {
  try {
    const prompt =
      typeof req.body?.prompt === 'string' ? req.body.prompt : ''
    const draft = await pollService.generateDraft(prompt)
    res.json(draft)
  } catch (err) {
    next(err)
  }
})

export default router
