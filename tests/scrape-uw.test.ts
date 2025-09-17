import { describe, it, expect } from 'vitest'
import { parseEnrollJSON } from '../lib/enroll-parser'

describe('parseEnrollJSON', () => {
  it('extracts code, section, instructors from common shapes', () => {
    const json = JSON.stringify({ results: [
      { code: 'MATH 521', section: '001', instructors: [{ name: 'Prof A' }, { name: 'Prof B' }] },
      { courseCode: 'CS 400', classSection: '002', instructorList: ['TA C'] },
      { course: { code: 'ECON 101' }, sectionNumber: '003', staff: [{ displayName: 'Prof D' }] },
    ] })
    const items = parseEnrollJSON(json)
    expect(items).toHaveLength(3)
    expect(items[0]).toEqual({ code: 'MATH521', section: '001', instructors: ['Prof A', 'Prof B'] })
    expect(items[1]).toEqual({ code: 'CS400', section: '002', instructors: ['TA C'] })
    expect(items[2]).toEqual({ code: 'ECON101', section: '003', instructors: ['Prof D'] })
  })
})
