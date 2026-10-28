"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

export function UserMenu({ user }: { user: User }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] py-1 pr-2 pl-1 transition hover:border-white/15 hover:bg-white/[0.06] [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/80 to-indigo-500/80 text-[10px] font-bold text-slate-950">
          {getInitials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-[11px] leading-3.5 font-medium text-slate-200">
            {user.name}
          </span>
          <span className="block text-[9px] leading-3 text-slate-500">
            {ROLE_LABELS[user.role]}
          </span>
        </span>
        <ChevronDown
          className="size-3.5 text-slate-500 transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#0a1321] shadow-2xl shadow-black/60">
        <div className="border-b border-white/8 px-4 py-3">
          <p className="truncate text-xs font-medium text-slate-200">{user.name}</p>
          <p className="truncate text-[11px] text-slate-500">{user.email}</p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="size-3.5" aria-hidden="true" />
            Account settings
          </Link>
          <Link
            href="/settings#sessions"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <UserRound className="size-3.5" aria-hidden="true" />
            Session & security
          </Link>
        </div>
        <form action={logoutAction} className="border-t border-white/8 p-1.5">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
