import 'dotenv/config'
import path from 'node:path'
import http from 'http'
import { loadEnv } from './config/env'
import express from 'express'
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
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './db'
import { polls } from './db/schema'
import { startResponseConsumer } from './kafka/consumers/responseConsumer'
import { startRealtimeConsumer } from './kafka/consumers/realtimeConsumer'

async function bootstrap(): Promise<void> {
  loadEnv()
  const migrationsFolder = path.join(__dirname, '../drizzle')
  await migrate(db, { migrationsFolder })

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

  const PORT = process.env.PORT ?? '3001'
  await new Promise<void>((resolve, reject) => {
    server.listen(Number(PORT), () => {
      console.log(`API running on :${PORT}`)
      resolve()
    })
    server.on('error', reject)
  })

  setInterval(() => {
    void db
      .update(polls)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(polls.isActive, true), lt(polls.expiresAt, new Date())))
  }, 60_000)

  try {
    await connectProducer()
    await startResponseConsumer()
    await startRealtimeConsumer()
  } catch (err) {
    console.error('Kafka initialization failed (HTTP API is still available):', err)
  }

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
