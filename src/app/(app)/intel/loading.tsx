export default function ThreatIntelLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading threat intelligence</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-[34rem] max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[88px] p-4">
            <div className="skeleton h-6 w-10" />
            <div className="skeleton mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="surface h-16 p-3">
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[230px] p-4">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton mt-3 h-5 w-3/4" />
            <div className="skeleton mt-3 h-4 w-full" />
            <div className="skeleton mt-2 h-4 w-5/6" />
            <div className="skeleton mt-4 h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
