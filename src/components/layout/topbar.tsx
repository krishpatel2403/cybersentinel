"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import type { User } from "@/types";

const TITLES: Record<string, string> = {
  "/dashboard": "Security overview",
  "/copilot": "Security copilot",
  "/assets": "Asset inventory",
  "/findings": "Findings",
  "/events": "Security events",
  "/intel": "Threat intelligence",
  "/audit": "Audit log",
  "/settings": "Account settings",
};

export function Topbar({ user, demoMode }: { user: User; demoMode: boolean }) {
  const pathname = usePathname();
  let title = TITLES[pathname];
  if (!title) {
    if (pathname.startsWith("/assets/")) title = "Asset detail";
    else if (pathname.startsWith("/findings/")) title = "Finding detail";
    else
      title =
        [...NAV_ITEMS, ...ADMIN_NAV_ITEMS].find((item) => pathname.startsWith(item.href))?.label ??
        "CyberSentinel";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#05080f]/75 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 md:px-7">
        <MobileNav isAdmin={user.role === "admin"} />
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.16em] text-slate-600 uppercase">
            Workspace
          </p>
          <p className="truncate text-[13px] font-medium text-slate-200">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {demoMode ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-amber-200/90 sm:inline-flex">
              <span className="size-1 rounded-full bg-amber-300" aria-hidden="true" />
              Demo data
            </span>
          ) : null}
          <span className="hidden font-mono text-[10px] text-slate-600 lg:inline">
            {ROLE_LABELS[user.role]}
          </span>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
