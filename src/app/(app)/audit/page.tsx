import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText, Search, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/security/session";
import { listAuditEntries } from "@/lib/repositories/audit";
import { firstString, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Audit log" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ACTION_TONES: Record<string, string> = {
  auth: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  asset: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  finding: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  events: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  copilot: "border-indigo-400/25 bg-indigo-400/10 text-indigo-200",
  profile: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
};

function actionTone(action: string): string {
  const prefix = action.split(".")[0] ?? "";
  return ACTION_TONES[prefix] ?? "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const search = firstString(params.search).trim().toLowerCase();

  const entries = await listAuditEntries(500);
  const filtered = search
    ? entries.filter((entry) =>
        [entry.actorEmail, entry.action, entry.entityType, entry.details ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
    : entries;

  const uniqueActors = new Set(entries.map((entry) => entry.actorEmail)).size;
  const uniqueActions = new Set(entries.map((entry) => entry.action)).size;
  const latest = entries[0];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Administration"
        title="Audit log"
        description="Immutable-style records of authentication, data changes, simulations, and copilot usage. Only administrators can view this page."
      >
        <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
          <ShieldCheck className="size-3" aria-hidden="true" />
          Admin only
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Audit entries", value: entries.length, detail: "Most recent 500" },
          { label: "Unique actors", value: uniqueActors, detail: "Across shown entries" },
          { label: "Action types", value: uniqueActions, detail: "Distinct actions recorded" },
          {
            label: "Latest activity",
            value: latest ? formatRelativeTime(latest.createdAt) : "—",
            detail: latest ? latest.action : "No entries yet",
          },
        ].map((stat) => (
          <div key={stat.label} className="surface px-4 py-3">
            <p className="truncate font-mono text-lg leading-none font-semibold text-slate-100 tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[10px] font-medium text-slate-400">{stat.label}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-600">{stat.detail}</p>
          </div>
        ))}
      </div>

      <form
        method="get"
        className="surface grid gap-2.5 p-3 sm:grid-cols-[1fr_auto]"
        role="search"
        aria-label="Filter audit log"
      >
        <div className="relative">
          <label htmlFor="audit-search" className="sr-only">
            Search audit log
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="audit-search"
            name="search"
            defaultValue={search}
            placeholder="Search actor, action, entity, or details..."
            className="pl-9"
            maxLength={100}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            <Search className="size-3.5" aria-hidden="true" />
            Search
          </Button>
          {search ? (
            <Link href="/audit" className={buttonClasses("ghost", "md")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={search ? "No audit entries match this search" : "No audit activity recorded"}
          description={
            search
              ? "Try a shorter search term, an email address, or an action prefix such as auth or finding."
              : "Sign in, update a finding, or run a simulation to create audit entries. Writes are recorded automatically."
          }
          action={
            search ? (
              <Link href="/audit" className={buttonClasses("secondary", "sm")}>
                Clear search
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.015]">
                  {["When", "Actor", "Action", "Entity", "Details"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-2.5 font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <p
                        className="font-mono text-[10px] text-slate-400"
                        title={formatDateTime(entry.createdAt)}
                      >
                        {formatRelativeTime(entry.createdAt)}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                        {entry.createdAt.slice(0, 16).replace("T", " ")}Z
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <Users className="size-3 text-slate-600" aria-hidden="true" />
                        {entry.actorEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge className={actionTone(entry.action)}>{entry.action}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-mono text-[10px] text-slate-400">{entry.entityType}</p>
                      {entry.entityId ? (
                        <p className="mt-0.5 max-w-[10rem] truncate font-mono text-[9px] text-slate-600">
                          {entry.entityId}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {entry.details ? (
                        <code className="block max-w-[24rem] truncate rounded bg-black/20 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                          {entry.details}
                        </code>
                      ) : (
                        <span className="text-[10px] text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-4 py-2.5">
            <p className="font-mono text-[9px] text-slate-600">
              Showing {filtered.length} of {entries.length} entries · newest first
            </p>
            <p className="text-[9px] text-slate-600">
              Question text is never stored; copilot logs only mode and question length.
            </p>
          </div>
        </div>
      )}

      <p className="px-1 pb-2 text-[10px] leading-5 text-slate-600">
        Audit records are stored in the application database. In production, ship them to
        append-only storage with retention and access controls so an application compromise cannot
        erase history.
      </p>
    </div>
  );
}
