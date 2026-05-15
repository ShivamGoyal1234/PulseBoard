import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    googleId: text('google_id').unique(),
    provider: text('provider').notNull().default('email'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
    googleIdIdx: index('users_google_id_idx').on(t.googleId),
  })
)

export const polls = pgTable(
  'polls',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    description: text('description'),
    creatorId: text('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    isPublished: boolean('is_published').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    showResults: boolean('show_results').notNull().default(false),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    creatorIdx: index('polls_creator_id_idx').on(t.creatorId),
    activeIdx: index('polls_active_idx').on(t.isActive, t.expiresAt),
  })
)

export const questions = pgTable(
  'questions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    isRequired: boolean('is_required').notNull().default(true),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    pollIdx: index('questions_poll_id_idx').on(t.pollId),
  })
)

export const options = pgTable(
  'options',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    questionId: text('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    order: integer('order').notNull(),
  },
  (t) => ({
    questionIdx: index('options_question_id_idx').on(t.questionId),
  })
)

export const responses = pgTable(
  'responses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    responderId: text('responder_id').references(() => users.id),
    fingerprint: text('fingerprint'),
    timeToComplete: integer('time_to_complete'),
    submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  },
  (t) => ({
    pollIdx: index('responses_poll_id_idx').on(t.pollId),
    fingerprintIdx: index('responses_fingerprint_idx').on(t.pollId, t.fingerprint),
  })
)

export const answers = pgTable(
  'answers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    responseId: text('response_id')
      .notNull()
      .references(() => responses.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    optionId: text('option_id')
      .notNull()
      .references(() => options.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    responseIdx: index('answers_response_id_idx').on(t.responseId),
    questionIdx: index('answers_question_id_idx').on(t.questionId),
  })
)

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('refresh_tokens_user_id_idx').on(t.userId),
    tokenIdx: uniqueIndex('refresh_tokens_token_hash_idx').on(t.tokenHash),
  })
)

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('password_reset_tokens_user_id_idx').on(t.userId),
  })
)

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
)

export const usersRelations = relations(users, ({ many }) => ({
  polls: many(polls),
  responses: many(responses),
  tokens: many(refreshTokens),
  passwordResets: many(passwordResetTokens),
}))

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, { fields: [polls.creatorId], references: [users.id] }),
  questions: many(questions),
  responses: many(responses),
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
  poll: one(polls, { fields: [questions.pollId], references: [polls.id] }),
  options: many(options),
  answers: many(answers),
}))

export const optionsRelations = relations(options, ({ one, many }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
  answers: many(answers),
}))

export const responsesRelations = relations(responses, ({ one, many }) => ({
  poll: one(polls, { fields: [responses.pollId], references: [polls.id] }),
  responder: one(users, {
    fields: [responses.responderId],
    references: [users.id],
  }),
  answers: many(answers),
}))

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  option: one(options, {
    fields: [answers.optionId],
    references: [options.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Poll = typeof polls.$inferSelect
export type NewPoll = typeof polls.$inferInsert
export type Question = typeof questions.$inferSelect
export type Option = typeof options.$inferSelect
export type Response = typeof responses.$inferSelect
export type Answer = typeof answers.$inferSelect
