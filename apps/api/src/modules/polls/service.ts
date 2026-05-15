import OpenAI from 'openai'
import { eq } from 'drizzle-orm'
import { redis } from '../../config/redis'
import { pollQueries } from '../../db/queries/polls'
import { db } from '../../db'
import { polls, questions, options } from '../../db/schema'
import type { CreatePollInput, UpdatePollInput } from './schema'

const openaiApiKey = process.env.OPENAI_API_KEY
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

interface OptionCountRow {
  question_id: string
  option_id: string
  count: number
}

export const pollService = {
  async createPoll(creatorId: string, data: CreatePollInput) {
    const created = await db.transaction(async (tx) => {
      const [poll] = await tx
        .insert(polls)
        .values({
          title: data.title,
          description: data.description,
          creatorId,
          isAnonymous: data.isAnonymous ?? false,
          showResults: data.showResults ?? false,
          expiresAt: new Date(data.expiresAt),
        })
        .returning()

      for (const q of data.questions) {
        const [question] = await tx
          .insert(questions)
          .values({
            pollId: poll.id,
            text: q.text,
            isRequired: q.isRequired ?? true,
            order: q.order,
          })
          .returning()

        for (const o of q.options) {
          await tx.insert(options).values({
            questionId: question.id,
            text: o.text,
            order: o.order,
          })
        }
      }

      return poll
    })

    const full = await pollQueries.findById(created.id)
    if (!full) throw new Error('NOT_FOUND')
    return full
  },

  async updatePoll(pollId: string, creatorId: string, data: UpdatePollInput) {
    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')
    if (poll.creatorId !== creatorId) throw new Error('FORBIDDEN')

    const patch: Partial<typeof polls.$inferInsert> = {}
    if (data.title !== undefined) patch.title = data.title
    if (data.description !== undefined) patch.description = data.description
    if (data.expiresAt !== undefined) patch.expiresAt = new Date(data.expiresAt)
    if (data.isAnonymous !== undefined) patch.isAnonymous = data.isAnonymous
    if (data.showResults !== undefined) patch.showResults = data.showResults
    if (data.isActive !== undefined) patch.isActive = data.isActive

    const [updated] = await db
      .update(polls)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(polls.id, pollId))
      .returning()

    const full = await pollQueries.findById(updated.id)
    if (!full) throw new Error('NOT_FOUND')
    return full
  },

  async deletePoll(pollId: string, creatorId: string) {
    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')
    if (poll.creatorId !== creatorId) throw new Error('FORBIDDEN')
    await pollQueries.delete(pollId)
    try {
      await redis.del(`analytics:${pollId}`)
      await redis.del(`insights:${pollId}`)
    } catch {
      // Redis may be unavailable; poll row is already removed.
    }
  },

  async publishPoll(pollId: string, creatorId: string) {
    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')
    if (poll.creatorId !== creatorId) throw new Error('FORBIDDEN')
    const [updated] = await db
      .update(polls)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(polls.id, pollId))
      .returning()
    return updated
  },

  async generateDraft(prompt: string): Promise<{
    title: string
    description?: string
    questions: {
      text: string
      isRequired: boolean
      options: { text: string }[]
    }[]
  }> {
    const cleaned = prompt.trim().slice(0, 500)
    if (cleaned.length < 4) {
      throw new Error('VALIDATION_ERROR')
    }

    const fallback = {
      title: cleaned.length > 80 ? `${cleaned.slice(0, 77)}…` : cleaned,
      description: 'AI is offline — feel free to edit this draft before publishing.',
      questions: [
        {
          text: 'How would you describe your overall experience?',
          isRequired: true,
          options: [
            { text: 'Excellent' },
            { text: 'Good' },
            { text: 'Average' },
            { text: 'Poor' },
          ],
        },
        {
          text: 'What should we focus on next?',
          isRequired: true,
          options: [
            { text: 'Ship more features' },
            { text: 'Improve reliability' },
            { text: 'Better performance' },
            { text: 'Polish design' },
          ],
        },
      ],
    }

    if (!openai) return fallback

    const system = `You design short, high-signal polls. Respond ONLY with valid JSON matching this exact TypeScript type:

{
  "title": string, // <= 80 chars, clear and inviting
  "description"?: string, // optional, <= 160 chars
  "questions": Array<{
    "text": string, // <= 140 chars, one question, no preamble
    "isRequired": boolean,
    "options": Array<{ "text": string }> // 3–5 options, each <= 60 chars, mutually exclusive and meaningful
  }> // 3–5 questions
}

Rules:
- Output JSON only. No markdown, no commentary, no code fences.
- Make options specific, not generic. Avoid "Other" unless it really fits.
- Vary required vs optional questions naturally.
- Questions must be answerable with one of the supplied options (no free text).`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 900,
        temperature: 0.65,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Brief: ${cleaned}\n\nProduce the poll JSON now.`,
          },
        ],
      })

      const raw = completion.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(raw) as {
        title?: string
        description?: string
        questions?: {
          text?: string
          isRequired?: boolean
          options?: { text?: string }[]
        }[]
      }

      const title =
        typeof parsed.title === 'string' && parsed.title.trim().length > 0
          ? parsed.title.trim().slice(0, 200)
          : fallback.title

      const description =
        typeof parsed.description === 'string'
          ? parsed.description.trim().slice(0, 500)
          : undefined

      const questions =
        Array.isArray(parsed.questions) && parsed.questions.length > 0
          ? parsed.questions
              .slice(0, 5)
              .map((q) => {
                const text = (q.text ?? '').toString().trim().slice(0, 500)
                const options = Array.isArray(q.options)
                  ? q.options
                      .map((o) => (o.text ?? '').toString().trim().slice(0, 200))
                      .filter((t) => t.length > 0)
                      .slice(0, 10)
                  : []
                return {
                  text,
                  isRequired: q.isRequired !== false,
                  options: options.map((t) => ({ text: t })),
                }
              })
              .filter((q) => q.text.length > 0 && q.options.length >= 2)
          : []

      if (questions.length === 0) return fallback

      return { title, description, questions }
    } catch {
      return fallback
    }
  },

  async getInsights(pollId: string, force = false): Promise<string> {
    const cacheKey = `insights:v2:${pollId}`
    if (!force) {
      const cached = await redis.get(cacheKey)
      if (cached) return cached
    }

    const poll = await pollQueries.findById(pollId)
    if (!poll) throw new Error('NOT_FOUND')

    const [countResult] = await pollQueries.responseCount(pollId)
    const totalResponses = countResult.count

    if (totalResponses <= 0) {
      return 'No responses yet for AI insights.'
    }

    const optionCounts = await pollQueries.optionCounts(pollId)
    const rows = optionCounts.rows as unknown as OptionCountRow[]

    const statsJson = JSON.stringify(
      poll.questions.map((q) => ({
        question: q.text,
        options: q.options.map((o) => {
          const row = rows.find(
            (r) => r.question_id === q.id && r.option_id === o.id
          )
          const count = row?.count ?? 0
          return {
            text: o.text,
            count,
            percent:
              totalResponses > 0
                ? `${Math.round((count / totalResponses) * 100)}%`
                : '0%',
          }
        }),
      })),
      null,
      2
    )

    if (!openai) {
      const fallback =
        'AI insights require OPENAI_API_KEY. Aggregate counts are available in analytics.'
      await redis.setex(cacheKey, 3600, fallback)
      return fallback
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a sharp data analyst summarising poll results. Write EXACTLY 5 distinct, specific, actionable insights. Each insight is 1 short sentence (max 24 words). Output ONLY the 5 insights, each on its own line, prefixed with "- " (a hyphen and a space). No preamble. No markdown headings. No numbering. No commentary after the list.',
        },
        {
          role: 'user',
          content: `Poll: "${poll.title}"\nTotal responses: ${totalResponses}\n\nData:\n${statsJson}`,
        },
      ],
    })

    const insight =
      completion.choices[0].message.content ?? 'Unable to generate insight.'
    await redis.setex(cacheKey, 3600, insight)
    return insight
  },
}
