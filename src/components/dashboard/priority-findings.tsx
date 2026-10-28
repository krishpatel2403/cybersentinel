import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { SeverityBadge, StatusBadge } from "@/components/ui/badges";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { FindingWithAsset } from "@/types";

export function PriorityFindings({ findings }: { findings: FindingWithAsset[] }) {
  return (
    <section
      className="surface flex h-full flex-col overflow-hidden"
      aria-labelledby="priority-findings-heading"
    >
      <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Triage queue
          </p>
          <h2
            id="priority-findings-heading"
            className="mt-0.5 text-sm font-semibold text-slate-100"
          >
            Priority findings
          </h2>
        </div>
        <Link
          href="/findings"
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-cyan-200"
        >
          All findings
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {findings.length === 0 ? (
        <div className="mx-5 mb-5 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center">
          <ShieldAlert className="size-5 text-slate-600" aria-hidden="true" />
          <p className="mt-2 text-xs text-slate-400">No active findings</p>
          <p className="mt-1 text-[10px] text-slate-600">
            A clean queue. Keep monitoring new telemetry.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left sm:min-w-[600px]">
            <thead>
              <tr className="border-y border-white/8 bg-white/[0.015]">
                <th
                  scope="col"
                  className="px-5 py-2 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase"
                >
                  Finding
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-2 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase sm:table-cell"
                >
                  Asset
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.055]">
              {findings.map((finding) => (
                <tr key={finding.id} className="group transition hover:bg-white/[0.02]">
                  <td className="px-5 py-2.5 align-top">
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <Link
                      href={`/findings/${finding.id}`}
                      className="block max-w-[24rem] text-xs font-medium text-slate-200 transition group-hover:text-cyan-200"
                    >
                      {truncate(finding.title, 80)}
                    </Link>
                    <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                      {finding.cveId ?? "No CVE"} · {formatRelativeTime(finding.createdAt)}
                    </p>
                  </td>
                  <td className="hidden px-3 py-2.5 align-top sm:table-cell">
                    <Link
                      href={`/assets/${finding.assetId}`}
                      className="text-[11px] text-slate-400 hover:text-cyan-200"
                    >
                      {truncate(finding.assetName, 24)}
                    </Link>
                    <p className="font-mono text-[9px] text-slate-600">{finding.assetHostname}</p>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <StatusBadge status={finding.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-auto border-t border-white/8 px-5 py-2.5">
        <p className="text-[9px] leading-4 text-slate-600">
          Ordered by severity and recency. Risk weight also considers CVSS, internet exposure, and
          asset criticality.
        </p>
      </div>
    </section>
  );
}
