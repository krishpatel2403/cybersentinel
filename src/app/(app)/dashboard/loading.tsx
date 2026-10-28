export default function DashboardLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading security overview</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[126px] p-4">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-7 w-16" />
            <div className="skeleton mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="surface h-72 p-5 xl:col-span-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mx-auto mt-6 size-32 rounded-full" />
        </div>
        <div className="surface h-72 p-5 xl:col-span-8">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-6 h-44 w-full" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="surface h-80 p-5 xl:col-span-7">
          <div className="skeleton h-4 w-32" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="surface h-80 p-5 xl:col-span-5">
          <div className="skeleton h-4 w-28" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-6 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
