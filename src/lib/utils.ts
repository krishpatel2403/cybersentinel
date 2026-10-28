import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${dateFormatter.format(date)} UTC`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return dateOnlyFormatter.format(date);
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return "just now";
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86_400) return relativeFormatter.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 2_592_000) return relativeFormatter.format(Math.round(diffSeconds / 86_400), "day");
  return relativeFormatter.format(Math.round(diffSeconds / 2_592_000), "month");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Whole days elapsed since an ISO timestamp, clamped at zero. */
export function daysSince(iso: string, now = Date.now()): number {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.max(0, Math.floor((now - timestamp) / 86_400_000));
}

export function formatCvss(cvss: number | null): string {
  if (cvss === null || Number.isNaN(cvss)) return "—";
  return cvss.toFixed(1);
}

export function toTitleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Parse a comma-separated tag string into normalized, deduplicated tags. */
export function parseTags(value: string): string[] {
  const tags = value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag) => tag.length <= 32);
  return [...new Set(tags)].slice(0, 8);
}

export function firstString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
