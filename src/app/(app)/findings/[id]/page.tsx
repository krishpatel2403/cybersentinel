import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { getFindingById, listFindings } from "@/lib/repositories/findings";
import { getAssetById, listAssets } from "@/lib/repositories/assets";
import { computeAssetRisk } from "@/lib/risk";
import { deleteFindingAction } from "@/actions/findings";
import { ASSET_TYPE_LABELS, EXPOSURE_LABELS } from "@/lib/constants";
import { formatCvss, formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, SeverityBadge, StatusBadge } from "@/components/ui/badges";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { FindingDialog } from "@/components/findings/finding-dialog";
import { StatusSelect } from "@/components/findings/status-select";
import { RemediationPanel } from "@/components/findings/remediation-panel";

export const metadata: Metadata = { title: "Finding detail" };

type Params = Promise<{ id: string }>;

export default async function FindingDetailPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;
  const finding = await getFindingById(id);
  if (!finding) notFound();

  const [asset, allAssets, assetFindings] = await Promise.all([
    getAssetById(finding.assetId),
    listAssets(),
    listFindings({ assetId: finding.assetId, limit: 500 }),
  ]);

  const activeAssetFindings = assetFindings.filter((item) => item.status !== "resolved");
  const assetRisk = asset ? computeAssetRisk(activeAssetFindings, asset) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue =
    finding.dueDate !== null && finding.dueDate < today && finding.status !== "resolved";

  return (
    <div className="space-y-4">
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 transition hover:text-cyan-200"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to findings
      </Link>

      <PageHeader
        eyebrow="Finding detail"
        title={finding.title}
        description={`${finding.assetName} (${finding.assetHostname}) · recorded ${formatRelativeTime(finding.createdAt)}`}
      >
        <FindingDialog assets={allAssets} finding={finding} role={user.role} />
        {user.role === "admin" ? (
          <ConfirmActionButton
            action={deleteFindingAction.bind(null, finding.id)}
            triggerLabel="Delete finding"
            title="Delete this finding?"
            description="The finding and its remediation notes will be permanently removed. The audit log keeps a record of the deletion."
            confirmLabel="Delete finding"
            successHref="/findings"
            size="md"
          />
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        <StatusBadge status={finding.status} />
        {finding.cveId ? (
          <a
            href={`https://nvd.nist.gov/vuln/detail/${encodeURIComponent(finding.cveId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
          >
            {finding.cveId}
            <ExternalLink className="size-2.5" aria-hidden="true" />
          </a>
        ) : null}
        <Badge className="border-white/10 bg-white/[0.03] text-slate-400">
          Source: {finding.source}
        </Badge>
        {isOverdue ? (
          <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-200">
            <CalendarClock className="size-3" aria-hidden="true" />
            Overdue
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <section className="surface p-5" aria-labelledby="finding-summary-heading">
            <h2 id="finding-summary-heading" className="text-sm font-semibold text-slate-100">
              Description
            </h2>
            <p className="mt-3 text-[13px] leading-6 whitespace-pre-wrap text-slate-300">
              {finding.description}
            </p>
            <div className="mt-4 grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-3">
              <div>
                <p className="text-[9px] tracking-wide text-slate-600 uppercase">CVSS</p>
                <p className="mt-0.5 font-mono text-sm text-slate-200">
                  {formatCvss(finding.cvss)}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-wide text-slate-600 uppercase">Created</p>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  {formatDateTime(finding.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-wide text-slate-600 uppercase">Last updated</p>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  {formatDateTime(finding.updatedAt)}
                </p>
              </div>
            </div>
          </section>

          {finding.remediation.trim() ? (
            <section className="surface p-5" aria-labelledby="owner-notes-heading">
              <h2 id="owner-notes-heading" className="text-sm font-semibold text-slate-100">
                Owner remediation notes
              </h2>
              <p className="mt-2 text-xs leading-6 whitespace-pre-wrap text-slate-400">
                {finding.remediation}
              </p>
            </section>
          ) : null}

          <RemediationPanel findingId={finding.id} severity={finding.severity} />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <section className="surface p-5" aria-labelledby="workflow-heading">
            <h2 id="workflow-heading" className="text-sm font-semibold text-slate-100">
              Workflow
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1.5 text-[10px] text-slate-500">Update status</p>
                <StatusSelect
                  findingId={finding.id}
                  currentStatus={finding.status}
                  title={finding.title}
                  role={user.role}
                />
              </div>
              <dl className="space-y-2.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Due date</dt>
                  <dd className={isOverdue ? "text-rose-300" : "text-slate-300"}>
                    {finding.dueDate ? formatDate(finding.dueDate) : "Not set"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Resolved at</dt>
                  <dd className="text-slate-300">
                    {finding.resolvedAt ? formatDateTime(finding.resolvedAt) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Exposure</dt>
                  <dd className="text-slate-300">
                    {asset ? EXPOSURE_LABELS[asset.exposure] : "—"}
                  </dd>
                </div>
              </dl>
              <p className="flex items-start gap-1.5 border-t border-white/8 pt-3 text-[10px] leading-4 text-slate-600">
                <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                Resolving a finding removes its risk weight immediately. Accepted risk reduces the
                weight but remains visible.
              </p>
            </div>
          </section>

          {asset ? (
            <section className="surface p-5" aria-labelledby="asset-context-heading">
              <div className="flex items-center justify-between gap-2">
                <h2 id="asset-context-heading" className="text-sm font-semibold text-slate-100">
                  Affected asset
                </h2>
                <Link
                  href={`/assets/${asset.id}`}
                  className="text-[10px] text-cyan-300 transition hover:text-cyan-200"
                >
                  View asset
                </Link>
              </div>
              <div className="mt-3 space-y-2 text-[11px]">
                <p className="text-xs font-medium text-slate-200">{asset.name}</p>
                <p className="font-mono text-[10px] text-slate-500">
                  {asset.hostname}
                  {asset.ipAddress ? ` · ${asset.ipAddress}` : ""}
                </p>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Type</dt>
                    <dd className="text-slate-300">{ASSET_TYPE_LABELS[asset.type]}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Criticality</dt>
                    <dd className="text-slate-300">{asset.criticality} / 5</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Open findings</dt>
                    <dd className="text-slate-300">{activeAssetFindings.length}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Asset risk</dt>
                    <dd className="font-mono text-slate-300">{assetRisk}/100</dd>
                  </div>
                </dl>
              </div>
            </section>
          ) : null}

          <section className="surface p-5" aria-labelledby="risk-context-heading">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-cyan-300" aria-hidden="true" />
              <h2 id="risk-context-heading" className="text-sm font-semibold text-slate-100">
                How this is prioritized
              </h2>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              The score weights severity by CVSS, status, asset exposure, and criticality.
              Internet-facing critical assets carry the highest weight. This heuristic helps
              prioritization; it is not a compliance rating.
            </p>
            <Link href="/copilot" className={buttonClasses("secondary", "sm", "mt-3 w-full")}>
              Ask for a remediation plan
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
