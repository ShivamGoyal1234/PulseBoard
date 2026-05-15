import { db } from '../index'
import { users, refreshTokens } from '../schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'node:crypto'

export const userQueries = {
  findById: (id: string) => db.query.users.findFirst({ where: eq(users.id, id) }),
  findByEmail: (email: string) =>
    db.query.users.findFirst({ where: eq(users.email, email) }),
  findByGoogleId: (gid: string) =>
    db.query.users.findFirst({ where: eq(users.googleId, gid) }),
  create: (data: typeof users.$inferInsert) =>
    db.insert(users).values(data).returning(),
  update: (id: string, data: Partial<typeof users.$inferInsert>) =>
    db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning(),

  saveRefreshToken: (userId: string, token: string, expiresAt: Date) => {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    return db.insert(refreshTokens).values({ userId, tokenHash, expiresAt })
  },

  verifyRefreshToken: (token: string) => {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    return db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    })
  },

  deleteRefreshToken: (token: string) => {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    return db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash))
  },
}
