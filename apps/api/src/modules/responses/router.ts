import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { validate } from '../../middleware/validate'
import { submitRateLimiter } from '../../middleware/rateLimiter'
import { submitResponseSchema } from './schema'
import { responseService } from './service'

const router = Router()

router.post(
  '/:id/responses',
  submitRateLimiter,
  validate(submitResponseSchema),
  async (req, res, next) => {
    try {
      const pollId = req.params.id
      const fingerprintHeader = req.headers['x-fingerprint']
      const fingerprint =
        typeof fingerprintHeader === 'string' && fingerprintHeader.length > 0
          ? fingerprintHeader
          : undefined
      const authHeader = req.headers.authorization
      let responderId: string | undefined

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const payload = jwt.verify(
            authHeader.slice(7),
            process.env.JWT_ACCESS_SECRET!
          ) as { sub: string }
          responderId = payload.sub
        } catch {
          /* anonymous fallback */
        }
      }

      const body = req.body as {
        answers: { questionId: string; optionId: string }[]
        timeToComplete?: number
      }

      const result = await responseService.submit({
        pollId,
        fingerprint,
        responderId,
        answers: body.answers,
        timeToComplete: body.timeToComplete,
      })

      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

export default router
