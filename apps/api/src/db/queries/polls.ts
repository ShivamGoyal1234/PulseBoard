import { db } from '../index'
import { polls, questions, options, responses, answers } from '../schema'
import { eq, desc, sql, inArray } from 'drizzle-orm'

export const pollQueries = {
  findById: (id: string) =>
    db.query.polls.findFirst({
      where: eq(polls.id, id),
      with: {
        questions: {
          orderBy: questions.order,
          with: { options: { orderBy: options.order } },
        },
      },
    }),

  findByCreator: (creatorId: string) =>
    db.query.polls.findMany({
      where: eq(polls.creatorId, creatorId),
      orderBy: desc(polls.createdAt),
    }),

  create: (data: typeof polls.$inferInsert) =>
    db.insert(polls).values(data).returning(),

  update: (id: string, data: Partial<typeof polls.$inferInsert>) =>
    db
      .update(polls)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(polls.id, id))
      .returning(),

  /** Deletes answers → responses → poll so it works even if DB FKs omit ON DELETE CASCADE on answers.question_id. */
  delete: (id: string) =>
    db.transaction(async (tx) => {
      const responseRows = await tx
        .select({ id: responses.id })
        .from(responses)
        .where(eq(responses.pollId, id))
      const responseIds = responseRows.map((r) => r.id)
      if (responseIds.length > 0) {
        await tx.delete(answers).where(inArray(answers.responseId, responseIds))
      }
      await tx.delete(responses).where(eq(responses.pollId, id))
      await tx.delete(polls).where(eq(polls.id, id))
    }),

  isExpired: (poll: { expiresAt: Date; isActive: boolean }) =>
    !poll.isActive || poll.expiresAt < new Date(),

  responseCount: (pollId: string) =>
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(responses)
      .where(eq(responses.pollId, pollId)),

  velocityTimeline: (pollId: string) =>
    db.execute(sql`
      SELECT DATE_TRUNC('hour', submitted_at) AS bucket,
             COUNT(*)::int AS count
      FROM responses WHERE poll_id = ${pollId}
      GROUP BY bucket ORDER BY bucket ASC
    `),

  optionCounts: (pollId: string) =>
    db.execute(sql`
      SELECT a.question_id, a.option_id, COUNT(*)::int AS count
      FROM answers a
      JOIN responses r ON r.id = a.response_id
      WHERE r.poll_id = ${pollId}
      GROUP BY a.question_id, a.option_id
    `),

  dropOffStats: (pollId: string) =>
    db.execute(sql`
      SELECT q.id, q.text, q."order",
             (
               SELECT COUNT(DISTINCT a2.response_id)::int
               FROM answers a2
               INNER JOIN responses r2 ON r2.id = a2.response_id AND r2.poll_id = ${pollId}
               WHERE a2.question_id = q.id
             ) AS answered,
             (SELECT COUNT(*)::int FROM responses WHERE poll_id = ${pollId}) AS total
      FROM questions q
      WHERE q.poll_id = ${pollId}
      ORDER BY q."order" ASC
    `),
}
