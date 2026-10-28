"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[cybersentinel:ui_error]", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4">
      <div className="surface w-full max-w-lg p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10">
          <AlertTriangle className="size-5 text-rose-300" aria-hidden="true" />
        </span>
        <p className="mt-5 font-mono text-[10px] tracking-[0.2em] text-rose-300 uppercase">
          Application error
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Something broke on this screen.
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The error was logged without sensitive request data. Try the action again, or return to
          the dashboard if the problem continues.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-[10px] text-slate-600">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className={buttonClasses("primary", "md")}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/dashboard" className={buttonClasses("secondary", "md")}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
