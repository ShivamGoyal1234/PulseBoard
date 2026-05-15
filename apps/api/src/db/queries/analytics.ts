import { db } from '../index'
import { sql } from 'drizzle-orm'

export const analyticsQueries = {
  uniqueRespondents: (pollId: string) =>
    db.execute(sql`
      SELECT COUNT(DISTINCT responder_id)::int AS count
      FROM responses WHERE poll_id = ${pollId} AND responder_id IS NOT NULL
    `),
}
