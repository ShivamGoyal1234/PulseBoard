import 'dotenv/config'
import { loadEnv } from './config/env'
import express from 'express'

loadEnv()
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { and, eq, lt } from 'drizzle-orm'
import passport from './config/passport'
import { initSocket } from './socket'
import { connectProducer, producer } from './kafka/producer'
import authRouter from './modules/auth/router'
import pollsRouter from './modules/polls/router'
import responsesRouter from './modules/responses/router'
import analyticsRouter from './modules/analytics/router'
import ogRouter from './modules/og/router'
import { setupSwagger } from './swagger'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { db } from './db'
import { polls } from './db/schema'
import { startResponseConsumer } from './kafka/consumers/responseConsumer'
import { startRealtimeConsumer } from './kafka/consumers/realtimeConsumer'

async function bootstrap(): Promise<void> {
  const app = express()
  const server = http.createServer(app)

  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_URL!, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())
  app.use(passport.initialize())
  app.use(rateLimiter)

  app.use('/api/auth', authRouter)
  app.use('/api/polls', pollsRouter)
  app.use('/api/polls', responsesRouter)
  app.use('/api/polls', analyticsRouter)
  app.use(ogRouter)

  setupSwagger(app)

  app.use(errorHandler)

  initSocket(server)
  await connectProducer()

  await startResponseConsumer()
  await startRealtimeConsumer()

  setInterval(() => {
    void db
      .update(polls)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(polls.isActive, true), lt(polls.expiresAt, new Date())))
  }, 60_000)

  const PORT = process.env.PORT ?? '3001'
  server.listen(Number(PORT), () => {
    console.log(`API running on :${PORT}`)
  })

  const shutdown = async () => {
    try {
      await producer.disconnect()
      server.close()
      process.exit(0)
    } catch {
      process.exit(1)
    }
  }

  process.on('SIGINT', () => void shutdown())
  process.on('SIGTERM', () => void shutdown())
}

bootstrap().catch(console.error)
