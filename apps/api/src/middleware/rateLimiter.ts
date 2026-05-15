import type { Request } from 'express'
import rateLimit from 'express-rate-limit'

const windowMs = 15 * 60 * 1000

function resolveGlobalMax(): number {
  const raw = process.env.RATE_LIMIT_MAX
  if (raw !== undefined && raw !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  }
  return process.env.NODE_ENV === 'production' ? 100 : 5000
}

function skipGlobalRateLimit(req: Request): boolean {
  if (req.method === 'POST' && req.path === '/api/auth/refresh') {
    return true
  }
  if (req.method === 'GET' && req.path === '/api/auth/me') {
    return true
  }
  return false
}

export const rateLimiter = rateLimit({
  windowMs,
  max: resolveGlobalMax(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: skipGlobalRateLimit,
})

export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 200,
  message: { error: 'Too many submissions, slow down' },
})
