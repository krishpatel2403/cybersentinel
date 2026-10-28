import type { Row } from "@libsql/client";
import type {
  Asset,
  AuditEntry,
  Criticality,
  Exposure,
  Finding,
  FindingWithAsset,
  SecurityEvent,
  Severity,
  User,
} from "@/types";

export function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

export function textOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

export function numeric(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value ?? 0);
}

export function numericOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseStringArray(value: unknown): string[] {
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function rowToUser(row: Row | Record<string, unknown>): User {
  return {
    id: text(row.id),
    email: text(row.email),
    name: text(row.name),
    role: text(row.role) === "admin" ? "admin" : "analyst",
    createdAt: text(row.created_at),
    lastLoginAt: textOrNull(row.last_login_at),
  };
}

export function rowToAsset(row: Row | Record<string, unknown>): Asset {
  return {
    id: text(row.id),
    name: text(row.name),
    hostname: text(row.hostname),
    ipAddress: textOrNull(row.ip_address),
    type: text(row.type) as Asset["type"],
    criticality: numeric(row.criticality) as Criticality,
    exposure: text(row.exposure) as Exposure,
    owner: text(row.owner),
    os: text(row.os),
    tags: parseStringArray(row.tags),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

export function rowToFinding(row: Row | Record<string, unknown>): Finding {
  return {
    id: text(row.id),
    assetId: text(row.asset_id),
    title: text(row.title),
    description: text(row.description),
    severity: text(row.severity) as Severity,
    cvss: numericOrNull(row.cvss),
    cveId: textOrNull(row.cve_id),
    status: text(row.status) as Finding["status"],
    source: text(row.source) as Finding["source"],
    remediation: text(row.remediation),
    dueDate: textOrNull(row.due_date),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
    resolvedAt: textOrNull(row.resolved_at),
    createdBy: textOrNull(row.created_by),
  };
}

export function rowToFindingWithAsset(row: Row | Record<string, unknown>): FindingWithAsset {
  return {
    ...rowToFinding(row),
    assetName: text(row.asset_name),
    assetHostname: text(row.asset_hostname),
    assetExposure: text(row.asset_exposure) as Exposure,
    assetCriticality: numeric(row.asset_criticality) as Criticality,
  };
}

export function rowToEvent(row: Row | Record<string, unknown>): SecurityEvent {
  return {
    id: text(row.id),
    source: text(row.source),
    eventType: text(row.event_type),
    severity: text(row.severity) as Severity,
    message: text(row.message),
    assetId: textOrNull(row.asset_id),
    assetName: textOrNull(row.asset_name),
    occurredAt: text(row.occurred_at),
    createdAt: text(row.created_at),
  };
}

export function rowToAuditEntry(row: Row | Record<string, unknown>): AuditEntry {
  return {
    id: text(row.id),
    userId: textOrNull(row.user_id),
    actorEmail: text(row.actor_email),
    action: text(row.action),
    entityType: text(row.entity_type),
    entityId: textOrNull(row.entity_id),
    details: textOrNull(row.details),
    createdAt: text(row.created_at),
  };
}
