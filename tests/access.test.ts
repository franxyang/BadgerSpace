import { describe, it, expect } from 'vitest'
import { shouldRedactReviews } from '../lib/access'

describe('access gating', () => {
  it('redacts when user has no reviews', () => {
    expect(shouldRedactReviews(0)).toBe(true)
    expect(shouldRedactReviews(null)).toBe(true)
  })
  it('does not redact when user has at least one review', () => {
    expect(shouldRedactReviews(1)).toBe(false)
    expect(shouldRedactReviews(3)).toBe(false)
  })
})

