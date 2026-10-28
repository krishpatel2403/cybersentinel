"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateFindingStatusAction } from "@/actions/findings";
import { useToast } from "@/components/ui/toast";
import { STATUS_LABELS } from "@/lib/constants";
import { FINDING_STATUSES, type FindingStatus, type Role } from "@/types";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  findingId: string;
  currentStatus: FindingStatus;
  title: string;
  role: Role;
}

export function StatusSelect({ findingId, currentStatus, title, role }: StatusSelectProps) {
  const [status, setStatus] = useState<FindingStatus>(currentStatus);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function handleChange(next: FindingStatus) {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      try {
        const result = await updateFindingStatusAction(findingId, next);
        if (result.ok) {
          toast(result.message ?? "Status updated.", "success");
          router.refresh();
        } else {
          setStatus(previous);
          toast(result.message ?? "Status could not be updated.", "error");
        }
      } catch {
        setStatus(previous);
        toast("Status could not be updated. Please try again.", "error");
      }
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <label className="sr-only" htmlFor={`status-${findingId}`}>
        Update status for {title}
      </label>
      <select
        id={`status-${findingId}`}
        value={status}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as FindingStatus)}
        className={cn(
          "h-7 cursor-pointer appearance-none rounded-md border border-white/10 bg-slate-950/60 py-0 pr-7 pl-2 font-mono text-[10px] tracking-wide text-slate-300 transition hover:border-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none disabled:opacity-60",
        )}
      >
        {FINDING_STATUSES.filter(
          (option) =>
            option !== "accepted_risk" || role === "admin" || currentStatus === "accepted_risk",
        ).map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {pending ? (
        <Loader2
          className="pointer-events-none absolute right-1.5 size-3 animate-spin text-cyan-300"
          aria-hidden="true"
        />
      ) : (
        <span
          className="pointer-events-none absolute right-2 text-[8px] text-slate-500"
          aria-hidden="true"
        >
          ▼
        </span>
      )}
    </div>
  );
}
