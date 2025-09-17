/*
  Import UW–Madison courses into Prisma from a JSON or CSV source.

  Usage examples:
    # From a local JSON file
    npm run ingest:courses -- --json ./courses.json

    # From a remote JSON URL
    npm run ingest:courses -- --json https://example.com/uw-courses.json

    # From a CSV file (simple comma-separated, header row)
    npm run ingest:courses -- --csv ./courses.csv

  Expected fields (case-insensitive):
    - code (e.g., MATH521)
    - name
    - departmentCode (e.g., MATH) or departmentName
    - credits (optional int)
    - level (optional int like 100/200/500)
*/

import fs from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '@/lib/prisma'

type InputCourse = {
  code: string
  name: string
  departmentCode?: string
  departmentName?: string
  credits?: number | string
  level?: number | string
}

async function readSource(flag: '--json' | '--csv', loc: string): Promise<string> {
  if (loc.startsWith('http://') || loc.startsWith('https://')) {
    const res = await fetch(loc)
    if (!res.ok) throw new Error(`Failed to fetch ${loc}: ${res.status}`)
    return await res.text()
  }
  const abs = path.resolve(process.cwd(), loc)
  return await fs.readFile(abs, 'utf8')
}

function parseCSV(text: string): InputCourse[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => (row[h] = (cols[i] || '').trim()))
    return {
      code: row['code'],
      name: row['name'],
      departmentCode: row['departmentcode'] || row['dept'] || row['department'],
      departmentName: row['departmentname'] || '',
      credits: row['credits'] ? Number(row['credits']) : undefined,
      level: row['level'] ? Number(row['level']) : undefined,
    }
  })
}

function normalize(c: InputCourse): Required<Pick<InputCourse, 'code' | 'name'>> & InputCourse {
  return {
    ...c,
    code: c.code?.toUpperCase().replace(/\s+/g, ''),
    name: c.name?.trim(),
    credits: typeof c.credits === 'string' ? Number(c.credits) : c.credits,
    level: typeof c.level === 'string' ? Number(c.level) : c.level,
  }
}

async function upsertCourses(items: InputCourse[]) {
  let created = 0, updated = 0
  for (const raw of items) {
    const c = normalize(raw)
    if (!c.code || !c.name) continue
    const deptCode = c.departmentCode || c.code.match(/^[A-Z]+/i)?.[0]?.toUpperCase()
    let deptId: string | undefined
    if (deptCode) {
      const dept = await prisma.department.upsert({
        where: { code: deptCode },
        create: { code: deptCode, name: c.departmentName || deptCode },
        update: { name: c.departmentName || deptCode },
      })
      deptId = dept.id
    }
    const existing = await prisma.course.findUnique({ where: { code: c.code } })
    if (existing) {
      await prisma.course.update({
        where: { id: existing.id },
        data: { name: c.name, credits: c.credits as any, level: c.level as any, departmentId: deptId || existing.departmentId },
      })
      updated++
    } else {
      await prisma.course.create({
        data: { code: c.code, name: c.name, credits: c.credits as any, level: c.level as any, departmentId: deptId! },
      })
      created++
    }
  }
  return { created, updated }
}

async function main() {
  const args = process.argv.slice(2)
  const jsonIdx = args.indexOf('--json')
  const csvIdx = args.indexOf('--csv')
  let mode: '--json' | '--csv' | null = null
  let loc = ''
  if (jsonIdx >= 0 && args[jsonIdx + 1]) {
    mode = '--json'; loc = args[jsonIdx + 1]
  } else if (csvIdx >= 0 && args[csvIdx + 1]) {
    mode = '--csv'; loc = args[csvIdx + 1]
  }
  if (!mode || !loc) {
    console.error('Usage: import-courses --json <url|path> | --csv <url|path>')
    process.exit(1)
  }
  const text = await readSource(mode, loc)
  let items: InputCourse[] = []
  if (mode === '--json') {
    const data = JSON.parse(text)
    items = Array.isArray(data) ? data : data.courses || []
  } else {
    items = parseCSV(text)
  }
  const result = await upsertCourses(items)
  console.log(`Courses imported: created ${result.created}, updated ${result.updated}`)
}

main().finally(async () => {
  await prisma.$disconnect()
})

