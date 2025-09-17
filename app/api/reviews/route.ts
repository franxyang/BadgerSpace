import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createReviewSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseCode = (searchParams.get('course') || '').toUpperCase()
  const page = Number(searchParams.get('page') || '1')
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '10')))
  if (!courseCode) return NextResponse.json({ error: 'Missing course' }, { status: 400 })
  const course = await prisma.course.findUnique({ where: { code: courseCode } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  const session = await getServerSession(authOptions)
  const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null
  const userReviewCount = user ? await prisma.review.count({ where: { userId: user.id } }) : 0
  const redact = !userReviewCount
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { courseId: course.id, hidden: false },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        semester: true,
        content: true,
        ratingContent: true,
        ratingTeaching: true,
        ratingGrading: true,
        ratingWorkload: true,
        helpfulCount: true,
        createdAt: true,
        hidden: true,
      },
    }),
    prisma.review.count({ where: { courseId: course.id, hidden: false } }),
  ])
  const data = items.map((r) => ({
    ...r,
    content: redact ? '' : r.content,
  }))
  return NextResponse.json({ data, total, page, pageSize, redact })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim()
  const rlKey = `rvw:${ip}:${session.user.email}`
  if (!rateLimit(rlKey, 10)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const body = await req.json().catch(() => ({}))
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })
  const { courseCode, semester, instructorName, ta, content, ratingContent, ratingTeaching, ratingGrading, ratingWorkload } = parsed.data
  const course = await prisma.course.findUnique({ where: { code: courseCode.toUpperCase() } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  let instructorId: string | undefined
  if (instructorName) {
    const instr = await prisma.instructor.upsert({
      where: { name: instructorName },
      create: { name: instructorName },
      update: {},
    })
    instructorId = instr.id
    // Link course and instructor if not already
    await prisma.courseInstructor.upsert({
      where: { courseId_instructorId: { courseId: course.id, instructorId: instr.id } },
      create: { courseId: course.id, instructorId: instr.id },
      update: {},
    })
  }
  try {
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        courseId: course.id,
        semester,
        instructorId,
        ta,
        content,
        ratingContent,
        ratingTeaching,
        ratingGrading,
        ratingWorkload,
      },
    })
    return NextResponse.json({ id: review.id }, { status: 201 })
  } catch (e: any) {
    const msg = e?.code === 'P2002' ? 'Duplicate review for this semester' : 'Failed to create review'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
