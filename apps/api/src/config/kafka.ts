import { Kafka, logLevel } from 'kafkajs'

export const kafka = new Kafka({
  clientId: 'pulseBoard-api',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  logLevel: logLevel.ERROR,
})

export const TOPICS = {
  RESPONSES: 'poll.responses',
  REALTIME: 'poll.realtime',
  ANALYTICS: 'poll.analytics',
  RESPONSES_DLQ: 'poll.responses.dlq',
} as const
