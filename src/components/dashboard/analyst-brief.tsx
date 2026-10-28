import Link from "next/link";
import { ArrowUpRight, Bot } from "lucide-react";

export function AnalystBrief({ brief }: { brief: string }) {
  return (
    <section className="surface flex h-full flex-col p-5" aria-labelledby="analyst-brief-heading">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <Bot className="size-3.5 text-cyan-300" aria-hidden="true" />
          </span>
          <div>
            <h2 id="analyst-brief-heading" className="text-sm font-semibold text-slate-100">
              Analyst briefing
            </h2>
            <p className="font-mono text-[9px] tracking-wide text-slate-600 uppercase">
              Local engine
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-lg border border-white/8 bg-slate-950/35 px-3.5 py-3">
        <pre className="max-h-64 overflow-y-auto font-sans text-[11.5px] leading-5.5 whitespace-pre-wrap text-slate-400">
          {brief}
        </pre>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[9px] leading-4 text-slate-600">
          Deterministic analysis. Optional external AI in Copilot.
        </p>
        <Link
          href="/copilot"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          Ask a question
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
