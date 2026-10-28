import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEVERITY_CHART_COLORS, SEVERITY_LABELS } from "@/lib/constants";
import { SEVERITIES, type Severity } from "@/types";

interface SeverityDistributionProps {
  counts: Record<Severity, number>;
  total: number;
}

export function SeverityDistribution({ counts, total }: SeverityDistributionProps) {
  return (
    <section className="surface flex h-full flex-col p-5" aria-labelledby="severity-heading">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Active findings
          </p>
          <h2 id="severity-heading" className="mt-0.5 text-sm font-semibold text-slate-100">
            Severity distribution
          </h2>
        </div>
        <Link
          href="/findings"
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-cyan-200"
        >
          View all
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.04]"
        role="img"
        aria-label={SEVERITIES.map(
          (severity) => `${SEVERITY_LABELS[severity]}: ${counts[severity]}`,
        ).join(", ")}
      >
        {total > 0
          ? SEVERITIES.map((severity) => {
              const width = (counts[severity] / total) * 100;
              if (width === 0) return null;
              return (
                <span
                  key={severity}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${width}%`, backgroundColor: SEVERITY_CHART_COLORS[severity] }}
                />
              );
            })
          : null}
      </div>

      <div className="mt-4 flex-1 space-y-2.5">
        {SEVERITIES.map((severity) => {
          const count = counts[severity];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <Link
              key={severity}
              href={`/findings?severity=${severity}`}
              className="group flex items-center gap-2.5 rounded-md px-1 py-0.5 transition hover:bg-white/[0.03]"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: SEVERITY_CHART_COLORS[severity] }}
                aria-hidden="true"
              />
              <span className="w-14 text-[11px] text-slate-400 group-hover:text-slate-200">
                {SEVERITY_LABELS[severity]}
              </span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: SEVERITY_CHART_COLORS[severity],
                    opacity: 0.7,
                  }}
                />
              </span>
              <span className="w-8 text-right font-mono text-[11px] text-slate-300 tabular-nums">
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-3 border-t border-white/8 pt-3 font-mono text-[10px] text-slate-600">
        {total} active {total === 1 ? "finding" : "findings"} · unresolved
      </p>
    </section>
  );
}
