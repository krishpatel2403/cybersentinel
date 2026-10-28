"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "subtle";
  size?: "sm" | "md";
  className?: string;
}

export function SubmitButton({
  label,
  pendingLabel = "Saving...",
  variant = "primary",
  size = "md",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClasses(variant, size, className)}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
