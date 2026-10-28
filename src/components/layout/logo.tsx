import Link from "next/link";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="CyberSentinel home"
    >
      <span className="brand-mark flex size-8 items-center justify-center rounded-lg">
        <Shield className="size-4 text-slate-950" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Cyber<span className="text-cyan-300">Sentinel</span>
        </span>
      ) : null}
    </Link>
  );
}
