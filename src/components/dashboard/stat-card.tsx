import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "critical" | "warning" | "info";
}

const TONES = {
  default: "text-slate-300 bg-white/[0.04] border-white/8",
  critical: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  warning: "text-amber-200 bg-amber-400/10 border-amber-400/20",
  info: "text-cyan-200 bg-cyan-400/10 border-cyan-400/20",
};

export function StatCard({ label, value, sub, icon: Icon, href, tone = "default" }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
        <span
          className={cn("flex size-7 items-center justify-center rounded-lg border", TONES[tone])}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-[11px] leading-4 text-slate-500">{sub}</p>
        {href ? (
          <ArrowUpRight
            className="size-3 shrink-0 text-slate-600 transition group-hover:text-cyan-300"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="surface group block p-4 transition hover:border-white/20">
        {content}
      </Link>
    );
  }

  return <div className="surface p-4">{content}</div>;
}
