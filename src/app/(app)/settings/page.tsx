import type { Metadata } from "next";
import {
  Bot,
  CalendarClock,
  Database,
  HardDrive,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { countUserSessions } from "@/lib/repositories/sessions";
import { getDatabaseMode, isAiConfigured, isDemoMode } from "@/lib/env";
import { APP_NAME, APP_VERSION, ROLE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badges";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";

export const metadata: Metadata = { title: "Settings" };

function InfoRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03]">
        <Icon className="size-3.5 text-slate-400" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
        <p className="mt-0.5 truncate text-xs text-slate-200">{value}</p>
        {detail ? <p className="mt-0.5 text-[10px] leading-4 text-slate-600">{detail}</p> : null}
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const sessionCount = await countUserSessions(user.id);
  const dbMode = getDatabaseMode();
  const aiConfigured = isAiConfigured();
  const demo = isDemoMode();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your display name, password, and active session. Security-sensitive changes are written to the audit log."
      >
        <Badge className="border-white/10 bg-white/[0.04] text-slate-300">
          {ROLE_LABELS[user.role]}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="surface p-5" aria-labelledby="profile-heading">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                <UserRound className="size-4 text-cyan-300" aria-hidden="true" />
              </span>
              <div>
                <h2 id="profile-heading" className="text-sm font-semibold text-slate-100">
                  Profile
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  The name shown in the top bar and audit log context.
                </p>
              </div>
            </div>
            <ProfileForm user={user} />
          </section>

          <section className="surface p-5" id="sessions" aria-labelledby="password-heading">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10">
                <KeyRound className="size-4 text-amber-300" aria-hidden="true" />
              </span>
              <div>
                <h2 id="password-heading" className="text-sm font-semibold text-slate-100">
                  Password & sessions
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Passwords are hashed with scrypt. Session tokens are stored only as HMAC hashes.
                </p>
              </div>
            </div>
            <PasswordForm />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface p-5" aria-labelledby="account-heading">
            <h2 id="account-heading" className="text-sm font-semibold text-slate-100">
              Account
            </h2>
            <div className="mt-1 divide-y divide-white/8">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow
                icon={ShieldCheck}
                label="Role"
                value={ROLE_LABELS[user.role]}
                detail={
                  user.role === "admin"
                    ? "Full access including audit log and destructive actions."
                    : "Operational access without admin-only actions."
                }
              />
              <InfoRow
                icon={CalendarClock}
                label="Last sign-in"
                value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Not recorded"}
              />
              <InfoRow
                icon={KeyRound}
                label="Active sessions"
                value={`${sessionCount} ${sessionCount === 1 ? "session" : "sessions"}`}
                detail="Expired sessions are purged automatically at sign-in."
              />
            </div>
            <form action={logoutAction} className="mt-4 border-t border-white/8 pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 transition hover:border-rose-500/40 hover:bg-rose-500/15"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Sign out of this session
              </button>
            </form>
          </section>

          <section className="surface p-5" aria-labelledby="system-heading">
            <h2 id="system-heading" className="text-sm font-semibold text-slate-100">
              System
            </h2>
            <div className="mt-1 divide-y divide-white/8">
              <InfoRow icon={HardDrive} label="Application" value={`${APP_NAME} ${APP_VERSION}`} />
              <InfoRow
                icon={Database}
                label="Database"
                value={dbMode === "turso" ? "Turso (libSQL)" : "Local SQLite"}
                detail={
                  dbMode === "turso"
                    ? "Remote libSQL database configured."
                    : "File-backed local database for development."
                }
              />
              <InfoRow
                icon={Bot}
                label="Analyst engine"
                value={aiConfigured ? "External AI + local fallback" : "Built-in local analyst"}
                detail={
                  aiConfigured
                    ? "Configured via AI_BASE_URL and AI_MODEL."
                    : "Deterministic, no external API key required."
                }
              />
              <InfoRow
                icon={ShieldCheck}
                label="Demo mode"
                value={demo ? "Enabled" : "Disabled"}
                detail={
                  demo
                    ? "Demo credentials may be shown on the sign-in page."
                    : "Demo credential helpers are hidden."
                }
              />
            </div>
          </section>

          <p className="px-1 text-[10px] leading-4 text-slate-600">
            Never reuse a production password in this demonstration. To reset the sample database,
            stop the app and run <code className="font-mono">npm run db:reset</code>.
          </p>
        </aside>
      </div>
    </div>
  );
}
