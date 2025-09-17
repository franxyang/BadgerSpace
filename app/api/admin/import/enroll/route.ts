import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { parseEnrollJSON } from '@/lib/enroll-parser'
import { upsertSchedule } from '@/lib/schedule'

type Har = {
  log: { entries: Array<{ request: { url: string }; response: { content?: { mimeType?: string; text?: string; encoding?: string } } }> }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  const term = String(form.get('term') || '')
  const file = form.get('file') as File | null
  if (!term) return NextResponse.json({ error: 'Missing term' }, { status: 400 })
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  const buf = Buffer.from(await (await file.arrayBuffer()))

  let jsonTexts: string[] = []
  const name = (file as any).name || ''
  const mime = file.type || ''
  try {
    const text = buf.toString('utf8')
    if (name.toLowerCase().endsWith('.har') || mime.includes('har')) {
      const har: Har = JSON.parse(text)
      for (const e of har.log?.entries || []) {
        const url = e.request?.url || ''
        if (!/public\.enroll\.wisc\.edu/i.test(url)) continue
        const c = e.response?.content
        if (!c?.text) continue
        let body = c.text
        if (c.encoding === 'base64') {
          try { body = Buffer.from(body, 'base64').toString('utf8') } catch {}
        }
        if (body.trim().startsWith('{') || body.trim().startsWith('[')) jsonTexts.push(body)
      }
    } else {
      // Treat as raw JSON payload
      jsonTexts.push(text)
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to parse upload: ' + e.message }, { status: 400 })
  }

  const items = jsonTexts.flatMap((t) => parseEnrollJSON(t))
  const dedup = new Map<string, { code: string; section?: string; instructors: string[] }>()
  for (const it of items) {
    const key = `${it.code}|${it.section || ''}`
    dedup.set(key, { code: it.code, section: it.section, instructors: Array.from(new Set([...(dedup.get(key)?.instructors || []), ...it.instructors])) })
  }

  const { offeringCount, instructorLinks } = await upsertSchedule(term, Array.from(dedup.values()))
  return NextResponse.json({ term, offerings: offeringCount, instructorsLinked: instructorLinks })
}

