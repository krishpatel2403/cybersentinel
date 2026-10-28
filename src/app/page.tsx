import Link from "next/link";
import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  Code2,
  KeyRound,
  LayoutDashboard,
  Lock,
  Rss,
  Shield,
  ShieldAlert,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/security/session";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI cybersecurity dashboard",
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — AI cybersecurity dashboard`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Risk-based posture",
    description:
      "A transparent score weights severity, CVSS, internet exposure, and asset criticality. Drill from the score into the exact findings driving it.",
  },
  {
    icon: ShieldAlert,
    title: "Findings workflow",
    description:
      "Create, edit, triage, and resolve findings with ownership, due dates, inline status changes, and CSV export that blocks formula injection.",
  },
  {
    icon: Bot,
    title: "Grounded copilot",
    description:
      "Ask posture questions and get cited answers from a deterministic local analyst. Optionally plug in an OpenAI-compatible model with automatic fallback.",
  },
  {
    icon: Rss,
    title: "Live threat intel",
    description:
      "Cross-reference the CISA KEV catalog with CVEs already in your register, with an always-labeled bundled fallback when the feed is unavailable.",
  },
  {
    icon: Activity,
    title: "Telemetry context",
    description:
      "A simulated event stream from EDR, firewall, identity, and WAF sources gives findings operational context without pretending to be a SIEM.",
  },
  {
    icon: Shield,
    title: "Security by default",
    description:
      "Scrypt password hashing, HMAC-hashed session tokens, httpOnly cookies, Zod validation, RBAC, audit logs, rate limits, and strict security headers.",
  },
];

const STACK = [
  "Next.js 16 App Router",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "libSQL / Turso",
  "Zod 4",
  "Vitest",
  "Playwright",
];

const WORKFLOW = [
  {
    step: "01",
    title: "Inventory what matters",
    text: "Register assets, mark internet exposure, and assign an owner and criticality.",
  },
  {
    step: "02",
    title: "Rank the risk",
    text: "Findings inherit exposure context and roll up into an explainable posture score.",
  },
  {
    step: "03",
    title: "Ask, fix, verify",
    text: "Use the copilot for a briefing and remediation order, then track fixes to resolution.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-backdrop" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_50%_60%_at_50%_-10%,rgba(34,211,238,0.16),transparent_70%)]"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-2">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-100 sm:inline-flex"
          >
            Features
          </a>
          <a
            href="#security"
            className="hidden rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-100 sm:inline-flex"
          >
            Security
          </a>
          <Link href={user ? "/dashboard" : "/login"} className={buttonClasses("primary", "sm")}>
            {user ? "Open dashboard" : "Sign in"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main id="main">
        <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 pt-14 pb-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1">
              <Sparkles className="size-3 text-cyan-300" aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-[0.16em] text-cyan-200 uppercase">
                Portfolio demo · AI-assisted
              </span>
            </div>
            <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Turn scattered security work into a{" "}
              <span className="brand-gradient-text">clear posture story.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              {APP_NAME} is an end-to-end cybersecurity dashboard: asset inventory, a weighted risk
              register, simulated telemetry, live CISA advisories, and an AI analyst that answers
              only from the data it can see.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={user ? "/dashboard" : "/login"}
                className={buttonClasses("primary", "md")}
              >
                {user ? "Go to dashboard" : "Explore the demo"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a href="#features" className={buttonClasses("secondary", "md")}>
                See what is inside
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
              {[
                "Local-first, no paid services required",
                "Seeded demo data, clearly labeled",
                "Unit, integration, and E2E tests",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-400/80" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] bg-cyan-400/[0.04] blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070d17]/90 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-400/70" aria-hidden="true" />
                  <span className="size-2 rounded-full bg-amber-300/70" aria-hidden="true" />
                  <span className="size-2 rounded-full bg-emerald-400/70" aria-hidden="true" />
                </div>
                <span className="font-mono text-[9px] tracking-widest text-slate-600">
                  SENTINEL / OVERVIEW
                </span>
                <Lock className="size-3 text-slate-600" aria-hidden="true" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                      Security score
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">70</span>
                      <span className="text-sm text-slate-500">/ 100</span>
                      <span className="rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-300">
                        -21 pts this week
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Grade C · Fair · 15 active findings
                    </p>
                  </div>
                  <div className="relative flex size-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="size-20 -rotate-90" aria-hidden="true">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgba(148,163,184,0.12)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="190 264"
                      />
                    </svg>
                    <Shield className="absolute size-6 text-amber-200" aria-hidden="true" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Open", value: "15", tone: "text-rose-300" },
                    { label: "Critical", value: "2", tone: "text-orange-300" },
                    { label: "Exposed", value: "6", tone: "text-cyan-300" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-white/8 bg-white/[0.025] px-2.5 py-2"
                    >
                      <p className={`font-mono text-base font-semibold ${stat.tone}`}>
                        {stat.value}
                      </p>
                      <p className="text-[9px] text-slate-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                      Severity mix
                    </p>
                    <p className="font-mono text-[9px] text-slate-600">ACTIVE</p>
                  </div>
                  <div className="mt-2 flex h-2 overflow-hidden rounded-full">
                    <span className="w-[13%] bg-rose-400" />
                    <span className="w-[40%] bg-orange-400" />
                    <span className="w-[27%] bg-amber-300" />
                    <span className="flex-1 bg-sky-400" />
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-slate-600">
                    <span>2 critical</span>
                    <span>6 high</span>
                    <span>4 medium</span>
                    <span>3 low</span>
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="size-3.5 text-cyan-300" aria-hidden="true" />
                    <p className="text-[10px] font-medium text-cyan-100">Analyst briefing</p>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                    Posture is 70/100 (C). Two critical findings affect internet-facing assets.
                    Start with the Marketing CMS, then the Production API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-12 md:px-8"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-300 uppercase">
              What is inside
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              A complete workflow, not a mockup.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Every view is backed by a real database, typed server actions, validation, and tests.
              Sample data makes the workflow demonstrable without a real environment.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="surface p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06]">
                    <Icon className="size-4 text-cyan-300" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3.5 text-sm font-semibold text-slate-100">{feature.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-300 uppercase">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                From inventory to verified fix.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The scoring model is intentionally simple and documented. You can explain every
                number on the dashboard to a teammate or an interviewer.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {STACK.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-slate-500"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <ol className="space-y-3">
              {WORKFLOW.map((item) => (
                <li key={item.step} className="surface flex items-start gap-4 p-4">
                  <span className="font-mono text-lg font-semibold text-cyan-300/70">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="security"
          className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-12 md:px-8"
        >
          <div className="surface overflow-hidden p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-emerald-300" aria-hidden="true" />
                  <p className="font-mono text-[10px] tracking-[0.2em] text-emerald-200 uppercase">
                    Security engineering
                  </p>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Built like it handles real data.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This is a demo, but the security choices are deliberate and documented in a threat
                  model. The goal is to show judgment, not to claim production readiness.
                </p>
                <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3.5 py-2.5">
                  <p className="text-[10px] leading-4 text-amber-200/90">
                    Do not deploy with demo credentials or the in-memory rate limiter. The
                    deployment guide lists the required changes.
                  </p>
                </div>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  { icon: Lock, text: "Scrypt password hashing and HMAC-hashed session tokens" },
                  {
                    icon: Shield,
                    text: "Role-based access, Zod validation, and structured action errors",
                  },
                  { icon: Database, text: "Parameterized libSQL queries and safe audit logging" },
                  { icon: TestTube2, text: "Unit, integration, and Playwright E2E coverage in CI" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.text}
                      className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                    >
                      <Icon
                        className="mt-0.5 size-3.5 shrink-0 text-emerald-300"
                        aria-hidden="true"
                      />
                      <span className="text-[11px] leading-5 text-slate-300">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.07] to-indigo-400/[0.05] p-6 sm:flex-row sm:items-center md:p-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Open the demo dashboard.
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Seeded with 10 assets and 17 findings. Demo credentials are shown on the sign-in
                page.
              </p>
            </div>
            <Link href="/login" className={buttonClasses("primary", "md")}>
              Sign in
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-[10px] text-slate-600 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-2">
            <Logo compact />
            <span>{APP_NAME} · Educational portfolio project. Sample data only.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Code2 className="size-3" aria-hidden="true" />
              Source available with the project
            </span>
            <Link href="/login" className="transition hover:text-slate-300">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
