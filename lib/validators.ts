import { z } from 'zod'

export const semesterRegex = /^(20\d{2})-(Fall|Winter|Spring|Summer)$/

export const createReviewSchema = z.object({
  courseCode: z.string().trim().min(3).max(16),
  semester: z.string().regex(semesterRegex, 'Invalid semester format'),
  instructorName: z.string().trim().min(1).max(100).optional(),
  ta: z.string().trim().min(1).max(100).optional(),
  content: z.string().trim().min(50).max(2000),
  ratingContent: z.number().int().min(1).max(5),
  ratingTeaching: z.number().int().min(1).max(5),
  ratingGrading: z.number().int().min(1).max(5),
  ratingWorkload: z.number().int().min(1).max(5),
})

export const updateReviewSchema = z.object({
  content: z.string().trim().min(50).max(2000).optional(),
  ratingContent: z.number().int().min(1).max(5).optional(),
  ratingTeaching: z.number().int().min(1).max(5).optional(),
  ratingGrading: z.number().int().min(1).max(5).optional(),
  ratingWorkload: z.number().int().min(1).max(5).optional(),
})

export const voteSchema = z.object({ value: z.number().int().refine((v) => v === 1 || v === -1, 'value must be 1 or -1') })

export const reportSchema = z.object({ reason: z.string().trim().min(5).max(300) })

