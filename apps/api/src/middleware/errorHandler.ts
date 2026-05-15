import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  EMAIL_TAKEN: { status: 409, message: 'Email already registered' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  INVALID_REFRESH: { status: 401, message: 'Session expired, please login again' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  POLL_EXPIRED: { status: 410, message: 'This poll has expired' },
  ALREADY_RESPONDED: { status: 409, message: 'You have already responded to this poll' },
  VALIDATION_ERROR: { status: 422, message: 'Validation failed' },
  UNAUTHORIZED: { status: 401, message: 'Authentication required for this poll' },
  INVALID_RESET_TOKEN: { status: 400, message: 'Invalid or expired reset link' },
}

export function errorHandler(
  err: Error & { code?: string; missing?: string[] },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const mapped = err.message && ERROR_MAP[err.message]
  if (mapped) {
    if (err.message === 'VALIDATION_ERROR' && err.missing && err.missing.length > 0) {
      res.status(mapped.status).json({
        error: mapped.message,
        missing: err.missing,
      })
      return
    }
    res.status(mapped.status).json({ error: mapped.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(422).json({ error: 'Validation failed', details: err.flatten() })
    return
  }

  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Internal server error' })
}
