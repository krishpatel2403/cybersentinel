"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { generateRemediationAction } from "@/actions/findings";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badges";
import type { CopilotAnswer } from "@/types";
import type { Severity } from "@/types";

interface RemediationPanelProps {
  findingId: string;
  severity: Severity;
}

export function RemediationPanel({ findingId, severity }: RemediationPanelProps) {
  const [result, setResult] = useState<CopilotAnswer | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const response = await generateRemediationAction(findingId);
      setResult(response);
    });
  }

  return (
    <section className="surface p-5" aria-labelledby="remediation-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-cyan-300" aria-hidden="true" />
            <h2 id="remediation-heading" className="text-sm font-semibold text-slate-100">
              Analyst remediation plan
            </h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            A structured plan built from this finding and its asset. No external AI is required.
          </p>
        </div>
        <Button type="button" variant="subtle" size="sm" onClick={generate} disabled={pending}>
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-3.5" aria-hidden="true" />
          )}
          {pending ? "Analyzing..." : result ? "Regenerate plan" : "Generate plan"}
        </Button>
      </div>

      {!result && !pending ? (
        <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.015] px-4 py-5 text-xs leading-5 text-slate-500">
          Generate a five-phase plan: scope, contain, fix, verify, and prevent recurrence. The local
          engine uses severity, exposure, CVE, and asset ownership data.
        </div>
      ) : null}

      {pending ? (
        <div className="mt-4 space-y-2" aria-live="polite">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-1/2" />
          <span className="sr-only">Generating remediation plan</span>
        </div>
      ) : null}

      {result && !result.ok ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-xs leading-5 text-rose-200"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {result.message ?? "The plan could not be generated."}
        </div>
      ) : null}

      {result?.ok ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={severity} />
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-0.5 font-mono text-[10px] tracking-wide text-cyan-200 uppercase">
              {result.mode === "ai" ? "External AI" : "Local engine"}
            </span>
          </div>
          {result.notice ? (
            <p className="rounded-md border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-2 text-[11px] leading-5 text-cyan-100/70">
              {result.notice}
            </p>
          ) : null}
          <pre className="max-h-[28rem] overflow-y-auto rounded-lg border border-white/8 bg-slate-950/50 px-4 py-3 font-sans text-[12.5px] leading-6 whitespace-pre-wrap text-slate-300">
            {result.answer}
          </pre>
          {result.citations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.citations.map((citation) => {
                const external = citation.href.startsWith("http");
                return (
                  <a
                    key={citation.href}
                    href={citation.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-200"
                  >
                    {citation.label}
                    {external ? <ExternalLink className="size-2.5" aria-hidden="true" /> : null}
                  </a>
                );
              })}
            </div>
          ) : null}
          <p className="text-[10px] leading-4 text-slate-600">
            Educational guidance only. Follow your organization&apos;s change control and vendor
            instructions.
          </p>
        </div>
      ) : null}
    </section>
  );
}
