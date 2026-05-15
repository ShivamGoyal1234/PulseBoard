import { z } from 'zod'

const idString = z.string().min(10).max(40)

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: idString,
        optionId: idString,
      })
    )
    .min(1),
  timeToComplete: z.number().int().positive().optional(),
})
