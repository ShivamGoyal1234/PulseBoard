import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { userQueries } from '../db/queries/users'

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_ACCESS_SECRET!
    ) as { sub: string }
    const user = await userQueries.findById(payload.sub)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
