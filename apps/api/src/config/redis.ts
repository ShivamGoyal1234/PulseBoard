import { Redis } from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: false,
})

redis.on('error', (err) => console.error('[Redis]', err.message))
redis.on('connect', () => console.log('[Redis] connected'))
