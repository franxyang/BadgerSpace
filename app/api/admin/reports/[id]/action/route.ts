import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { action?: string; note?: string }
  const report = await prisma.report.findUnique({ where: { id: params.id } })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const action = (body.action || '').toLowerCase()
  if (action === 'hide') {
    await prisma.review.update({ where: { id: report.reviewId }, data: { hidden: true, moderationNote: body.note || null } })
    await prisma.report.update({ where: { id: report.id }, data: { status: 'RESOLVED' } })
    return NextResponse.json({ ok: true })
  }
  if (action === 'restore') {
    await prisma.review.update({ where: { id: report.reviewId }, data: { hidden: false } })
    await prisma.report.update({ where: { id: report.id }, data: { status: 'RESOLVED' } })
    return NextResponse.json({ ok: true })
  }
  if (action === 'resolve') {
    await prisma.report.update({ where: { id: report.id }, data: { status: 'RESOLVED' } })
    return NextResponse.json({ ok: true })
  }
  if (action === 'reject') {
    await prisma.report.update({ where: { id: report.id }, data: { status: 'REJECTED' } })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
