"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, LogIn, Mail, ShieldCheck, UserCog, UserRound } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Field, Input, FormError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { firstFieldError } from "@/lib/validation/utils";

const DEMO_ADMIN = { email: "admin@cybersentinel.dev", password: "DemoAdmin!2026" };
const DEMO_ANALYST = { email: "analyst@cybersentinel.dev", password: "DemoAnalyst!2026" };

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [state, formAction] = useActionState(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function fillDemo(account: typeof DEMO_ADMIN) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <Field
          label="Email address"
          htmlFor="login-email"
          required
          error={firstFieldError(state?.fieldErrors, "email")}
        >
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              className="pl-9"
              aria-invalid={Boolean(firstFieldError(state?.fieldErrors, "email"))}
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="login-password"
          required
          error={firstFieldError(state?.fieldErrors, "password")}
        >
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={200}
              className="pr-11 pl-9"
              aria-invalid={Boolean(firstFieldError(state?.fieldErrors, "password"))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Eye className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>

        <FormError message={state && !state.ok ? state.message : undefined} />

        <SubmitButton label="Sign in" pendingLabel="Signing in..." className="w-full" />
      </form>

      {demoMode ? (
        <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-cyan-300" aria-hidden="true" />
            <p className="text-[11px] font-medium text-cyan-100">Demo accounts</p>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Public sample credentials. Never use them for a real deployment. Change or disable demo
            accounts before going live.
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fillDemo(DEMO_ADMIN)}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.06]"
            >
              <UserCog className="size-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-200">Administrator</span>
                <span className="block truncate font-mono text-[9px] text-slate-500">
                  {DEMO_ADMIN.email}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo(DEMO_ANALYST)}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.06]"
            >
              <UserRound className="size-3.5 shrink-0 text-indigo-300" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-200">Analyst</span>
                <span className="block truncate font-mono text-[9px] text-slate-500">
                  {DEMO_ANALYST.email}
                </span>
              </span>
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
            <LogIn className="size-2.5" aria-hidden="true" />
            Select a demo card to fill the form, then press Sign in.
          </p>
        </div>
      ) : null}

      <p className="text-center text-[10px] leading-4 text-slate-600">
        Sign-in attempts are rate limited and audited. Sessions expire after 12 hours.
      </p>
    </div>
  );
}
