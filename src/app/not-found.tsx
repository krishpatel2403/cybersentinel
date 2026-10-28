import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
    >
      <div className="grid-backdrop" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 font-mono text-[10px] tracking-[0.24em] text-cyan-300 uppercase">
          404 · Route not found
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          This page is outside the perimeter.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The URL may be mistyped, or the page may have moved. Return to the dashboard or the public
          overview.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard" className={buttonClasses("primary", "md")}>
            Go to dashboard
          </Link>
          <Link href="/" className={buttonClasses("secondary", "md")}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Public overview
          </Link>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-slate-600">
          <Terminal className="size-3" aria-hidden="true" />
          Check the address and try again
        </div>
      </div>
    </main>
  );
}
