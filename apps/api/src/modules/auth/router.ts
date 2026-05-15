import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import { z } from 'zod'
import passport from '../../config/passport'
import { authService, issueTokens } from './service'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schema'
import type { User } from '../../db/schema'

const router = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>
    const { accessToken, refreshToken } = await authService.register(
      email,
      password,
      name
    )
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>
    const { accessToken, refreshToken } = await authService.login(email, password)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken as string | undefined
    if (!token) {
      res.status(401).json({ error: 'No refresh token' })
      return
    }
    const { accessToken, refreshToken } = await authService.refresh(token)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      await authService.requestPasswordReset(
        (req.body as z.infer<typeof forgotPasswordSchema>).email
      )
      res.json({
        ok: true,
        message:
          'If an account exists for this email, we sent reset instructions.',
      })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body as z.infer<typeof resetPasswordSchema>
    await authService.resetPassword(token, password)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken as string | undefined
    if (token) await authService.logout(token)
    res.clearCookie('refreshToken')
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User
      const { accessToken, refreshToken } = await issueTokens(user.id)
      res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`)
    } catch (err) {
      next(err)
    }
  }
)

export default router
