"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { simulateEventsAction } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function SimulateEventsButton() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await simulateEventsAction();
        toast(
          result.message ?? (result.ok ? "Sample events generated." : "Could not generate events."),
          result.ok ? "success" : "error",
        );
        if (result.ok) router.refresh();
      } catch {
        toast("Sample events could not be generated. Please try again.", "error");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-3.5" aria-hidden="true" />
      )}
      {pending ? "Generating..." : "Simulate telemetry"}
    </Button>
  );
}
