export default function AssetsLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Loading asset inventory</span>
      <div className="space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[68px] p-4">
            <div className="skeleton h-5 w-12" />
            <div className="skeleton mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="surface h-16 p-3">
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="surface h-96 p-4">
        <div className="skeleton h-8 w-full" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
