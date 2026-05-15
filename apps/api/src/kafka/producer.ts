import { kafka } from '../config/kafka'
import { TOPICS } from '../config/kafka'

export const producer = kafka.producer({
  allowAutoTopicCreation: true,
  idempotent: true,
})

export async function connectProducer(): Promise<void> {
  await producer.connect()
  console.log('[Kafka] producer connected')
}

export { TOPICS }
