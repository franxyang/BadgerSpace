import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { voteSchema } from '@/lib/validators'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const parsed = voteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })
  const review = await prisma.review.findUnique({ where: { id: params.id } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.vote.upsert({
    where: { userId_reviewId: { userId: user.id, reviewId: review.id } },
    create: { userId: user.id, reviewId: review.id, value: parsed.data.value },
    update: { value: parsed.data.value },
  })
  // Recompute helpfulCount as sum of votes
  const agg = await prisma.vote.aggregate({ where: { reviewId: review.id }, _sum: { value: true } })
  await prisma.review.update({ where: { id: review.id }, data: { helpfulCount: agg._sum.value || 0 } })
  return NextResponse.json({ ok: true, helpfulCount: agg._sum.value || 0 })
}
