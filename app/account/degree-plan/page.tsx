import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import DegreePlanClient from './upload-client'
import ClearButton from './ClearButton'

export const dynamic = 'force-dynamic'

export default async function DegreePlanPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return <div className="container py-8">Please sign in.</div>
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const items = user ? await prisma.importedCourse.findMany({ where: { userId: user.id }, orderBy: { semester: 'desc' } }) : []
  return (
    <div className="container py-8 space-y-6">
      <section className="card p-6 space-y-3">
        <h1 className="text-xl font-semibold">Degree Planner Import</h1>
        <p className="text-sm text-gray-600">Upload your Degree Planner PDF to add only course code + semester to your account. Grades are never stored.</p>
        <DegreePlanClient />
      </section>
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Imported Courses</h2>
          <ClearButton />
        </div>
        <div className="mt-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No imported courses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Semester</th>
                    <th className="py-2">Course Code</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="py-2">{it.semester}</td>
                      <td className="py-2">{it.courseCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
