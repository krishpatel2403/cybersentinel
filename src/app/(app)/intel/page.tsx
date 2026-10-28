import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ExternalLink,
  Fingerprint,
  FlaskConical,
  Rss,
  Search,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { getThreatAdvisories } from "@/lib/threat-intel";
import { listActiveFindings } from "@/lib/repositories/findings";
import { firstString, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badges";
import { Input } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Threat intel" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ThreatIntelPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;
  const search = firstString(params.search).trim().toLowerCase();
  const ransomwareOnly = firstString(params.ransomware) === "1";

  const [intel, activeFindings] = await Promise.all([
    getThreatAdvisories(),
    listActiveFindings(500),
  ]);

  const findingCves = new Set(
    activeFindings
      .map((finding) => finding.cveId?.toUpperCase())
      .filter((cve): cve is string => Boolean(cve)),
  );

  const advisories = intel.advisories.filter((advisory) => {
    if (ransomwareOnly && !advisory.ransomwareUse) return false;
    if (!search) return true;
    return [advisory.cveId, advisory.vendorProject, advisory.product, advisory.name]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const ransomwareCount = intel.advisories.filter((advisory) => advisory.ransomwareUse).length;
  const vendorCount = new Set(intel.advisories.map((advisory) => advisory.vendorProject)).size;
  const overlapCount = intel.advisories.filter((advisory) =>
    findingCves.has(advisory.cveId),
  ).length;
  const filtered = search.length > 0 || ransomwareOnly;
  const sourceIsLive = intel.source === "live";

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="External exposure"
        title="Threat intel"
        description="Known exploited vulnerabilities from the CISA KEV catalog, cross-referenced with CVEs already tracked in your findings."
      >
        <Badge
          className={
            sourceIsLive
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
              : "border-amber-400/25 bg-amber-400/10 text-amber-200"
          }
        >
          <span
            className={`size-1.5 rounded-full ${sourceIsLive ? "bg-emerald-300" : "bg-amber-300"}`}
            aria-hidden="true"
          />
          {sourceIsLive ? "Live CISA feed" : "Bundled sample"}
        </Badge>
        <a
          href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
          target="_blank"
          rel="noreferrer noopener"
          className={buttonClasses("secondary", "md")}
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          CISA catalog
        </a>
      </PageHeader>

      {!sourceIsLive && intel.note ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
          <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-amber-100">Fallback data in use</p>
            <p className="mt-0.5 text-[11px] leading-5 text-slate-400">{intel.note}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Advisories shown",
            value: intel.advisories.length,
            detail: "Most recently added",
            icon: Rss,
            tone: "text-cyan-200",
          },
          {
            label: "Ransomware-linked",
            value: ransomwareCount,
            detail: "Known campaign use",
            icon: AlertTriangle,
            tone: "text-rose-300",
          },
          {
            label: "Vendors affected",
            value: vendorCount,
            detail: "Across shown advisories",
            icon: Fingerprint,
            tone: "text-indigo-300",
          },
          {
            label: "Match your findings",
            value: overlapCount,
            detail: overlapCount > 0 ? "CVEs already tracked" : "No overlap found",
            icon: ShieldCheck,
            tone: overlapCount > 0 ? "text-amber-200" : "text-emerald-300",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface px-4 py-3">
              <div className="flex items-center justify-between">
                <p
                  className={`font-mono text-xl leading-none font-semibold tabular-nums ${stat.tone}`}
                >
                  {stat.value}
                </p>
                <Icon className="size-4 text-slate-600" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">{stat.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-600">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      <form
        method="get"
        className="surface grid gap-2.5 p-3 sm:grid-cols-[1fr_auto_auto]"
        role="search"
        aria-label="Filter threat advisories"
      >
        <div className="relative">
          <label htmlFor="intel-search" className="sr-only">
            Search advisories
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="intel-search"
            name="search"
            defaultValue={search}
            placeholder="Search CVE, vendor, or product..."
            className="pl-9"
            maxLength={100}
          />
        </div>
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-300">
          <input
            type="checkbox"
            name="ransomware"
            value="1"
            defaultChecked={ransomwareOnly}
            className="size-3.5 rounded border-white/20 bg-slate-950 accent-cyan-400"
          />
          Ransomware-linked only
        </label>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            <Search className="size-3.5" aria-hidden="true" />
            Filter
          </Button>
          {filtered ? (
            <Link href="/intel" className={buttonClasses("ghost", "md")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {advisories.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No advisories match these filters"
          description="Try a different CVE, vendor, or product. The catalog is limited to the 24 most recent advisories returned by the feed."
          action={
            <Link href="/intel" className={buttonClasses("secondary", "sm")}>
              Clear filters
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {advisories.map((advisory) => {
            const tracked = findingCves.has(advisory.cveId);
            return (
              <li key={advisory.cveId} className="surface flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-cyan-200">
                        {advisory.cveId}
                      </span>
                      {advisory.ransomwareUse ? (
                        <Badge className="border-rose-500/25 bg-rose-500/10 text-rose-200">
                          Ransomware
                        </Badge>
                      ) : null}
                      {tracked ? (
                        <Badge className="border-amber-400/25 bg-amber-400/10 text-amber-200">
                          In findings
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-1 text-sm font-medium text-slate-100">{advisory.name}</h2>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {advisory.vendorProject} · {advisory.product}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                    <CalendarClock className="size-3" aria-hidden="true" />
                    Added {advisory.dateAdded}
                  </div>
                </div>

                {advisory.shortDescription ? (
                  <p className="text-[11px] leading-5 text-slate-400">
                    {advisory.shortDescription}
                  </p>
                ) : null}

                {advisory.requiredAction ? (
                  <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                    <p className="font-mono text-[9px] tracking-wider text-slate-600 uppercase">
                      Required action
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-300">
                      {advisory.requiredAction}
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
                  <p className="font-mono text-[9px] text-slate-600">
                    {advisory.dueDate
                      ? `Remediation due ${advisory.dueDate}`
                      : "No due date published"}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/findings?search=${encodeURIComponent(advisory.cveId)}`}
                      className="text-[10px] text-slate-400 transition hover:text-cyan-200"
                    >
                      Search findings
                    </Link>
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${advisory.cveId}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-cyan-200"
                    >
                      NVD
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="px-1 pb-2 text-[10px] leading-5 text-slate-600">
        Source: CISA Known Exploited Vulnerabilities catalog.{" "}
        {sourceIsLive ? "Live feed" : "Bundled fallback"} retrieved{" "}
        {formatDateTime(intel.fetchedAt)}. CISA KEV lists vulnerabilities with confirmed
        exploitation in the wild; it is not a complete vulnerability list. CVE overlap is
        informational and does not confirm that an asset is affected.
      </p>
    </div>
  );
}
