import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Download, Filter, Search, ShieldAlert, TimerOff } from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { listAssets } from "@/lib/repositories/assets";
import { listActiveFindings, listFindings } from "@/lib/repositories/findings";
import { firstString, daysSince } from "@/lib/utils";
import { parseSeverity, parseStatus } from "@/lib/validation/filters";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { FINDING_STATUSES, SEVERITIES } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Input, Select } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/ui/badges";
import { StatusSelect } from "@/components/findings/status-select";
import { FindingDialog } from "@/components/findings/finding-dialog";

export const metadata: Metadata = { title: "Findings" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FindingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const search = firstString(params.search).trim();
  const severity = parseSeverity(firstString(params.severity));
  const status = parseStatus(firstString(params.status));
  const assetId = firstString(params.assetId) || undefined;
  const autoOpen = firstString(params.new) === "1";

  const [assets, findings, activeFindings] = await Promise.all([
    listAssets(),
    listFindings({
      search: search || undefined,
      severity,
      status,
      assetId,
      limit: 200,
    }),
    listActiveFindings(500),
  ]);

  const filtered = Boolean(search || severity || status || assetId);
  const today = new Date().toISOString().slice(0, 10);
  const criticalCount = activeFindings.filter((finding) => finding.severity === "critical").length;
  const highCount = activeFindings.filter((finding) => finding.severity === "high").length;
  const overdue = activeFindings.filter(
    (finding) => finding.dueDate !== null && finding.dueDate < today,
  ).length;

  const exportQuery = new URLSearchParams();
  if (severity) exportQuery.set("severity", severity);
  if (status) exportQuery.set("status", status);
  if (search) exportQuery.set("search", search);
  if (assetId) exportQuery.set("assetId", assetId);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Risk register"
        title="Findings"
        description="Vulnerabilities, misconfigurations, and control gaps. Severity, CVSS, exposure, and asset criticality all feed the posture score."
      >
        <Link
          href={`/api/findings/export${exportQuery.size > 0 ? `?${exportQuery.toString()}` : ""}`}
          prefetch={false}
          className={buttonClasses("secondary", "md")}
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Link>
        <FindingDialog assets={assets} role={user.role} autoOpen={autoOpen} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Active findings", value: activeFindings.length, tone: "text-white" },
          { label: "Critical", value: criticalCount, tone: "text-rose-300" },
          { label: "High", value: highCount, tone: "text-orange-300" },
          { label: "Overdue", value: overdue, tone: "text-amber-200" },
        ].map((stat) => (
          <div key={stat.label} className="surface px-4 py-3">
            <p className={`font-mono text-lg leading-none font-semibold tabular-nums ${stat.tone}`}>
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <form
        method="get"
        className="surface grid gap-2.5 p-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
        role="search"
        aria-label="Filter findings"
      >
        <div className="relative">
          <label htmlFor="finding-search" className="sr-only">
            Search findings
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="finding-search"
            name="search"
            defaultValue={search}
            placeholder="Search title, description, CVE..."
            className="pl-9"
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="finding-severity-filter" className="sr-only">
            Filter by severity
          </label>
          <Select
            id="finding-severity-filter"
            name="severity"
            defaultValue={severity ?? ""}
            className="md:w-40"
          >
            <option value="">All severities</option>
            {SEVERITIES.map((option) => (
              <option key={option} value={option}>
                {SEVERITY_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="finding-status-filter" className="sr-only">
            Filter by status
          </label>
          <Select
            id="finding-status-filter"
            name="status"
            defaultValue={status ?? ""}
            className="md:w-40"
          >
            <option value="">All statuses</option>
            {FINDING_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="finding-asset-filter" className="sr-only">
            Filter by asset
          </label>
          <Select
            id="finding-asset-filter"
            name="assetId"
            defaultValue={assetId ?? ""}
            className="md:w-48"
          >
            <option value="">All assets</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            <Filter className="size-3.5" aria-hidden="true" />
            Apply
          </Button>
          {filtered ? (
            <Link href="/findings" className={buttonClasses("ghost", "md")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {findings.length === 0 ? (
        <EmptyState
          icon={filtered ? Search : ShieldAlert}
          title={filtered ? "No findings match these filters" : "No findings recorded"}
          description={
            filtered
              ? "Try widening the severity, status, or asset filters. Filters are applied together."
              : "Record a finding to start building the risk register. The local analyst can generate a remediation plan from each finding."
          }
          action={
            filtered ? (
              <Link href="/findings" className={buttonClasses("secondary", "sm")}>
                Clear filters
              </Link>
            ) : (
              <FindingDialog assets={assets} role={user.role} />
            )
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hidden w-full text-left lg:table xl:min-w-[920px]">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.015]">
                  {[
                    { label: "Severity", className: "px-3 sm:px-4" },
                    { label: "Finding", className: "px-3 sm:px-4" },
                    { label: "Asset", className: "hidden px-4 md:table-cell" },
                    { label: "Status", className: "px-3 sm:px-4" },
                    { label: "Due", className: "hidden px-4 xl:table-cell" },
                    { label: "Age", className: "hidden px-4 xl:table-cell" },
                    { label: "", className: "px-2 text-right sm:px-4" },
                  ].map((column, index) => (
                    <th
                      key={column.label || `actions-${index}`}
                      scope="col"
                      className={`py-2.5 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase ${column.className}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {findings.map((finding) => {
                  const isOverdue =
                    finding.dueDate !== null &&
                    finding.dueDate < today &&
                    finding.status !== "resolved";
                  const ageDays = daysSince(finding.createdAt);
                  return (
                    <tr key={finding.id} className="group transition hover:bg-white/[0.02]">
                      <td className="px-3 py-3 align-top sm:px-4">
                        <SeverityBadge severity={finding.severity} />
                      </td>
                      <td className="px-3 py-3 align-top sm:px-4">
                        <Link
                          href={`/findings/${finding.id}`}
                          className="block max-w-[26rem] text-xs font-medium text-slate-200 transition group-hover:text-cyan-200"
                        >
                          {finding.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                          {finding.cveId ?? "No CVE"} · CVSS {finding.cvss?.toFixed(1) ?? "—"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 align-top md:table-cell">
                        <Link
                          href={`/assets/${finding.assetId}`}
                          className="text-[11px] text-slate-400 hover:text-cyan-200"
                        >
                          {finding.assetName}
                        </Link>
                        <p className="font-mono text-[9px] text-slate-600">
                          {finding.assetHostname}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top sm:px-4">
                        <StatusSelect
                          findingId={finding.id}
                          currentStatus={finding.status}
                          title={finding.title}
                          role={user.role}
                        />
                      </td>
                      <td className="hidden px-4 py-3 align-top xl:table-cell">
                        {finding.dueDate ? (
                          <span
                            className={`font-mono text-[10px] ${isOverdue ? "text-rose-300" : "text-slate-500"}`}
                          >
                            {finding.dueDate}
                            {isOverdue ? " · overdue" : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 align-top xl:table-cell">
                        <span className="font-mono text-[10px] text-slate-500">{ageDays}d</span>
                      </td>
                      <td className="px-2 py-3 text-right align-top sm:px-4">
                        <Link
                          href={`/findings/${finding.id}`}
                          className="inline-flex items-center gap-1 rounded p-1 text-slate-500 transition group-hover:text-cyan-300"
                          aria-label={`View ${finding.title}`}
                        >
                          <ChevronRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/[0.055] lg:hidden">
            {findings.map((finding) => {
              const isOverdue =
                finding.dueDate !== null &&
                finding.dueDate < today &&
                finding.status !== "resolved";
              const ageDays = daysSince(finding.createdAt);
              return (
                <article key={finding.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={finding.severity} />
                        {isOverdue ? (
                          <span className="font-mono text-[9px] tracking-wider text-rose-300 uppercase">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`/findings/${finding.id}`}
                        className="mt-2 block text-sm leading-5 font-medium text-slate-200 transition hover:text-cyan-200"
                      >
                        {finding.title}
                      </Link>
                      <p className="mt-1 font-mono text-[9px] text-slate-600">
                        {finding.cveId ?? "No CVE"} · CVSS {finding.cvss?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                    <Link
                      href={`/findings/${finding.id}`}
                      className="inline-flex shrink-0 items-center rounded p-1 text-slate-500 transition hover:text-cyan-300"
                      aria-label={`View ${finding.title}`}
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px] text-slate-500">
                    <StatusBadge status={finding.status} />
                    <Link
                      href={`/assets/${finding.assetId}`}
                      className="transition hover:text-cyan-200"
                    >
                      {finding.assetName}
                    </Link>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600">{ageDays}d old</span>
                    {finding.dueDate ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className={isOverdue ? "text-rose-300" : "text-slate-600"}>
                          Due {finding.dueDate}
                        </span>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-4 py-2.5">
            <p className="font-mono text-[9px] text-slate-600">
              Showing {findings.length} {findings.length === 1 ? "finding" : "findings"}
              {filtered ? " matching filters" : ""} · limit 200
            </p>
            <p className="text-[9px] text-slate-600">
              Status changes are audited. Risk acceptance is admin-only.
            </p>
          </div>
        </div>
      )}

      {overdue > 0 ? (
        <p className="flex items-center gap-1.5 px-1 text-[10px] text-amber-200/80">
          <TimerOff className="size-3" aria-hidden="true" />
          {overdue} active {overdue === 1 ? "finding is" : "findings are"} past their due date.
        </p>
      ) : null}
    </div>
  );
}
