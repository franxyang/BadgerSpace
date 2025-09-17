import { describe, it, expect } from 'vitest'
import { createReviewSchema, updateReviewSchema } from '../lib/validators'

describe('validators', () => {
  it('accepts valid create review payload', () => {
    const res = createReviewSchema.safeParse({
      courseCode: 'MATH521',
      semester: '2025-Fall',
      instructorName: 'Prof A',
      ta: 'TA B',
      content: 'x'.repeat(60),
      ratingContent: 5,
      ratingTeaching: 4,
      ratingGrading: 3,
      ratingWorkload: 2,
    })
    expect(res.success).toBe(true)
  })
  it('rejects invalid semester', () => {
    const res = createReviewSchema.safeParse({
      courseCode: 'MATH521', semester: 'Fall 2025', content: 'x'.repeat(60), ratingContent: 5, ratingTeaching: 5, ratingGrading: 5, ratingWorkload: 5
    })
    expect(res.success).toBe(false)
  })
  it('rejects too-short content', () => {
    const res = createReviewSchema.safeParse({
      courseCode: 'MATH521', semester: '2025-Fall', content: 'short', ratingContent: 5, ratingTeaching: 5, ratingGrading: 5, ratingWorkload: 5
    })
    expect(res.success).toBe(false)
  })
  it('accepts partial updates', () => {
    const res = updateReviewSchema.safeParse({ ratingContent: 4 })
    expect(res.success).toBe(true)
  })
})

