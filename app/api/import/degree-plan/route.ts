import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractCoursesFromPdf } from '@/lib/pdf'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const items = await extractCoursesFromPdf(buffer)
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })
  let created = 0
  for (const it of items) {
    try {
      await prisma.importedCourse.upsert({
        where: { userId_courseCode_semester: { userId: user.id, courseCode: it.code, semester: it.term || 'unknown' } },
        create: { userId: user.id, courseCode: it.code, semester: it.term || 'unknown' },
        update: {},
      })
      created++
    } catch {}
  }
  return NextResponse.json({ imported: created })
}
