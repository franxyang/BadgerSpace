
import Link from 'next/link';

type Course = {
  code: string;
  name: string;
  contentGrade: string;
  teachingGrade: string;
  gradingGrade: string;
  workloadGrade: string;
  snippet: string;
};

const Grade = ({ value }: { value: string }) => {
  const map: Record<string, string> = {
    A: 'badge-green',
    AB: 'badge-green',
    B: 'badge-blue',
    BC: 'badge-blue',
    C: 'badge-amber',
    D: 'badge-amber',
    F: 'badge-red',
  };
  return <span className={`badge ${map[value] || 'badge-blue'}`}>{value}</span>;
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <article className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <Link href={`/courses/${course.code}`} className="font-semibold hover:underline">{course.code}</Link>
        <div className="flex gap-2">
          <Grade value={course.contentGrade} />
          <Grade value={course.teachingGrade} />
          <Grade value={course.gradingGrade} />
          <Grade value={course.workloadGrade} />
        </div>
      </div>
      <div className="text-gray-600 text-sm mt-1 line-clamp-3">{course.snippet}</div>
    </article>
  );
}
