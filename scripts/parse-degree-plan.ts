/*
  Parse a UW Degree Planner PDF and import only course code + term (semester) for the signed-in user.
  Grades and any personal data are ignored and never stored.

  Usage:
    npm run degree:import -- --pdf ./reference/DEGREE_PLAN-...pdf --user you@example.com

  Notes:
    - Requires dev dependency `pdf-parse` to be installed (`npm i -D pdf-parse`).
    - Heuristics try to detect patterns like "MATH 521" and terms like "Fall 2025".
*/

import fs from 'node:fs/promises'
import path from 'node:path'
import pdfParse from 'pdf-parse'
import { prisma } from '@/lib/prisma'

function extractCourses(text: string): Array<{ code: string; term?: string }> {
  const lines = text.split(/\r?\n/)
  const out: Array<{ code: string; term?: string }> = []
  let currentTerm: string | undefined
  for (const line of lines) {
    const termMatch = line.match(/(Fall|Winter|Spring|Summer)\s+(20\d{2})/i)
    if (termMatch) {
      currentTerm = `${termMatch[2]}-${termMatch[1][0].toUpperCase()}${termMatch[1].slice(1).toLowerCase()}`
    }
    // Match course codes like "MATH 521", "CS 400", "ECON 101"
    const courseMatches = [...line.matchAll(/\b([A-Z&]{2,})\s+(\d{3,4}[A-Z]?)\b/g)]
    for (const m of courseMatches) {
      const code = `${m[1]}${m[2]}`.toUpperCase()
      out.push({ code, term: currentTerm })
    }
  }
  // Deduplicate by code+term, keep first occurrence
  const seen = new Set<string>()
  return out.filter((c) => {
    const key = `${c.code}|${c.term || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function main() {
  const args = process.argv.slice(2)
  const pdfIdx = args.indexOf('--pdf')
  const userIdx = args.indexOf('--user')
  const pdfPath = pdfIdx >= 0 ? args[pdfIdx + 1] : ''
  const userEmail = userIdx >= 0 ? args[userIdx + 1] : ''
  if (!pdfPath || !userEmail) {
    console.error('Usage: degree:import --pdf <path.pdf> --user <email@wisc.edu>')
    process.exit(1)
  }
  const abs = path.resolve(process.cwd(), pdfPath)
  const buf = await fs.readFile(abs)
  const parsed = await pdfParse(buf)
  const items = extractCourses(parsed.text)
  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    console.error('User not found. Ensure the account exists and is signed in at least once.')
    process.exit(1)
  }
  let created = 0
  for (const it of items) {
    try {
      await prisma.importedCourse.upsert({
        where: { userId_courseCode_semester: { userId: user.id, courseCode: it.code, semester: it.term || 'unknown' } },
        create: { userId: user.id, courseCode: it.code, semester: it.term || 'unknown' },
        update: {},
      })
      created++
    } catch {
      // ignore duplicates
    }
  }
  console.log(`Imported ${created} course entries for ${userEmail}`)
}

main().finally(async () => {
  await prisma.$disconnect()
})

