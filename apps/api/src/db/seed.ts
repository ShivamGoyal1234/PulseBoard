import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'
import { db } from './index'
import {
  users,
  polls,
  questions,
  options,
  responses,
  answers,
} from './schema'
import { eq } from 'drizzle-orm'

async function seed(): Promise<void> {
  const demoEmail = 'demo@pulseBoard.dev'
  const existing = await db.query.users.findFirst({
    where: eq(users.email, demoEmail),
  })
  if (!existing) {
    const passwordHash = await bcrypt.hash('Demo1234!', 12)
    await db.insert(users).values({
      email: demoEmail,
      passwordHash,
      name: 'Demo Organizer',
      provider: 'email',
    })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, demoEmail),
  })
  if (!user) throw new Error('Demo user missing')

  const existingPolls = await db.query.polls.findMany({
    where: eq(polls.creatorId, user.id),
  })
  if (existingPolls.length > 0) {
    console.log('Seed skipped (polls already exist)')
    process.exit(0)
    return
  }

  const templates = [
    {
      title: 'PulseBoard satisfaction survey',
      description: 'Help us improve the hackathon demo experience.',
      questionTexts: [
        'How satisfied are you with real-time analytics?',
        'Which feature matters most to you?',
        'Would you recommend PulseBoard to a teammate?',
      ],
    },
    {
      title: 'Weekly team priorities',
      description: 'Quick pulse on what we should ship next.',
      questionTexts: [
        'Our top priority this week should be:',
        'Biggest risk to delivery:',
      ],
    },
    {
      title: 'Conference session feedback',
      description: 'Tell us which sessions resonated.',
      questionTexts: [
        'Which track did you attend most?',
        'Which workshop felt most actionable?',
        'Overall energy level at the event?',
      ],
    },
  ]

  const now = Date.now()

  for (const tpl of templates) {
    const expiresAt = new Date(now + 14 * 24 * 60 * 60 * 1000)
    const [poll] = await db
      .insert(polls)
      .values({
        title: tpl.title,
        description: tpl.description,
        creatorId: user.id,
        isAnonymous: faker.datatype.boolean(),
        isPublished: true,
        isActive: true,
        showResults: true,
        expiresAt,
      })
      .returning()

    const questionRows: { id: string; options: { id: string }[] }[] = []

    for (let qi = 0; qi < tpl.questionTexts.length; qi++) {
      const [q] = await db
        .insert(questions)
        .values({
          pollId: poll.id,
          text: tpl.questionTexts[qi],
          isRequired: qi === 0 || faker.datatype.boolean(),
          order: qi,
        })
        .returning()

      const optCount = faker.number.int({ min: 3, max: 5 })
      const optRows: { id: string }[] = []
      for (let oi = 0; oi < optCount; oi++) {
        const [o] = await db
          .insert(options)
          .values({
            questionId: q.id,
            text: faker.commerce.productName(),
            order: oi,
          })
          .returning()
        optRows.push({ id: o.id })
      }
      questionRows.push({ id: q.id, options: optRows })
    }

    const responseTotal = faker.number.int({ min: 20, max: 50 })

    for (let r = 0; r < responseTotal; r++) {
      const submittedAt = new Date(
        now - faker.number.int({ min: 0, max: 7 }) * 24 * 60 * 60 * 1000
      )
      const fingerprintSeed = faker.string.alphanumeric(40)

      const [resp] = await db
        .insert(responses)
        .values({
          pollId: poll.id,
          responderId: poll.isAnonymous ? null : user.id,
          fingerprint: `fp_${poll.id}_${fingerprintSeed}`,
          timeToComplete: faker.number.int({ min: 12, max: 240 }),
          submittedAt,
        })
        .returning()

      for (const q of questionRows) {
        const choice = faker.helpers.arrayElement(q.options)
        await db.insert(answers).values({
          responseId: resp.id,
          questionId: q.id,
          optionId: choice.id,
        })
      }
    }
  }

  console.log('Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
