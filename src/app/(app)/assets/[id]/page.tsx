import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ChevronRight, Clock, ShieldAlert } from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { getAssetById, listAssets } from "@/lib/repositories/assets";
import { listFindings } from "@/lib/repositories/findings";
import { getEventsForAsset } from "@/lib/repositories/events";
import { computeAssetRisk } from "@/lib/risk";
import {
  ASSET_TYPE_LABELS,
  EXPOSURE_LABELS,
  SEVERITY_CHART_COLORS,
  SEVERITY_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { deleteAssetAction } from "@/actions/assets";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, ExposureBadge, SeverityBadge, StatusBadge, TagBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { buttonClasses } from "@/components/ui/button";
import { AssetDialog } from "@/components/assets/asset-dialog";
import { AssetIcon } from "@/components/assets/asset-icon";
import { FindingDialog } from "@/components/findings/finding-dialog";

export const metadata: Metadata = { title: "Asset detail" };

type Params = Promise<{ id: string }>;

export default async function AssetDetailPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) notFound();

  const [findings, allAssets, events] = await Promise.all([
    listFindings({ assetId: id, limit: 500 }),
    listAssets(),
    getEventsForAsset(id, 8),
  ]);

  const activeFindings = findings.filter((finding) => finding.status !== "resolved");
  const riskScore = computeAssetRisk(activeFindings, asset);
  const criticalCount = activeFindings.filter((finding) => finding.severity === "critical").length;
  const highCount = activeFindings.filter((finding) => finding.severity === "high").length;

  return (
    <div className="space-y-4">
      <Link
        href="/assets"
        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 transition hover:text-cyan-200"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to inventory
      </Link>

      <PageHeader
        eyebrow="Asset detail"
        title={asset.name}
        description={`${asset.hostname}${asset.ipAddress ? ` · ${asset.ipAddress}` : ""} · owned by ${asset.owner}`}
      >
        <FindingDialog assets={allAssets} role={user.role} defaultAssetId={asset.id} />
        <AssetDialog asset={asset} />
        {user.role === "admin" && findings.length === 0 ? (
          <ConfirmActionButton
            action={deleteAssetAction.bind(null, asset.id)}
            triggerLabel="Delete asset"
            title="Delete this asset?"
            description={`${asset.name} will be permanently removed from the inventory.`}
            confirmLabel="Delete asset"
            successHref="/assets"
            size="md"
          />
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-white/10 bg-white/[0.03] text-slate-300">
          <AssetIcon type={asset.type} className="size-3" />
          {ASSET_TYPE_LABELS[asset.type]}
        </Badge>
        <ExposureBadge exposure={asset.exposure} />
        <Badge className="border-white/10 bg-white/[0.03] text-slate-300">
          Criticality {asset.criticality} / 5
        </Badge>
        {asset.tags.map((tag) => (
          <TagBadge key={tag}>{tag}</TagBadge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="surface p-4">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Risk score</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-white tabular-nums">
            {riskScore}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${riskScore}%`,
                backgroundColor:
                  riskScore >= 70
                    ? "#fb7185"
                    : riskScore >= 50
                      ? "#fb923c"
                      : riskScore >= 30
                        ? "#fbbf24"
                        : "#34d399",
              }}
            />
          </div>
        </div>
        <div className="surface p-4">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Active findings</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-white tabular-nums">
            {activeFindings.length}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">{findings.length} lifetime</p>
        </div>
        <div className="surface p-4">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Critical / High</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-white tabular-nums">
            {criticalCount} <span className="text-slate-600">/</span> {highCount}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">Unresolved only</p>
        </div>
        <div className="surface p-4">
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">Exposure</p>
          <p className="mt-1 text-sm font-medium text-slate-200">
            {EXPOSURE_LABELS[asset.exposure]}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">Criticality {asset.criticality} / 5</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="surface xl:col-span-8" aria-labelledby="asset-findings-heading">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
            <div>
              <p className="text-[10px] tracking-wide text-slate-500 uppercase">Findings</p>
              <h2 id="asset-findings-heading" className="text-sm font-semibold text-slate-100">
                Vulnerabilities and weaknesses
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-400">
              {findings.length}
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShieldAlert}
                title="No findings on this asset"
                description="The queue is clear. New findings can be recorded manually or imported by a scanner in a future milestone."
                action={
                  <FindingDialog assets={allAssets} role={user.role} defaultAssetId={asset.id} />
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.055]">
              {findings.map((finding) => (
                <li key={finding.id}>
                  <Link
                    href={`/findings/${finding.id}`}
                    className="group flex items-start gap-3 px-5 py-3 transition hover:bg-white/[0.02]"
                  >
                    <span
                      className="mt-1 h-9 w-0.5 shrink-0 rounded-full"
                      style={{ backgroundColor: SEVERITY_CHART_COLORS[finding.severity] }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={finding.severity} />
                        <StatusBadge status={finding.status} />
                        {finding.cveId ? (
                          <span className="font-mono text-[9px] text-slate-600">
                            {finding.cveId}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-slate-200 group-hover:text-cyan-200">
                        {finding.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        {SEVERITY_LABELS[finding.severity]} · created{" "}
                        {formatRelativeTime(finding.createdAt)}
                        {finding.dueDate ? ` · due ${formatDate(finding.dueDate)}` : ""}
                      </p>
                    </div>
                    <ChevronRight
                      className="mt-1 size-3.5 shrink-0 text-slate-600 group-hover:text-cyan-300"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface xl:col-span-4" aria-labelledby="asset-details-heading">
          <div className="border-b border-white/8 px-5 py-4">
            <p className="text-[10px] tracking-wide text-slate-500 uppercase">Context</p>
            <h2 id="asset-details-heading" className="text-sm font-semibold text-slate-100">
              Inventory details
            </h2>
          </div>
          <dl className="space-y-3 px-5 py-4 text-xs">
            {[
              ["Hostname", asset.hostname],
              ["IP address", asset.ipAddress ?? "—"],
              ["Type", ASSET_TYPE_LABELS[asset.type]],
              ["Operating system", asset.os],
              ["Owner", asset.owner],
              ["Criticality", `${asset.criticality} / 5`],
              ["Created", formatDate(asset.createdAt)],
              ["Last updated", formatDate(asset.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-slate-500">{label}</dt>
                <dd className="text-right text-slate-300">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-white/8 px-5 py-3">
            <p className="text-[10px] leading-4 text-slate-600">
              Risk is recalculated from unresolved findings and this asset&apos;s exposure and
              criticality. It is not a compliance certification.
            </p>
            {user.role === "admin" && findings.length > 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-200/80">
                <Clock className="size-3" aria-hidden="true" />
                Resolve or delete findings before deleting this asset.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="surface" aria-labelledby="asset-events-heading">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[10px] tracking-wide text-slate-500 uppercase">Telemetry</p>
            <h2 id="asset-events-heading" className="text-sm font-semibold text-slate-100">
              Related events
            </h2>
          </div>
          <Link href="/events" className={buttonClasses("ghost", "sm")}>
            Event log
            <ChevronRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-500">
            No events associated with this asset. Generate sample telemetry from the Events page or
            connect a real source in a later milestone.
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.055]">
            {events.map((event) => (
              <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SEVERITY_CHART_COLORS[event.severity] }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] leading-5 text-slate-300">{event.message}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                    {event.source} · {event.eventType} · {formatDateTime(event.occurredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
