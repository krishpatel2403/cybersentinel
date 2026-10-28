import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { SEVERITY_CHART_COLORS, SEVERITY_LABELS } from "@/lib/constants";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { SecurityEvent } from "@/types";

export function RecentEvents({ events }: { events: SecurityEvent[] }) {
  return (
    <section className="surface flex h-full flex-col p-5" aria-labelledby="recent-events-heading">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Telemetry
          </p>
          <h2 id="recent-events-heading" className="mt-0.5 text-sm font-semibold text-slate-100">
            Recent events
          </h2>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-cyan-200"
        >
          Event log
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-8 text-center">
          <Activity className="size-5 text-slate-600" aria-hidden="true" />
          <p className="mt-2 text-xs text-slate-400">No events recorded</p>
          <p className="mt-1 text-[10px] text-slate-600">
            Generate sample telemetry from the Events page.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-3.5">
          {events.slice(0, 4).map((event) => (
            <li key={event.id} className="flex gap-2.5">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: SEVERITY_CHART_COLORS[event.severity] }}
                aria-label={`${SEVERITY_LABELS[event.severity]} severity`}
              />
              <div className="min-w-0">
                <p className="text-[11px] leading-5 text-slate-300">
                  {truncate(event.message, 110)}
                </p>
                <p className="mt-0.5 font-mono text-[9px] tracking-wide text-slate-600">
                  {event.source} · {formatRelativeTime(event.occurredAt)}
                  {event.assetName ? ` · ${event.assetName}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 border-t border-white/8 pt-3 text-[10px] leading-4 text-slate-600">
        Seeded and simulator events only. Not connected to a real sensor.
      </p>
    </section>
  );
}
