
import { prisma } from '@/lib/prisma';
import { ratingToUWLetter, average } from '@/lib/grades';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { shouldRedactReviews } from '@/lib/access';
import WriteReview from './WriteReview';

export const dynamic = 'force-dynamic';

export default async function CourseDetail({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null;
  const userReviewCount = user ? await prisma.review.count({ where: { userId: user.id } }) : 0;
  const redact = shouldRedactReviews(userReviewCount);

  const course = await prisma.course.findUnique({
    where: { code },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
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
        where: { hidden: false },
      },
    },
  });
  if (!course) return <div className="container py-8">Course not found.</div>;
  const offerings = await prisma.offering.findMany({ where: { courseId: course.id }, select: { term: true }, distinct: ['term'] })
  const termOptions = offerings.map((o) => o.term).filter(Boolean) as string[]

  const contentLetter = course.reviews.length
    ? ratingToUWLetter(average(course.reviews.map((r) => r.ratingContent)))
    : '-';
  const teachingLetter = course.reviews.length
    ? ratingToUWLetter(average(course.reviews.map((r) => r.ratingTeaching)))
    : '-';
  const gradingLetter = course.reviews.length
    ? ratingToUWLetter(average(course.reviews.map((r) => r.ratingGrading)))
    : '-';
  const workloadLetter = course.reviews.length
    ? ratingToUWLetter(average(course.reviews.map((r) => r.ratingWorkload)))
    : '-';

  return (
    <div className="container py-8 space-y-6">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">{course.code} — {course.name}</h1>
        {course.description && <p className="mt-2 text-gray-600">{course.description}</p>}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">CONTENT</div>
            <div className="text-lg font-semibold">{contentLetter}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">TEACHING</div>
            <div className="text-lg font-semibold">{teachingLetter}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">GRADING</div>
            <div className="text-lg font-semibold">{gradingLetter}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">WORKLOAD</div>
            <div className="text-lg font-semibold">{workloadLetter}</div>
          </div>
        </div>
      </section>
      <WriteReview courseCode={course.code} terms={termOptions} />
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="mt-4 space-y-4">
          {course.reviews.map((r) => (
            <article key={r.id} className="border-b pb-4 last:border-0">
              <div className="text-sm text-gray-500">{r.semester}</div>
              <p className={`mt-1 ${redact ? 'blur-sm select-none' : ''}`}>
                {redact ? 'Write a review to unlock full comments.' : r.content}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>Content: {r.ratingContent}</span>
                <span>Teaching: {r.ratingTeaching}</span>
                <span>Grading: {r.ratingGrading}</span>
                <span>Workload: {r.ratingWorkload}</span>
              </div>
            </article>
          ))}
          {course.reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet. Be the first to write one.</p>
          )}
        </div>
      </section>
    </div>
  );
}
