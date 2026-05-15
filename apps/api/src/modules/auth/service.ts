import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import { userQueries } from '../../db/queries/users'
import { passwordResetQueries } from '../../db/queries/passwordReset'
import { sendPasswordResetEmail } from '../../lib/mail'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userQueries.findByEmail(email)
    if (existing) throw new Error('EMAIL_TAKEN')
    const passwordHash = await bcrypt.hash(password, 12)
    const [user] = await userQueries.create({
      email,
      passwordHash,
      name,
      provider: 'email',
    })
    return issueTokens(user.id)
  },

  async login(email: string, password: string) {
    const user = await userQueries.findByEmail(email)
    if (!user || !user.passwordHash) throw new Error('INVALID_CREDENTIALS')
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('INVALID_CREDENTIALS')
    return issueTokens(user.id)
  },

  async refresh(token: string) {
    const stored = await userQueries.verifyRefreshToken(token)
    if (!stored || stored.expiresAt < new Date()) throw new Error('INVALID_REFRESH')
    let payload: { sub: string }
    try {
      payload = jwt.verify(token, REFRESH_SECRET) as { sub: string }
    } catch {
      throw new Error('INVALID_REFRESH')
    }
    await userQueries.deleteRefreshToken(token)
    return issueTokens(payload.sub)
  },

  async logout(token: string) {
    await userQueries.deleteRefreshToken(token)
  },

  async requestPasswordReset(email: string) {
    const normalized = email.trim().toLowerCase()
    const user = await userQueries.findByEmail(normalized)
    if (!user?.passwordHash) return
    await passwordResetQueries.deleteForUser(user.id)
    const raw = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(raw).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await passwordResetQueries.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    })
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${raw}`
    await sendPasswordResetEmail(normalized, resetUrl)
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const row = await passwordResetQueries.findByTokenHash(tokenHash)
    if (!row || row.expiresAt < new Date()) throw new Error('INVALID_RESET_TOKEN')
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await userQueries.update(row.userId, { passwordHash })
    await passwordResetQueries.deleteForUser(row.userId)
  },
}

export async function issueTokens(userId: string) {
  const accessToken = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' })
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await userQueries.saveRefreshToken(userId, refreshToken, expiresAt)
  return { accessToken, refreshToken }
}
