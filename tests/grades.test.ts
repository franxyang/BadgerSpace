import { describe, it, expect } from 'vitest'
import { ratingToGPA, gpaToUWLetter, ratingToUWLetter } from '../lib/grades'

describe('grades mapping', () => {
  it('maps rating to GPA linearly', () => {
    expect(ratingToGPA(5)).toBe(4)
    expect(ratingToGPA(1)).toBe(0)
    expect(ratingToGPA(3)).toBe(2)
  })
  it('maps GPA to UW letters by thresholds', () => {
    expect(gpaToUWLetter(4.0)).toBe('A')
    expect(gpaToUWLetter(3.5)).toBe('AB')
    expect(gpaToUWLetter(3.0)).toBe('B')
    expect(gpaToUWLetter(2.5)).toBe('BC')
    expect(gpaToUWLetter(2.0)).toBe('C')
    expect(gpaToUWLetter(1.0)).toBe('D')
    expect(gpaToUWLetter(0.0)).toBe('F')
  })
  it('maps rating average to UW letters via GPA', () => {
    expect(ratingToUWLetter(5)).toBe('A')
    expect(ratingToUWLetter(4.5)).toBe('AB')
    expect(ratingToUWLetter(3.0)).toBe('C')
  })
})

