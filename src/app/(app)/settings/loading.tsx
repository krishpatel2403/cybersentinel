export default function SettingsLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading settings</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-4 w-[30rem] max-w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="surface h-[280px] p-5">
              <div className="flex gap-3">
                <div className="skeleton size-9" />
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-56" />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="skeleton h-16 w-full" />
                <div className="skeleton h-16 w-full" />
              </div>
              <div className="skeleton mt-4 h-9 w-28" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="surface h-[260px] p-5">
              <div className="skeleton h-4 w-24" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div key={row} className="flex gap-3">
                    <div className="skeleton size-7" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-2.5 w-16" />
                      <div className="skeleton h-3.5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
