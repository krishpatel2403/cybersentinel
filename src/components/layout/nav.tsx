"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Boxes,
  LayoutDashboard,
  Rss,
  ScrollText,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  copilot: Bot,
  assets: Boxes,
  findings: ShieldAlert,
  events: Activity,
  intel: Rss,
  audit: ScrollText,
};

interface NavSectionsProps {
  isAdmin: boolean;
  onNavigate?: () => void;
}

export function NavSections({ isAdmin, onNavigate }: NavSectionsProps) {
  const pathname = usePathname();

  function renderLink(item: { href: string; label: string; icon: string }) {
    const Icon = ICONS[item.icon] ?? LayoutDashboard;
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
            active
              ? "bg-cyan-400/[0.09] text-cyan-100"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
          )}
        >
          {active ? (
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r bg-cyan-300"
            />
          ) : null}
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              active ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300",
            )}
            aria-hidden="true"
          />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <nav aria-label="Main navigation" className="space-y-5">
      <div>
        <p className="mb-2 px-3 font-mono text-[10px] font-medium tracking-[0.18em] text-slate-600 uppercase">
          Operations
        </p>
        <ul className="space-y-0.5">{NAV_ITEMS.map(renderLink)}</ul>
      </div>
      {isAdmin ? (
        <div>
          <p className="mb-2 px-3 font-mono text-[10px] font-medium tracking-[0.18em] text-slate-600 uppercase">
            Administration
          </p>
          <ul className="space-y-0.5">{ADMIN_NAV_ITEMS.map(renderLink)}</ul>
        </div>
      ) : null}
    </nav>
  );
}
