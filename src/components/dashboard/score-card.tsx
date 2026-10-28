import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bot, Minus } from "lucide-react";
import { GRADE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostureScore } from "@/lib/risk";

const GRADE_STYLES = {
  A: {
    stroke: "#34d399",
    text: "text-emerald-300",
    ring: "border-emerald-400/25 bg-emerald-400/10",
  },
  B: { stroke: "#22d3ee", text: "text-cyan-300", ring: "border-cyan-400/25 bg-cyan-400/10" },
  C: { stroke: "#fbbf24", text: "text-amber-200", ring: "border-amber-400/25 bg-amber-400/10" },
  D: { stroke: "#fb923c", text: "text-orange-300", ring: "border-orange-400/25 bg-orange-400/10" },
  F: { stroke: "#fb7185", text: "text-rose-300", ring: "border-rose-400/25 bg-rose-400/10" },
} as const;

interface ScoreCardProps {
  score: PostureScore;
  delta: number;
  criticalHigh: number;
  criticalAssets: number;
}

export function ScoreCard({ score, delta, criticalHigh, criticalAssets }: ScoreCardProps) {
  const grade = GRADE_STYLES[score.grade];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score.securityScore / 100);
  const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  return (
    <section
      className="surface relative flex h-full flex-col overflow-hidden p-5"
      aria-labelledby="score-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 size-44 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: grade.stroke }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Security score
          </p>
          <h2 id="score-heading" className="mt-0.5 text-sm text-slate-400">
            Weighted posture across your inventory
          </h2>
        </div>
        <Link
          href="/copilot"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          <Bot className="size-3" aria-hidden="true" />
          Ask copilot
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative size-[136px] shrink-0">
          <svg
            viewBox="0 0 128 128"
            className="size-full -rotate-90"
            role="img"
            aria-label={`Security score ${score.securityScore} out of 100, grade ${score.grade}`}
          >
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="9"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={grade.stroke}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ filter: `drop-shadow(0 0 6px ${grade.stroke}55)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[2rem] leading-none font-semibold text-white tabular-nums">
              {score.securityScore}
            </span>
            <span className="mt-1 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              / 100
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase",
              grade.ring,
              grade.text,
            )}
          >
            Grade {score.grade} · {GRADE_LABELS[score.grade]}
          </span>
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-[11px] font-medium",
              delta > 0 ? "text-emerald-300" : delta < 0 ? "text-rose-300" : "text-slate-400",
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            {delta === 0 ? "No change" : `${Math.abs(delta)} pts`} vs 7 days ago
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            {criticalHigh} critical/high findings across {criticalAssets} high-risk{" "}
            {criticalAssets === 1 ? "asset" : "assets"}.
          </p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/8 pt-4">
        <div>
          <p className="font-mono text-lg font-semibold text-white tabular-nums">
            {score.exposureScore}
          </p>
          <p className="text-[10px] text-slate-500">Exposure index</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-white tabular-nums">
            {score.weightedRisk}
          </p>
          <p className="text-[10px] text-slate-500">Weighted risk units</p>
        </div>
      </div>
    </section>
  );
}
