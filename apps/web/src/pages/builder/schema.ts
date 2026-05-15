import { z } from 'zod'

const optionFrontendSchema = z.object({
  text: z.string().min(1).max(200),
  order: z.number().int().min(0),
})

const questionFrontendSchema = z.object({
  text: z.string().min(1).max(500),
  isRequired: z.boolean(),
  order: z.number().int().min(0),
  options: z.array(optionFrontendSchema).min(2).max(10),
})

export const createPollFrontendSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  expiresAt: z.string().min(1),
  isAnonymous: z.boolean(),
  showResults: z.boolean(),
  questions: z.array(questionFrontendSchema).min(1).max(20),
})

export type PollBuilderForm = z.infer<typeof createPollFrontendSchema>
export type PollQuestionForm = z.infer<typeof questionFrontendSchema>
export type PollOptionForm = z.infer<typeof optionFrontendSchema>
