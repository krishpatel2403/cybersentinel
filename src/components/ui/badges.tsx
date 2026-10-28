import { cn } from "@/lib/utils";
import {
  EXPOSURE_BADGE_CLASSES,
  EXPOSURE_LABELS,
  SEVERITY_BADGE_CLASSES,
  SEVERITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/constants";
import { SEVERITY_CHART_COLORS } from "@/lib/constants";
import type { Exposure, FindingStatus, Severity } from "@/types";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge className={SEVERITY_BADGE_CLASSES[severity]}>
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: SEVERITY_CHART_COLORS[severity] }}
      />
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: FindingStatus }) {
  return <Badge className={STATUS_BADGE_CLASSES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function ExposureBadge({ exposure }: { exposure: Exposure }) {
  return <Badge className={EXPOSURE_BADGE_CLASSES[exposure]}>{EXPOSURE_LABELS[exposure]}</Badge>;
}

export function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-slate-400">
      {children}
    </span>
  );
}
