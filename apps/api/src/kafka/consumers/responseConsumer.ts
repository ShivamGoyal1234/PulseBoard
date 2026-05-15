import { kafka, TOPICS } from '../../config/kafka'
import { redis } from '../../config/redis'
import { producer } from '../producer'

interface ResponsePayload {
  pollId: string
  responseId: string
  fingerprint?: string
  questionAnswers: { questionId: string; optionId: string }[]
  timestamp: string
}

export async function startResponseConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'pulseBoard-response-processor' })
  await consumer.connect()
  await consumer.subscribe({ topic: TOPICS.RESPONSES, fromBeginning: false })

  void consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return

      let payload: ResponsePayload
      try {
        payload = JSON.parse(message.value.toString()) as ResponsePayload
      } catch {
        return
      }

      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          const { pollId, questionAnswers } = payload

          await redis.incr(`poll:${pollId}:count`)

          for (const { questionId, optionId } of questionAnswers) {
            await redis.incr(
              `poll:${pollId}:q:${questionId}:opt:${optionId}`
            )
          }

          await redis.del(`analytics:${pollId}`)

          const allKeys = await redis.keys(`poll:${pollId}:q:*:opt:*`)
          const mvals = allKeys.length
            ? await redis.mget(...allKeys)
            : []
          const questionStats: Record<string, Record<string, number>> = {}
          for (let i = 0; i < allKeys.length; i++) {
            const key = allKeys[i]
            const val = mvals[i]
            const count = parseInt(val ?? '0', 10)
            const match = key.match(
              new RegExp(`^poll:${pollId}:q:([^:]+):opt:([^:]+)$`)
            )
            if (!match) continue
            const qid = match[1]
            const oid = match[2]
            if (!questionStats[qid]) questionStats[qid] = {}
            questionStats[qid][oid] = count
          }

          const totalCountStr = await redis.get(`poll:${pollId}:count`)
          const totalCount = parseInt(totalCountStr ?? '0', 10)

          await producer.send({
            topic: TOPICS.REALTIME,
            messages: [
              {
                key: pollId,
                value: JSON.stringify({
                  pollId,
                  totalCount,
                  questionStats,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          })

          break
        } catch (err) {
          attempts++
          if (attempts === maxAttempts) {
            await producer.send({
              topic: TOPICS.RESPONSES_DLQ,
              messages: [
                {
                  key: payload.pollId,
                  value: JSON.stringify({
                    pollId: payload.pollId,
                    original: payload,
                    error: (err as Error).message,
                    failedAt: new Date().toISOString(),
                  }),
                },
              ],
            })
            console.error(
              '[Kafka] message sent to DLQ after',
              maxAttempts,
              'attempts'
            )
          } else {
            await new Promise((r) => setTimeout(r, 200 * attempts))
          }
        }
      }
    },
  })

  console.log('[Kafka] response consumer run loop started')
}
