import Link from "next/link";
import type { Metadata } from "next";
import {
  Activity,
  ChevronRight,
  Globe2,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { getAssetListWithStats } from "@/lib/services/analytics";
import { firstString } from "@/lib/utils";
import { parseAssetType, parseExposure } from "@/lib/validation/filters";
import { ASSET_TYPE_LABELS, EXPOSURE_LABELS } from "@/lib/constants";
import { ASSET_TYPES, EXPOSURES, type AssetType, type Exposure } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Input, Select } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
import { Badge, ExposureBadge, TagBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { AssetDialog } from "@/components/assets/asset-dialog";
import { AssetIcon } from "@/components/assets/asset-icon";

export const metadata: Metadata = { title: "Asset inventory" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AssetsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const search = firstString(params.search).trim();
  const typeParam = parseAssetType(firstString(params.type));
  const exposureParam = parseExposure(firstString(params.exposure));
  const autoOpen = firstString(params.new) === "1";

  const assets = await getAssetListWithStats({
    search: search || undefined,
    type: typeParam,
    exposure: exposureParam,
  });

  const internetFacing = assets.filter((asset) => asset.exposure === "internet").length;
  const highRisk = assets.filter((asset) => asset.riskScore >= 70).length;
  const activeFindings = assets.reduce((sum, asset) => sum + asset.openFindings, 0);
  const filtered = Boolean(search || typeParam || exposureParam);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Inventory"
        title="Asset inventory"
        description="Systems, applications, and cloud resources in scope. Exposure and criticality drive how findings are prioritized."
      >
        <AssetDialog autoOpen={autoOpen} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: filtered ? "Assets in view" : "Total assets",
            value: assets.length,
            icon: SlidersHorizontal,
          },
          { label: "Internet-facing", value: internetFacing, icon: Globe2 },
          { label: "High risk (≥70)", value: highRisk, icon: ShieldAlert },
          { label: "Active findings", value: activeFindings, icon: Activity },
        ].map((stat) => (
          <div key={stat.label} className="surface flex items-center gap-3 px-4 py-3">
            <stat.icon className="size-4 text-slate-600" aria-hidden="true" />
            <div>
              <p className="font-mono text-lg leading-none font-semibold text-white tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        method="get"
        className="surface flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center"
        role="search"
        aria-label="Filter assets"
      >
        <div className="relative flex-1">
          <label htmlFor="asset-search" className="sr-only">
            Search assets
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="asset-search"
            name="search"
            defaultValue={search}
            placeholder="Search name, hostname, IP, owner..."
            className="pl-9"
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="asset-type-filter" className="sr-only">
            Filter by type
          </label>
          <Select
            id="asset-type-filter"
            name="type"
            defaultValue={typeParam ?? ""}
            className="sm:w-44"
          >
            <option value="">All types</option>
            {ASSET_TYPES.map((type: AssetType) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="asset-exposure-filter" className="sr-only">
            Filter by exposure
          </label>
          <Select
            id="asset-exposure-filter"
            name="exposure"
            defaultValue={exposureParam ?? ""}
            className="sm:w-44"
          >
            <option value="">All exposure</option>
            {EXPOSURES.map((exposure: Exposure) => (
              <option key={exposure} value={exposure}>
                {EXPOSURE_LABELS[exposure]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            Apply
          </Button>
          {filtered ? (
            <Link href="/assets" className={buttonClasses("ghost", "md")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {assets.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title={filtered ? "No assets match these filters" : "Inventory is empty"}
          description={
            filtered
              ? "Clear the filters or try a broader search. Filters only search fields visible in your inventory."
              : "Add your first asset to start tracking exposure, findings, and telemetry in one place."
          }
          action={
            filtered ? (
              <Link href="/assets" className={buttonClasses("secondary", "sm")}>
                Clear filters
              </Link>
            ) : (
              <AssetDialog autoOpen />
            )
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.015]">
                  {["Asset", "Type", "Exposure", "Criticality", "Findings", "Risk", ""].map(
                    (heading) => (
                      <th
                        key={heading || "actions"}
                        scope="col"
                        className="px-4 py-2.5 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {assets.map((asset) => (
                  <tr key={asset.id} className="group transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03]">
                          <AssetIcon type={asset.type} className="size-3.5 text-slate-400" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/assets/${asset.id}`}
                            className="block max-w-[20rem] truncate text-xs font-medium text-slate-200 transition hover:text-cyan-200"
                          >
                            {asset.name}
                          </Link>
                          <p className="truncate font-mono text-[10px] text-slate-600">
                            {asset.hostname}
                            {asset.ipAddress ? ` · ${asset.ipAddress}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      {ASSET_TYPE_LABELS[asset.type]}
                    </td>
                    <td className="px-4 py-3">
                      <ExposureBadge exposure={asset.exposure} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-400">
                        {asset.criticality} / 5
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-300">
                          {asset.openFindings} open
                        </span>
                        {asset.criticalFindings > 0 ? (
                          <Badge className="border-rose-500/25 bg-rose-500/10 text-rose-200">
                            {asset.criticalFindings} critical
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.05]">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${asset.riskScore}%`,
                              backgroundColor:
                                asset.riskScore >= 70
                                  ? "#fb7185"
                                  : asset.riskScore >= 50
                                    ? "#fb923c"
                                    : asset.riskScore >= 30
                                      ? "#fbbf24"
                                      : "#34d399",
                            }}
                          />
                        </span>
                        <span className="font-mono text-[11px] font-medium text-slate-300 tabular-nums">
                          {asset.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="inline-flex items-center gap-1 rounded p-1 text-slate-500 transition group-hover:text-cyan-300"
                        aria-label={`View ${asset.name}`}
                      >
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-4 py-2.5">
            <p className="font-mono text-[9px] text-slate-600">
              {assets.length} {assets.length === 1 ? "asset" : "assets"}
              {filtered ? " in filtered view" : ""}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(assets.flatMap((asset) => asset.tags))].slice(0, 5).map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </div>
          </div>
        </div>
      )}

      {!filtered && assets.length > 0 && user.role === "admin" ? (
        <p className="px-1 text-[10px] leading-5 text-slate-600">
          Deletion is restricted to administrators and blocked while findings reference an asset.
        </p>
      ) : null}
    </div>
  );
}
