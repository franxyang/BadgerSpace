
export default function QuickLinks() {
  const links = [
    { name: 'Canvas', href: '#' },
    { name: 'Student Center', href: '#' },
    { name: 'Course Catalog', href: '#' },
    { name: 'Class Schedule & Quota', href: '#' },
    { name: 'Timetable Planner', href: '#' },
    { name: 'Path Advisor', href: '#' },
    { name: 'View My Grades', href: '#' },
    { name: 'General Education Requirements', href: '#' },
    { name: 'BSc in Math & Econ', href: '#' },
    { name: 'Department of Mathematics', href: '#' },
  ];
  return (
    <aside className="card p-4">
      <h3 className="font-semibold mb-3">Quick Links</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.name}>
            <a href={l.href} className="text-sm text-blue-700 hover:underline inline-flex items-center gap-2">
              <span aria-hidden>↗</span>
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
