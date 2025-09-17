import pdfParse from 'pdf-parse'

export type ExtractedCourse = { code: string; term?: string }

export async function extractCoursesFromPdf(buffer: Buffer): Promise<ExtractedCourse[]> {
  const parsed = await pdfParse(buffer)
  const text = parsed.text || ''
  const lines = text.split(/\r?\n/)
  const out: ExtractedCourse[] = []
  let currentTerm: string | undefined
  for (const line of lines) {
    const termMatch = line.match(/(Fall|Winter|Spring|Summer)\s+(20\d{2})/i)
    if (termMatch) {
      currentTerm = `${termMatch[2]}-${termMatch[1][0].toUpperCase()}${termMatch[1].slice(1).toLowerCase()}`
    }
    for (const m of line.matchAll(/\b([A-Z&]{2,})\s+(\d{3,4}[A-Z]?)\b/g)) {
      const code = `${m[1]}${m[2]}`.toUpperCase()
      out.push({ code, term: currentTerm })
    }
  }
  const seen = new Set<string>()
  return out.filter((c) => {
    const key = `${c.code}|${c.term || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

