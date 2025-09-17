import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Account() {
  const session = await getServerSession(authOptions)
  return (
    <div className='container py-8'>
      <div className='card p-6'>
        <h1 className='text-xl font-semibold'>Account</h1>
        {session?.user ? (
          <div className='mt-3 text-sm text-gray-700'>
            <p>Signed in as: <span className='font-medium'>{session.user.email}</span></p>
            <p>Role: <span className='font-medium'>{(session.user as any).role || 'USER'}</span></p>
            <div className='mt-4'>
              <a className='app-btn gray' href='/account/degree-plan'>Degree Planner Import</a>
            </div>
          </div>
        ) : (
          <p className='text-gray-600 mt-2 text-sm'>Please sign in to view your profile and contributions.</p>
        )}
      </div>
    </div>
  )
}
