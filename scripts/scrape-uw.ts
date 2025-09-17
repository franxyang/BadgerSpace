/*
  UW–Madison catalog + schedule scraper/ingester (adapter-based).

  Goals:
    1) Catalog: course code, title, credits, dept (from https://guide.wisc.edu/courses/)
    2) Schedule/offerings: term + section + instructors (from https://public.enroll.wisc.edu/search)

  Important: Prefer official/public JSON endpoints. Respect robots.txt and ToS. Throttle requests.
  This script supports both remote URLs and local files for offline development.

  Usage examples:
    # Catalog (Guide) → Prisma upsert
    npm run scrape:uw -- catalog --url https://guide.wisc.edu/courses/
    npm run scrape:uw -- catalog --file ./fixtures/guide.courses.html

    # Schedule (Enroll) via captured JSON → Prisma upsert offerings/instructors
    npm run scrape:uw -- schedule --file ./fixtures/enroll.search.json --term 2025-Fall

  Note: The enroll site is a client SPA. Use your browser DevTools Network tab
        to identify JSON endpoints and save sample responses for offline parsing,
        or integrate the discovered endpoint URL with --url.
*/

import fs from 'node:fs/promises'
import path from 'node:path'
import { load as loadHTML } from 'cheerio'
import { prisma } from '@/lib/prisma'

type CatalogItem = {
  code: string
  name: string
  credits?: number
  departmentCode?: string
}

export type ScheduleItem = {
  code: string // course code e.g., MATH521
  section?: string // e.g., 001
  instructors: string[] // instructor display names
}

async function readInput(kind: 'url' | 'file', loc: string): Promise<string> {
  if (kind === 'url') {
    const res = await fetch(loc)
    if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${loc}`)
    return await res.text()
  }
  const abs = path.resolve(process.cwd(), loc)
  return await fs.readFile(abs, 'utf8')
}

// Adapter: Guide catalog parser (HTML)
async function parseGuideCatalog(html: string): Promise<CatalogItem[]> {
  const $ = loadHTML(html)
  const items: CatalogItem[] = []
  // Guide structure: department pages list courses with code/title inside .courseblocktitle
  $('.courseblock').each((_, el) => {
    const title = $(el).find('.courseblocktitle').text().trim()
    if (!title) return
    // Typical title line: "MATH 521 — Real Analysis I — 3 credits"
    const codeMatch = title.match(/([A-Z&]{2,})\s*(\d{3,4}[A-Z]?)/)
    const creditsMatch = title.match(/(\d+(?:\.\d+)?)\s*credit/)
    const code = codeMatch ? `${codeMatch[1]}${codeMatch[2]}`.replace(/\s+/g, '') : ''
    const name = title.split('—')[1]?.trim() || title
    const dept = codeMatch ? codeMatch[1] : undefined
    if (code) {
      items.push({ code, name, credits: creditsMatch ? Number(creditsMatch[1]) : undefined, departmentCode: dept })
    }
  })
  // If the root index page is used, it links to department pages; caller should loop through depts.
  return items
}

async function upsertCatalog(items: CatalogItem[]) {
  for (const c of items) {
    if (!c.code || !c.name) continue
    let deptId: string | undefined
    if (c.departmentCode) {
      const dept = await prisma.department.upsert({
        where: { code: c.departmentCode },
        create: { code: c.departmentCode, name: c.departmentCode },
        update: {},
      })
      deptId = dept.id
    }
    await prisma.course.upsert({
      where: { code: c.code },
      create: { code: c.code, name: c.name, credits: c.credits, departmentId: deptId! },
      update: { name: c.name, credits: c.credits, departmentId: deptId },
    })
  }
}

// Adapter: Enroll schedule parser (expects JSON structure; shape may vary)
export function parseEnrollJSON(jsonText: string): ScheduleItem[] {
  try {
    const data = JSON.parse(jsonText)
    // Heuristic: try common shapes; adjust once the real endpoint is known
    const rows: any[] = Array.isArray(data) ? data : data?.results || data?.courses || []
    const items: ScheduleItem[] = []
    for (const r of rows) {
      // Try to extract code, section, instructors
      const code = (r.code || r.courseCode || r.course?.code || '').toString().replace(/\s+/g, '')
      const section = r.section || r.classSection || r.sectionNumber
      const instructors: string[] = (r.instructors || r.instructorList || r.staff || [])
        .map((x: any) => (typeof x === 'string' ? x : x.name || x.displayName || ''))
        .filter(Boolean)
      if (code) items.push({ code, section, instructors })
    }
    return items
  } catch (e) {
    console.error('Failed to parse enroll JSON:', (e as Error).message)
    return []
  }
}

export async function upsertSchedule(term: string, items: ScheduleItem[]) {
  for (const s of items) {
    const course = await prisma.course.findUnique({ where: { code: s.code } })
    if (!course) continue
    const offering = await prisma.offering.upsert({
      where: { courseId_term_section: { courseId: course.id, term, section: s.section || '' } },
      create: { courseId: course.id, term, section: s.section || null },
      update: {},
    })
    for (const name of s.instructors || []) {
      const trimmed = name.trim()
      if (!trimmed) continue
      const instr = await prisma.instructor.upsert({
        where: { name: trimmed },
        create: { name: trimmed },
        update: {},
      })
      await prisma.offeringInstructor.upsert({
        where: { offeringId_instructorId: { offeringId: offering.id, instructorId: instr.id } },
        create: { offeringId: offering.id, instructorId: instr.id },
        update: {},
      })
      // Also connect course↔instructor for historical association
      await prisma.courseInstructor.upsert({
        where: { courseId_instructorId: { courseId: course.id, instructorId: instr.id } },
        create: { courseId: course.id, instructorId: instr.id },
        update: {},
      })
    }
  }
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2)
  if (!mode || (mode !== 'catalog' && mode !== 'schedule')) {
    console.error('Usage: scrape-uw <catalog|schedule> [--url <url> | --file <path>] [--term 2025-Fall]')
    process.exit(1)
  }
  const urlIdx = rest.indexOf('--url')
  const fileIdx = rest.indexOf('--file')
  const termIdx = rest.indexOf('--term')
  const loc = urlIdx >= 0 ? rest[urlIdx + 1] : fileIdx >= 0 ? rest[fileIdx + 1] : ''
  const kind: 'url' | 'file' = urlIdx >= 0 ? 'url' : 'file'
  if (!loc) {
    console.error('Provide --url or --file')
    process.exit(1)
  }
  const text = await readInput(kind, loc)
  if (mode === 'catalog') {
    const items = await parseGuideCatalog(text)
    await upsertCatalog(items)
    console.log(`Catalog upserted: ${items.length} items`)
  } else {
    const term = termIdx >= 0 ? rest[termIdx + 1] : ''
    if (!term) { console.error('Provide --term for schedule'); process.exit(1) }
    const items = parseEnrollJSON(text)
    await upsertSchedule(term, items)
    console.log(`Schedule upserted for ${term}: ${items.length} offerings`)
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})
