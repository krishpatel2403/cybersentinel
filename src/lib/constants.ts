import type { AssetType, Exposure, FindingStatus, Role, Severity } from "@/types";

export const APP_NAME = "CyberSentinel";
export const APP_VERSION = "0.1.0";
export const APP_DESCRIPTION =
  "An AI-assisted cybersecurity posture dashboard for small security teams.";

export const SESSION_COOKIE_NAME = "cs_session";
export const SESSION_TTL_HOURS = 12;

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const SEVERITY_CHART_COLORS: Record<Severity, string> = {
  critical: "#fb7185",
  high: "#fb923c",
  medium: "#fbbf24",
  low: "#38bdf8",
  info: "#94a3b8",
};

export const SEVERITY_BADGE_CLASSES: Record<Severity, string> = {
  critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  low: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  info: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export const STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  accepted_risk: "Accepted risk",
  resolved: "Resolved",
};

export const STATUS_BADGE_CLASSES: Record<FindingStatus, string> = {
  open: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  in_progress: "border-sky-500/25 bg-sky-500/10 text-sky-200",
  accepted_risk: "border-violet-500/25 bg-violet-500/10 text-violet-200",
  resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  server: "Server",
  workstation: "Workstation",
  web_app: "Web application",
  database: "Database",
  network: "Network device",
  cloud: "Cloud resource",
  mobile: "Mobile device",
};

export const EXPOSURE_LABELS: Record<Exposure, string> = {
  internet: "Internet-facing",
  internal: "Internal",
  isolated: "Isolated",
};

export const EXPOSURE_BADGE_CLASSES: Record<Exposure, string> = {
  internet: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  internal: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  isolated: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  analyst: "Security analyst",
};

export const GRADE_LABELS = {
  A: "Strong",
  B: "Good",
  C: "Fair",
  D: "Weak",
  F: "Critical",
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/copilot", label: "Copilot", icon: "copilot" },
  { href: "/assets", label: "Assets", icon: "assets" },
  { href: "/findings", label: "Findings", icon: "findings" },
  { href: "/events", label: "Events", icon: "events" },
  { href: "/intel", label: "Threat intel", icon: "intel" },
] as const;

export const ADMIN_NAV_ITEMS = [{ href: "/audit", label: "Audit log", icon: "audit" }] as const;

export const COPILOT_SUGGESTIONS = [
  "Give me a security posture briefing.",
  "Which internet-facing assets are most at risk?",
  "What should we remediate first?",
  "Summarize activity from the last 24 hours.",
  "Do we have any critical findings?",
] as const;
