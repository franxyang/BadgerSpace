/*
  Extract schedule JSON payloads from a HAR file for public.enroll.wisc.edu
  and optionally upsert offerings + instructors into Prisma.

  Usage:
    npm run har:enroll -- --har ./fixtures/public.enroll.wisc.edu.har --term 2025-Fall --apply
    npm run har:enroll -- --har ./fixtures/public.enroll.wisc.edu.har --out ./fixtures/json

  Notes:
    - If --apply is provided, --term is required. Each JSON payload is parsed
      and applied via the schedule adapter.
    - Without --apply, JSON payloads are written to the --out directory.
*/

import fs from 'node:fs/promises'
import path from 'node:path'
import { parseEnrollJSON, upsertSchedule } from './scrape-uw'
import { prisma } from '@/lib/prisma'

type Har = {
  log: {
    entries: Array<{
      request: { url: string }
      response: { content?: { mimeType?: string; text?: string; encoding?: string } }
    }>
  }
}

async function main() {
  const args = process.argv.slice(2)
  const harIdx = args.indexOf('--har')
  const outIdx = args.indexOf('--out')
  const termIdx = args.indexOf('--term')
  const apply = args.includes('--apply')
  const harPath = harIdx >= 0 ? args[harIdx + 1] : ''
  const outDir = outIdx >= 0 ? args[outIdx + 1] : ''
  const term = termIdx >= 0 ? args[termIdx + 1] : ''
  if (!harPath) {
    console.error('Provide --har <path>')
    process.exit(1)
  }
  if (apply && !term) {
    console.error('Provide --term when using --apply (e.g., 2025-Fall)')
    process.exit(1)
  }
  const raw = await fs.readFile(path.resolve(process.cwd(), harPath), 'utf8')
  const har: Har = JSON.parse(raw)
  const entries = har.log?.entries || []
  let count = 0
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const url = e.request?.url || ''
    if (!/public\.enroll\.wisc\.edu/i.test(url)) continue
    const c = e.response?.content
    if (!c?.text) continue
    const mime = (c.mimeType || '').toLowerCase()
    if (mime && !mime.includes('json') && !mime.includes('javascript') && !mime.includes('text')) continue
    let text = c.text
    if (c.encoding === 'base64') {
      try { text = Buffer.from(text, 'base64').toString('utf8') } catch {}
    }
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) continue
    if (apply) {
      const items = parseEnrollJSON(text)
      if (items.length) {
        await upsertSchedule(term, items)
        count += items.length
      }
    } else if (outDir) {
      const safeName = url.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 100)
      const file = path.resolve(process.cwd(), outDir, `${String(i).padStart(4, '0')}_${safeName}.json`)
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, text, 'utf8')
      count++
    }
  }
  if (apply) console.log(`Applied schedule items for term ${term}: ${count}`)
  else console.log(`Extracted JSON payloads: ${count}`)
}

main().finally(async () => {
  await prisma.$disconnect()
})
