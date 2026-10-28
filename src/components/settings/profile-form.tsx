"use client";

import { useActionState } from "react";
import { CheckCircle2, Mail, UserRound } from "lucide-react";
import { updateProfileAction } from "@/actions/profile";
import { Field, Input, FormError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { firstFieldError } from "@/lib/validation/utils";
import type { User } from "@/types";

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Display name"
          htmlFor="profile-name"
          required
          error={firstFieldError(state?.fieldErrors, "name")}
        >
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="profile-name"
              name="name"
              defaultValue={user.name}
              autoComplete="name"
              required
              maxLength={80}
              className="pl-9"
            />
          </div>
        </Field>
        <Field
          label="Email address"
          htmlFor="profile-email"
          hint="Email changes are not available in this demo."
        >
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              id="profile-email"
              value={user.email}
              readOnly
              disabled
              className="pl-9 font-mono text-xs"
            />
          </div>
        </Field>
      </div>

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

      <div className="flex justify-end">
        <SubmitButton label="Save profile" pendingLabel="Saving..." />
      </div>
    </form>
  );
}
