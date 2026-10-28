export default function CopilotLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading copilot</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-4 w-[30rem] max-w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="surface flex min-h-[600px] flex-col p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton size-8 rounded-lg" />
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-32" />
              <div className="skeleton h-2.5 w-44" />
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-3">
            <div className="skeleton size-12 rounded-2xl" />
            <div className="skeleton h-5 w-64" />
            <div className="skeleton h-3 w-full max-w-sm" />
            <div className="mt-3 grid w-full gap-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-11 w-full" />
              ))}
            </div>
          </div>
          <div className="skeleton h-14 w-full" />
        </div>
        <div className="space-y-4">
          <div className="surface h-52 p-4">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton mt-3 h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-5/6" />
          </div>
          <div className="surface h-40 p-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton mt-3 h-8 w-full" />
            <div className="skeleton mt-2 h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
