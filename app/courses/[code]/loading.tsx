export default function Loading() {
  return (
    <div className="container py-8 space-y-6">
      <section className="card p-6">
        <div className="skeleton h-7 w-64" />
        <div className="skeleton h-4 w-full mt-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="skeleton h-3 w-16 mx-auto" />
              <div className="skeleton h-5 w-10 mx-auto mt-2" />
            </div>
          ))}
        </div>
      </section>
      <div className="card p-4">
        <div className="skeleton h-9 w-40" />
      </div>
      <section className="card p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </section>
    </div>
  )
}

