import { APP_VERSION } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { NavSections } from "@/components/layout/nav";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/8 bg-[#060b14]/90 backdrop-blur-xl md:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavSections isAdmin={isAdmin} />
      </div>
      <div className="space-y-3 border-t border-white/8 px-4 py-4">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[11px] font-medium text-emerald-200">Portfolio demo</p>
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
            Seeded sample data and simulated telemetry. Not a live security feed.
          </p>
        </div>
        <div className="flex items-center justify-between px-1 font-mono text-[10px] text-slate-600">
          <span>v{APP_VERSION}</span>
          <span>SQLite · Next.js</span>
        </div>
      </div>
    </aside>
  );
}
