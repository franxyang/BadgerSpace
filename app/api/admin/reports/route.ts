import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      Review: { select: { id: true, content: true, semester: true, hidden: true, Course: { select: { code: true, name: true } } } },
    },
  })
  return NextResponse.json({ data: reports })
}

