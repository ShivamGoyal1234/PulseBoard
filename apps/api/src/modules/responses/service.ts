import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { polls, responses, answers } from '../../db/schema'
import { pollQueries } from '../../db/queries/polls'
import { redis } from '../../config/redis'
import { producer, TOPICS } from '../../kafka/producer'

interface SubmitInput {
  pollId: string
  fingerprint?: string
  responderId?: string
  answers: { questionId: string; optionId: string }[]
  timeToComplete?: number
}

export const responseService = {
  async submit(input: SubmitInput) {
    const {
      pollId,
      fingerprint,
      responderId,
      answers: answerInputs,
      timeToComplete,
    } = input

    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')

    if (pollQueries.isExpired(poll)) {
      await db
        .update(polls)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(polls.id, pollId))
      throw new Error('POLL_EXPIRED')
    }

    const requiredIds = poll.questions.filter((q) => q.isRequired).map((q) => q.id)
    const answeredIds = answerInputs.map((a) => a.questionId)
    const missing = requiredIds.filter((id) => !answeredIds.includes(id))
    if (missing.length > 0) {
      const err = new Error('VALIDATION_ERROR') as Error & { missing: string[] }
      err.missing = missing
      throw err
    }

    for (const ans of answerInputs) {
      const question = poll.questions.find((q) => q.id === ans.questionId)
      if (!question) throw new Error('VALIDATION_ERROR')
      const validOption = question.options.find((o) => o.id === ans.optionId)
      if (!validOption) throw new Error('VALIDATION_ERROR')
    }

    if (fingerprint && fingerprint.length > 0) {
      const fpKey = `fp:${pollId}:${fingerprint}`
      const set = await redis.set(fpKey, '1', 'EX', 86400, 'NX')
      if (set === null) throw new Error('ALREADY_RESPONDED')
    }

    if (!poll.isAnonymous && !responderId) {
      throw new Error('UNAUTHORIZED')
    }

    const [response] = await db.transaction(async (tx) => {
      const [resp] = await tx
        .insert(responses)
        .values({
          pollId,
          responderId: responderId ?? null,
          fingerprint: fingerprint ?? null,
          timeToComplete: timeToComplete ?? null,
        })
        .returning()

      await tx.insert(answers).values(
        answerInputs.map((a) => ({
          responseId: resp.id,
          questionId: a.questionId,
          optionId: a.optionId,
        }))
      )

      return [resp]
    })

    await producer.send({
      topic: TOPICS.RESPONSES,
      messages: [
        {
          key: pollId,
          value: JSON.stringify({
            pollId,
            responseId: response.id,
            fingerprint,
            questionAnswers: answerInputs,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    })

    return {
      responseId: response.id,
      showResults: poll.showResults && poll.isPublished,
      pollId,
    }
  },
}
