import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { ExposureBadge } from "@/components/ui/badges";
import type { AssetWithStats } from "@/types";

function riskColor(score: number): string {
  if (score >= 70) return "#fb7185";
  if (score >= 50) return "#fb923c";
  if (score >= 30) return "#fbbf24";
  return "#34d399";
}

export function TopAssets({ assets }: { assets: AssetWithStats[] }) {
  return (
    <section className="surface flex h-full flex-col p-5" aria-labelledby="top-assets-heading">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Exposure</p>
          <h2 id="top-assets-heading" className="mt-0.5 text-sm font-semibold text-slate-100">
            Highest-risk assets
          </h2>
        </div>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-cyan-200"
        >
          Inventory
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-8 text-center">
          <Boxes className="size-5 text-slate-600" aria-hidden="true" />
          <p className="mt-2 text-xs text-slate-400">No assets yet</p>
          <Link href="/assets?new=1" className="mt-1 text-[10px] text-cyan-300 hover:underline">
            Add your first asset
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {assets.slice(0, 4).map((asset) => (
            <li key={asset.id}>
              <Link href={`/assets/${asset.id}`} className="group block">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200 group-hover:text-cyan-200">
                      {asset.name}
                    </p>
                    <p className="truncate font-mono text-[10px] text-slate-600">
                      {asset.hostname}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-medium text-slate-300 tabular-nums">
                    {asset.riskScore}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${asset.riskScore}%`,
                        backgroundColor: riskColor(asset.riskScore),
                      }}
                    />
                  </span>
                  <span className="font-mono text-[9px] text-slate-600">
                    {asset.openFindings} open
                  </span>
                </div>
                <div className="mt-1.5">
                  <ExposureBadge exposure={asset.exposure} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
