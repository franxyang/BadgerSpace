import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { reportSchema } from '@/lib/validators'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })
  const review = await prisma.review.findUnique({ where: { id: params.id } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.report.create({ data: { reviewId: review.id, reporterId: user.id, reason: parsed.data.reason } })
  await prisma.review.update({ where: { id: review.id }, data: { reported: true } })
  return NextResponse.json({ ok: true })
}

