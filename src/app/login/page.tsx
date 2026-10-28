import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, Bot, Boxes, ShieldAlert, ShieldCheck, Terminal } from "lucide-react";
import { getCurrentUser } from "@/lib/security/session";
import { isDemoMode } from "@/lib/env";
import { APP_NAME } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  { icon: ShieldAlert, label: "Risk-based findings register" },
  { icon: Activity, label: "Simulated security telemetry" },
  { icon: Bot, label: "Grounded analyst copilot" },
  { icon: Boxes, label: "Asset and exposure inventory" },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main id="main" className="relative flex min-h-screen flex-col">
      <div className="grid-backdrop" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 md:px-8">
        <div className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070d18]/70 shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/8 p-10 lg:flex">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(34,211,238,0.16),transparent_65%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(99,102,241,0.12),transparent_60%)]"
            />
            <div className="relative">
              <Logo />
              <p className="mt-10 font-mono text-[10px] tracking-[0.24em] text-cyan-300 uppercase">
                Security operations workspace
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-white">
                See the posture.
                <br />
                <span className="brand-gradient-text">Fix what matters first.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                {APP_NAME} brings assets, findings, telemetry, threat intel, and an AI analyst into
                one focused dashboard built for small security teams.
              </p>

              <ul className="mt-8 space-y-3">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.07]">
                        <Icon className="size-3.5 text-cyan-300" aria-hidden="true" />
                      </span>
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative mt-10 rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2">
                <Terminal className="size-3.5 text-emerald-300" aria-hidden="true" />
                <p className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">
                  Local-first demo
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Runs on a local SQLite database with seeded data. No external account required. An
                optional OpenAI-compatible key adds a real LLM; otherwise a deterministic analyst
                answers instead.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Next.js 16", "libSQL", "Zod", "Tailwind 4"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="flex items-center gap-2 text-cyan-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
                  Restricted access
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Sign in</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Use a demo account or your assigned credentials. This dashboard contains simulated
                security data only.
              </p>
              <div className="mt-6">
                <LoginForm demoMode={isDemoMode()} />
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[10px] text-slate-600 md:px-8">
        <p>Educational portfolio project. Not a production security product.</p>
        <Link href="/" className="inline-flex items-center gap-1 transition hover:text-slate-300">
          <ArrowLeft className="size-3" aria-hidden="true" />
          Back to overview
        </Link>
      </footer>
    </main>
  );
}
