import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateReviewSchema } from '@/lib/validators'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const parsed = updateReviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const review = await prisma.review.findUnique({ where: { id: params.id } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const isOwner = user && review.userId === user.id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const updated = await prisma.review.update({ where: { id: review.id }, data: parsed.data })
  return NextResponse.json({ id: updated.id })
}
