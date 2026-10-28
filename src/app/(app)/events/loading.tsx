export default function EventsLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading security events</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-[32rem] max-w-full" />
      </div>
      <div className="skeleton h-[68px] w-full rounded-xl" />
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="surface h-[58px] p-3">
            <div className="skeleton h-4 w-8" />
            <div className="skeleton mt-2 h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="surface h-16 p-3">
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="surface h-[460px] p-4">
        <div className="skeleton h-8 w-full" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
