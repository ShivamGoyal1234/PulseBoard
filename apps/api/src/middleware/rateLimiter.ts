import type { Request } from 'express'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'

const windowMs = 15 * 60 * 1000

function resolveGlobalMax(): number {
  const raw = process.env.RATE_LIMIT_MAX
  if (raw !== undefined && raw !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  }
  return process.env.NODE_ENV === 'production' ? 600 : 5000
}

/** Per-user when JWT present; otherwise per IP (respond links, login, etc.). */
export function rateLimitKey(req: Request): string {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const secret = process.env.JWT_ACCESS_SECRET
      if (secret) {
        const payload = jwt.verify(header.slice(7), secret) as { sub?: string }
        if (payload.sub) return `user:${payload.sub}`
      }
    } catch {
      // Invalid token — fall back to IP
    }
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown'
}

function skipGlobalRateLimit(req: Request): boolean {
  if (req.method === 'OPTIONS') return true

  const path = req.path

  if (req.method === 'POST' && path === '/api/auth/refresh') return true
  if (req.method === 'GET' && path === '/api/auth/me') return true
  if (path.startsWith('/api/docs')) return true

  return false
}

export const rateLimiter = rateLimit({
  windowMs,
  max: resolveGlobalMax(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  keyGenerator: rateLimitKey,
  skip: skipGlobalRateLimit,
})

export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 200,
  keyGenerator: rateLimitKey,
  message: { error: 'Too many submissions, slow down' },
})

/** OpenAI poll draft generation — stricter cap, separate from global budget semantics. */
export const aiGenerateRateLimiter = rateLimit({
  windowMs,
  max: process.env.NODE_ENV === 'production' ? 25 : 100,
  keyGenerator: rateLimitKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI generations. Wait a few minutes and try again.',
  },
})
