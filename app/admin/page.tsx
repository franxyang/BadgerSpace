import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import AdminReportsClient from './reports-client'
import AdminImportClient from './import-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return <div className="container py-8">Forbidden.</div>
  }
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { Review: { include: { Course: true } } },
  })
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold">Admin Moderation</h1>
      <p className="text-sm text-gray-600 mt-1">Review reports and hide/restore when needed.</p>
      <AdminReportsClient reports={reports.map(r => ({
        id: r.id,
        status: r.status,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
        review: { id: r.reviewId, semester: r.Review.semester, content: r.Review.content, hidden: r.Review.hidden, courseCode: r.Review.Course.code, courseName: r.Review.Course.name },
      }))} />
      <AdminImportClient />
    </div>
  )
}
