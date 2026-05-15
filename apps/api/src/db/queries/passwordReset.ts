import { eq } from 'drizzle-orm'
import { db } from '../index'
import { passwordResetTokens } from '../schema'

export const passwordResetQueries = {
  deleteForUser: (userId: string) =>
    db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)),

  create: (data: typeof passwordResetTokens.$inferInsert) =>
    db.insert(passwordResetTokens).values(data),

  findByTokenHash: async (tokenHash: string) => {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1)
    return row
  },

  deleteById: (id: string) =>
    db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id)),
}
