export const ROLES = ["admin", "analyst"] as const;
export type Role = (typeof ROLES)[number];

export const ASSET_TYPES = [
  "server",
  "workstation",
  "web_app",
  "database",
  "network",
  "cloud",
  "mobile",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const EXPOSURES = ["internet", "internal", "isolated"] as const;
export type Exposure = (typeof EXPOSURES)[number];

export const CRITICALITIES = [1, 2, 3, 4, 5] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export const SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const FINDING_STATUSES = ["open", "in_progress", "accepted_risk", "resolved"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const EVENT_SOURCES = [
  "EDR",
  "Firewall",
  "Identity",
  "WAF",
  "Scanner",
  "Simulator",
] as const;
export type EventSource = (typeof EVENT_SOURCES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Asset {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string | null;
  type: AssetType;
  criticality: Criticality;
  exposure: Exposure;
  owner: string;
  os: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetWithStats extends Asset {
  openFindings: number;
  criticalFindings: number;
  riskScore: number;
}

export interface Finding {
  id: string;
  assetId: string;
  title: string;
  description: string;
  severity: Severity;
  cvss: number | null;
  cveId: string | null;
  status: FindingStatus;
  source: "manual" | "scanner" | "seed";
  remediation: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  createdBy: string | null;
}

export interface FindingWithAsset extends Finding {
  assetName: string;
  assetHostname: string;
  assetExposure: Exposure;
  assetCriticality: Criticality;
}

export interface SecurityEvent {
  id: string;
  source: string;
  eventType: string;
  severity: Severity;
  message: string;
  assetId: string | null;
  assetName: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export interface ThreatAdvisory {
  cveId: string;
  vendorProject: string;
  product: string;
  name: string;
  shortDescription: string;
  requiredAction: string;
  dateAdded: string;
  dueDate: string | null;
  ransomwareUse: boolean;
}

export interface CopilotCitation {
  label: string;
  href: string;
}

export interface CopilotAnswer {
  ok: boolean;
  answer: string;
  mode: "local" | "ai";
  citations: CopilotCitation[];
  notice?: string;
  message?: string;
}
