"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import { changePasswordAction } from "@/actions/profile";
import { Field, Input, FormError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { firstFieldError } from "@/lib/validation/utils";

const REQUIREMENTS = [
  "At least 12 characters",
  "One lowercase and one uppercase letter",
  "One number and one symbol",
  "Different from your current password",
];

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Current password"
        htmlFor="current-password"
        required
        error={firstFieldError(state?.fieldErrors, "currentPassword")}
      >
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            className="pl-9"
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="New password"
          htmlFor="new-password"
          required
          error={firstFieldError(state?.fieldErrors, "newPassword")}
        >
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              maxLength={128}
              className="pl-9"
            />
          </div>
        </Field>
        <Field
          label="Confirm new password"
          htmlFor="confirm-password"
          required
          error={firstFieldError(state?.fieldErrors, "confirmPassword")}
        >
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              maxLength={128}
              className="pl-9"
            />
          </div>
        </Field>
      </div>

      <ul className="grid gap-1.5 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3 sm:grid-cols-2">
        {REQUIREMENTS.map((requirement) => (
          <li
            key={requirement}
            className="flex items-start gap-2 text-[10px] leading-4 text-slate-500"
          >
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-600" aria-hidden="true" />
            {requirement}
          </li>
        ))}
      </ul>

      <FormError message={state && !state.ok ? state.message : undefined} />
      {state?.ok ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200"
        >
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] leading-4 text-slate-600">
          Changing your password signs out every other session.
        </p>
        <SubmitButton label="Update password" pendingLabel="Updating..." variant="secondary" />
      </div>
    </form>
  );
}
