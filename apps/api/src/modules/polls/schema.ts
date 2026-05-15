import { z } from 'zod'

const optionSchema = z.object({
  text: z.string().min(1, 'Option text required').max(200),
  order: z.number().int().min(0),
})

const questionSchema = z.object({
  text: z.string().min(1, 'Question text required').max(500),
  isRequired: z.boolean().default(true),
  order: z.number().int().min(0),
  options: z.array(optionSchema).min(2, 'At least 2 options required').max(10),
})

export const createPollSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional(),
  expiresAt: z.string().datetime({ offset: true }),
  isAnonymous: z.boolean().default(false),
  showResults: z.boolean().default(false),
  questions: z
    .array(questionSchema)
    .min(1, 'At least 1 question required')
    .max(20),
})

export const updatePollSchema = createPollSchema
  .partial()
  .omit({ questions: true })
  .extend({
    /** Set `false` to stop accepting responses before the scheduled end time. */
    isActive: z.boolean().optional(),
  })

export type CreatePollInput = z.infer<typeof createPollSchema>
export type UpdatePollInput = z.infer<typeof updatePollSchema>
