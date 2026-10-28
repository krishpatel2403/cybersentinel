"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { ActionState } from "@/types/actions";

interface ConfirmActionButtonProps {
  action: () => Promise<ActionState>;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  successHref?: string;
  size?: "sm" | "md" | "icon";
  showLabel?: boolean;
}

export function ConfirmActionButton({
  action,
  triggerLabel,
  title,
  description,
  confirmLabel,
  successHref,
  size = "sm",
  showLabel = true,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) {
          toast(result.message ?? "Done.", "success");
          setOpen(false);
          if (successHref) {
            router.push(successHref);
          }
          router.refresh();
        } else {
          setError(result.message ?? "The action could not be completed.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={size}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={triggerLabel}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        {showLabel && size !== "icon" ? triggerLabel : null}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <div className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200"
            >
              {error}
            </div>
          ) : null}
          <p className="text-sm leading-6 text-slate-400">
            This action cannot be undone. Review the record before continuing.
          </p>
          <div className="flex justify-end gap-2 border-t border-white/8 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
              {pending ? "Working..." : confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
