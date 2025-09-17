import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ratingToUWLetter, average } from '@/lib/grades';

export async function GET() {
  const courses = await prisma.course.findMany({
    take: 50,
    include: { reviews: { where: { hidden: false }, select: { ratingContent: true, ratingTeaching: true, ratingGrading: true, ratingWorkload: true } } },
  });
  const payload = courses.map((c) => {
    const rc = c.reviews.map((r) => r.ratingContent);
    const rt = c.reviews.map((r) => r.ratingTeaching);
    const rg = c.reviews.map((r) => r.ratingGrading);
    const rw = c.reviews.map((r) => r.ratingWorkload);
    return {
      code: c.code,
      name: c.name,
      contentGrade: c.reviews.length ? ratingToUWLetter(average(rc)) : '-',
      teachingGrade: c.reviews.length ? ratingToUWLetter(average(rt)) : '-',
      gradingGrade: c.reviews.length ? ratingToUWLetter(average(rg)) : '-',
      workloadGrade: c.reviews.length ? ratingToUWLetter(average(rw)) : '-',
      snippet: c.description || '',
    };
  });
  return NextResponse.json(payload);
}
