export default function AuditLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading audit log</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-44" />
        <div className="skeleton h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[80px] p-4">
            <div className="skeleton h-5 w-16" />
            <div className="skeleton mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="surface h-16 p-3">
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="surface h-[480px] p-4">
        <div className="skeleton h-8 w-full" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="skeleton h-11 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
