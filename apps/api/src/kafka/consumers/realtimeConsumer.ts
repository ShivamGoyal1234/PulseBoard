import { kafka, TOPICS } from '../../config/kafka'
import { getIO } from '../../socket'

export async function startRealtimeConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'pulseBoard-realtime-broadcaster' })
  await consumer.connect()
  await consumer.subscribe({ topic: TOPICS.REALTIME, fromBeginning: false })

  void consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return
      try {
        const payload = JSON.parse(message.value.toString()) as {
          pollId: string
          totalCount: number
          questionStats: Record<string, Record<string, number>>
          timestamp: string
        }

        const io = getIO()
        io.to(`poll:${payload.pollId}`).emit('analytics:update', {
          totalResponses: payload.totalCount,
          questionStats: payload.questionStats,
        })
        io.to(`poll:${payload.pollId}`).emit('response:new', {
          count: payload.totalCount,
          respondedAt: payload.timestamp,
        })
      } catch (err) {
        console.error('[Kafka] realtime consumer error:', err)
      }
    },
  })

  console.log('[Kafka] realtime consumer run loop started')
}
