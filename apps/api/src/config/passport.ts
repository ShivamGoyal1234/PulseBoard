import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_at, _rt, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('No email from Google'))

        let user = await db.query.users.findFirst({
          where: eq(users.googleId, profile.id),
        })

        if (!user) {
          const byEmail = await db.query.users.findFirst({
            where: eq(users.email, email),
          })
          if (byEmail) {
            const [updated] = await db
              .update(users)
              .set({
                googleId: profile.id,
                provider: 'google',
                avatarUrl: profile.photos?.[0]?.value,
                updatedAt: new Date(),
              })
              .where(eq(users.id, byEmail.id))
              .returning()
            return done(null, updated)
          }
          const [created] = await db
            .insert(users)
            .values({
              email,
              name: profile.displayName ?? email.split('@')[0] ?? 'User',
              avatarUrl: profile.photos?.[0]?.value,
              googleId: profile.id,
              provider: 'google',
            })
            .returning()
          user = created
        }

        return done(null, user)
      } catch (err) {
        return done(err as Error)
      }
    }
  )
)

export default passport
