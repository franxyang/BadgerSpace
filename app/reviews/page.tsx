
import CourseCard from '@/components/CourseCard';
import { prisma } from '@/lib/prisma';
import { ratingToUWLetter, average } from '@/lib/grades';

export const dynamic = 'force-dynamic';

type Search = {
  q?: string;
  dept?: string;
  level?: number;
  creditsMin?: number;
  creditsMax?: number;
  instructor?: string;
  sort?: 'newest' | 'mostReviewed' | 'top' | 'popularity';
  page?: number;
  pageSize?: number;
}

async function getCourses(params: Search) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(24, Math.max(1, params.pageSize || 12));
  const where: any = {};
  if (params.q) {
    where.OR = [
      { code: { contains: params.q, mode: 'insensitive' } },
      { name: { contains: params.q, mode: 'insensitive' } },
    ];
  }
  if (params.dept) {
    where.department = { code: params.dept.toUpperCase() };
  }
  if (params.level) where.level = params.level;
  if (params.creditsMin || params.creditsMax) {
    where.credits = {};
    if (params.creditsMin) where.credits.gte = params.creditsMin;
    if (params.creditsMax) where.credits.lte = params.creditsMax;
  }
  if (params.instructor) {
    where.instructors = {
      some: { Instructor: { name: { contains: params.instructor, mode: 'insensitive' } } },
    };
  }

  // Base ordering; advanced sorts handled post-fetch
  const orderBy = params.sort === 'newest' ? { createdAt: 'desc' } : { code: 'asc' } as any;

  const [courses, counts, depts] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { reviews: true } },
        reviews: { where: { hidden: false }, select: { ratingContent: true, ratingTeaching: true, ratingGrading: true, ratingWorkload: true, helpfulCount: true } },
        department: true,
      },
    }),
    prisma.course.count({ where }),
    prisma.department.findMany({ orderBy: { code: 'asc' } }),
  ]);

  const enriched = courses.map((c) => {
    const rc = c.reviews.map((r) => r.ratingContent);
    const rt = c.reviews.map((r) => r.ratingTeaching);
    const rg = c.reviews.map((r) => r.ratingGrading);
    const rw = c.reviews.map((r) => r.ratingWorkload);
    const contentGrade = c.reviews.length ? ratingToUWLetter(average(rc)) : '-';
    const teachingGrade = c.reviews.length ? ratingToUWLetter(average(rt)) : '-';
    const gradingGrade = c.reviews.length ? ratingToUWLetter(average(rg)) : '-';
    const workloadGrade = c.reviews.length ? ratingToUWLetter(average(rw)) : '-';
    const helpfulSum = c.reviews.reduce((s, r) => s + (r.helpfulCount || 0), 0);
    const avgAll = c.reviews.length ? average([average(rc), average(rt), average(rg), average(rw)]) : 0;
    const popularity = helpfulSum + c._count.reviews;
    return { code: c.code, name: c.name, snippet: c.description || '', contentGrade, teachingGrade, gradingGrade, workloadGrade, reviewsCount: c._count.reviews, popularity, avgAll };
  });

  if (params.sort === 'mostReviewed') enriched.sort((a, b) => b.reviewsCount - a.reviewsCount);
  if (params.sort === 'top') enriched.sort((a, b) => b.avgAll - a.avgAll);
  if (params.sort === 'popularity') enriched.sort((a, b) => b.popularity - a.popularity);

  return { items: enriched, total: counts, departments: depts, page, pageSize };
}

export default async function ReviewsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const params: Search = {
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    dept: typeof searchParams.dept === 'string' ? searchParams.dept : undefined,
    level: searchParams.level ? Number(searchParams.level) : undefined,
    creditsMin: searchParams.creditsMin ? Number(searchParams.creditsMin) : undefined,
    creditsMax: searchParams.creditsMax ? Number(searchParams.creditsMax) : undefined,
    instructor: typeof searchParams.instructor === 'string' ? searchParams.instructor : undefined,
    sort: (searchParams.sort as any) || 'newest',
    page: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 12,
  };
  const { items, total, departments, page, pageSize } = await getCourses(params);
  const popular = [...items].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const topRated = [...items].sort((a, b) => b.avgAll - a.avgAll).slice(0, 5);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <form className="card p-4 grid grid-cols-2 md:grid-cols-6 gap-3" method="GET">
            <input aria-label="Search" name="q" defaultValue={params.q} placeholder="Search code or name" className="input col-span-2 md:col-span-2" />
            <select aria-label="Department" name="dept" defaultValue={params.dept || ''} className="input">
              <option value="">Dept</option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>{d.code}</option>
              ))}
            </select>
            <input aria-label="Level" name="level" defaultValue={params.level || ''} placeholder="Level" className="input" />
            <input aria-label="Credits min" name="creditsMin" defaultValue={params.creditsMin || ''} placeholder="Cr min" className="input" />
            <input aria-label="Credits max" name="creditsMax" defaultValue={params.creditsMax || ''} placeholder="Cr max" className="input" />
            <input aria-label="Instructor" name="instructor" defaultValue={params.instructor || ''} placeholder="Instructor" className="input col-span-2 md:col-span-2" />
            <select aria-label="Sort" name="sort" defaultValue={params.sort} className="input">
              <option value="newest">Newest</option>
              <option value="mostReviewed">Most Reviewed</option>
              <option value="top">Top Rated</option>
              <option value="popularity">Popularity</option>
            </select>
            <button className="app-btn blue col-span-2 md:col-span-1" type="submit">Apply</button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((c) => (
              <CourseCard key={c.code} course={c as any} />
            ))}
            {items.length === 0 && <p className="text-sm text-gray-500">No results.</p>}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Page {page} / {totalPages} • {total} results</div>
            <div className="flex gap-2">
              {page > 1 && (
                <a className="app-btn gray" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])), page: String(page-1) } as any).toString()}`}>Prev</a>
              )}
              {page < totalPages && (
                <a className="app-btn gray" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])), page: String(page+1) } as any).toString()}`}>Next</a>
              )}
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <section className="card p-4">
            <h3 className="font-semibold">Most Popular Courses</h3>
            <ol className="mt-2 space-y-1 list-decimal ps-5 text-sm">
              {popular.map((c, i) => (
                <li key={i}>
                  <a className="hover:underline" href={'/courses/' + c.code}>
                    {c.code} {c.name}
                  </a>
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-4">
            <h3 className="font-semibold">Top Rated Courses</h3>
            <ol className="mt-2 space-y-1 list-decimal ps-5 text-sm">
              {topRated.map((c, i) => (
                <li key={i}>
                  <a className="hover:underline" href={'/courses/' + c.code}>
                    {c.code} {c.name}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
