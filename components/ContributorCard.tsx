
export default function ContributorCard() {
  const pct = 45;
  return (
    <section className="card p-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <h2 className="text-lg font-semibold">Contributor Lv.1</h2>
      </div>
      <p className="mt-2 text-gray-600 text-sm">
        We appreciate your contribution! The higher your level, the more privileges you have.
      </p>
      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-uw-red" style={{ width: `${pct}%`}}/>
      </div>
      <p className="mt-1 text-xs text-gray-500">Write 2 more course reviews to reach the next level.</p>
    </section>
  );
}
