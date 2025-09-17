export type ScheduleItem = {
  code: string
  section?: string
  instructors: string[]
}

export function parseEnrollJSON(jsonText: string): ScheduleItem[] {
  try {
    const data = JSON.parse(jsonText)
    const rows: any[] = Array.isArray(data) ? data : data?.results || data?.courses || []
    const items: ScheduleItem[] = []
    for (const r of rows) {
      const code = (r.code || r.courseCode || r.course?.code || '').toString().replace(/\s+/g, '')
      const section = r.section || r.classSection || r.sectionNumber
      const instructors: string[] = (r.instructors || r.instructorList || r.staff || [])
        .map((x: any) => (typeof x === 'string' ? x : x.name || x.displayName || ''))
        .filter(Boolean)
      if (code) items.push({ code, section, instructors })
    }
    return items
  } catch {
    return []
  }
}

