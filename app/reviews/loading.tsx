export default function Loading() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="card p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="skeleton h-9 col-span-2" />
            <div className="skeleton h-9" />
            <div className="skeleton h-9" />
            <div className="skeleton h-9" />
            <div className="skeleton h-9 col-span-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="skeleton h-4 w-24" />
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-10 rounded-full" />
                    <div className="skeleton h-5 w-10 rounded-full" />
                    <div className="skeleton h-5 w-10 rounded-full" />
                    <div className="skeleton h-5 w-10 rounded-full" />
                  </div>
                </div>
                <div className="skeleton mt-2 h-12 w-full" />
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card p-4 space-y-2">
            <div className="skeleton h-4 w-48" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-64" />
            ))}
          </div>
          <div className="card p-4 space-y-2">
            <div className="skeleton h-4 w-48" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-64" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

