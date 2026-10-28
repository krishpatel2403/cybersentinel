import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "../src/lib/db/client";
import { hashPassword } from "../src/lib/security/password";
import type { AssetType, Exposure, Severity } from "../src/types";

interface SeedAsset {
  name: string;
  hostname: string;
  ipAddress: string | null;
  type: AssetType;
  criticality: number;
  exposure: Exposure;
  owner: string;
  os: string;
  tags: string[];
}

interface SeedFinding {
  asset: string;
  title: string;
  description: string;
  severity: Severity;
  cvss: number | null;
  cveId: string | null;
  status: "open" | "in_progress" | "accepted_risk" | "resolved";
  remediation: string;
  daysAgo: number;
  resolvedDaysAgo: number | null;
  dueInDays: number | null;
}

const ASSETS: SeedAsset[] = [
  {
    name: "Production web frontend",
    hostname: "prod-web-01",
    ipAddress: "203.0.113.10",
    type: "web_app",
    criticality: 5,
    exposure: "internet",
    owner: "Platform team",
    os: "Ubuntu 24.04 LTS",
    tags: ["production", "pci"],
  },
  {
    name: "Production API",
    hostname: "prod-api-01",
    ipAddress: "203.0.113.11",
    type: "server",
    criticality: 5,
    exposure: "internet",
    owner: "Platform team",
    os: "Debian 12",
    tags: ["production", "api"],
  },
  {
    name: "Customer database",
    hostname: "customer-db-01",
    ipAddress: "10.20.4.15",
    type: "database",
    criticality: 5,
    exposure: "isolated",
    owner: "Data team",
    os: "PostgreSQL 16",
    tags: ["production", "pii"],
  },
  {
    name: "Edge VPN gateway",
    hostname: "edge-vpn-01",
    ipAddress: "203.0.113.20",
    type: "network",
    criticality: 4,
    exposure: "internet",
    owner: "Network team",
    os: "FortiOS 7.4",
    tags: ["vpn", "edge"],
  },
  {
    name: "Public asset storage",
    hostname: "aws-assets-prod",
    ipAddress: null,
    type: "cloud",
    criticality: 4,
    exposure: "internet",
    owner: "Cloud team",
    os: "AWS S3",
    tags: ["cloud", "storage"],
  },
  {
    name: "Finance laptop",
    hostname: "corp-laptop-042",
    ipAddress: "10.20.8.42",
    type: "workstation",
    criticality: 3,
    exposure: "internal",
    owner: "IT team",
    os: "Windows 11",
    tags: ["fleet", "finance"],
  },
  {
    name: "Staging website",
    hostname: "staging-web-02",
    ipAddress: "198.51.100.7",
    type: "web_app",
    criticality: 3,
    exposure: "internet",
    owner: "Platform team",
    os: "Ubuntu 22.04 LTS",
    tags: ["staging"],
  },
  {
    name: "HR file share",
    hostname: "hr-fileshare",
    ipAddress: "10.20.5.30",
    type: "server",
    criticality: 2,
    exposure: "internal",
    owner: "IT team",
    os: "Windows Server 2022",
    tags: ["file-share"],
  },
  {
    name: "CI runner",
    hostname: "ci-runner-03",
    ipAddress: "10.20.6.13",
    type: "server",
    criticality: 3,
    exposure: "internal",
    owner: "DevOps team",
    os: "Ubuntu 24.04 LTS",
    tags: ["cicd"],
  },
  {
    name: "Marketing CMS",
    hostname: "marketing-cms",
    ipAddress: "198.51.100.22",
    type: "web_app",
    criticality: 4,
    exposure: "internet",
    owner: "Marketing team",
    os: "WordPress 6.6",
    tags: ["cms", "public"],
  },
];

const FINDINGS: SeedFinding[] = [
  {
    asset: "prod-api-01",
    title: "Log4Shell vulnerable logging dependency",
    description:
      "The public API ships a Log4j2 version affected by CVE-2021-44228. Crafted JNDI lookups in logged headers can trigger remote code execution.",
    severity: "critical",
    cvss: 10,
    cveId: "CVE-2021-44228",
    status: "open",
    remediation:
      "Upgrade Log4j2 to a patched release, remove JndiLookup, and rotate any credentials reachable from the API host.",
    daysAgo: 2,
    resolvedDaysAgo: null,
    dueInDays: -1,
  },
  {
    asset: "marketing-cms",
    title: "Unauthenticated SQL injection in contact form",
    description:
      "The contact form concatenates a request parameter into a database query. A proof-of-concept payload returned table names in staging.",
    severity: "critical",
    cvss: 9.8,
    cveId: null,
    status: "open",
    remediation:
      "Replace string concatenation with parameterized queries, add input validation, and review the web server logs for exploitation attempts.",
    daysAgo: 5,
    resolvedDaysAgo: null,
    dueInDays: 1,
  },
  {
    asset: "aws-assets-prod",
    title: "Public bucket allows object listing",
    description:
      "The marketing asset bucket grants public list permissions. Object names expose campaign drafts and internal document prefixes.",
    severity: "high",
    cvss: 8.2,
    cveId: null,
    status: "open",
    remediation:
      "Disable public ACLs, remove the public list grant, and audit access logs for bulk object enumeration.",
    daysAgo: 4,
    resolvedDaysAgo: null,
    dueInDays: 3,
  },
  {
    asset: "edge-vpn-01",
    title: "Legacy TLS 1.0 still enabled on VPN portal",
    description:
      "The VPN management portal accepts TLS 1.0 connections and weak cipher suites. This enables downgrade attempts against remote users.",
    severity: "high",
    cvss: 7.4,
    cveId: null,
    status: "in_progress",
    remediation:
      "Disable TLS 1.0 and 1.1, require TLS 1.2 or newer, and validate that older clients have been upgraded.",
    daysAgo: 8,
    resolvedDaysAgo: null,
    dueInDays: 6,
  },
  {
    asset: "corp-laptop-042",
    title: "Missing Windows privilege escalation update",
    description:
      "The endpoint has not installed the latest cumulative update and is exposed to a known local privilege escalation issue.",
    severity: "high",
    cvss: 8.1,
    cveId: null,
    status: "open",
    remediation:
      "Deploy the current Windows cumulative update through the endpoint management platform and verify reboot completion.",
    daysAgo: 6,
    resolvedDaysAgo: null,
    dueInDays: 2,
  },
  {
    asset: "staging-web-02",
    title: "Default administrator credentials on staging",
    description:
      "The staging application still accepts the vendor default admin password. The staging site is reachable from the public internet.",
    severity: "high",
    cvss: 9.1,
    cveId: null,
    status: "open",
    remediation:
      "Change the password, restrict staging access to the office network or VPN, and disable the default account where possible.",
    daysAgo: 3,
    resolvedDaysAgo: null,
    dueInDays: 0,
  },
  {
    asset: "prod-web-01",
    title: "HTTP/2 Rapid Reset exposure",
    description:
      "The reverse proxy runs an HTTP/2 implementation affected by CVE-2023-44487. An unauthenticated attacker can cause resource exhaustion.",
    severity: "medium",
    cvss: 6.5,
    cveId: "CVE-2023-44487",
    status: "resolved",
    remediation: "Upgrade the reverse proxy and apply request stream rate limits at the edge.",
    daysAgo: 12,
    resolvedDaysAgo: 5,
    dueInDays: 7,
  },
  {
    asset: "ci-runner-03",
    title: "CI role has excessive cloud permissions",
    description:
      "The CI runner role can delete production storage buckets and read secrets for unrelated services. A compromised pipeline could cause broad damage.",
    severity: "medium",
    cvss: 6.1,
    cveId: null,
    status: "open",
    remediation:
      "Replace wildcard permissions with scoped actions on named resources, and split deploy permissions into a separate protected role.",
    daysAgo: 9,
    resolvedDaysAgo: null,
    dueInDays: 10,
  },
  {
    asset: "hr-fileshare",
    title: "SMB signing not required",
    description:
      "SMB signing is optional on the HR file server, leaving internal authentication traffic open to relay attacks.",
    severity: "medium",
    cvss: 5.3,
    cveId: null,
    status: "in_progress",
    remediation:
      "Require SMB signing through group policy and verify that legacy scanners still function.",
    daysAgo: 15,
    resolvedDaysAgo: null,
    dueInDays: 12,
  },
  {
    asset: "marketing-cms",
    title: "Marketing vendor account lacks MFA",
    description:
      "A shared vendor account with CMS editor access has no multi-factor authentication. The account password was last rotated over a year ago.",
    severity: "medium",
    cvss: 4.8,
    cveId: null,
    status: "open",
    remediation:
      "Require MFA for all CMS accounts, convert shared access to named accounts, and rotate the vendor password.",
    daysAgo: 7,
    resolvedDaysAgo: null,
    dueInDays: 14,
  },
  {
    asset: "staging-web-02",
    title: "Verbose application errors exposed",
    description:
      "Stack traces and environment variable names are returned to unauthenticated users when the staging application errors.",
    severity: "low",
    cvss: 3.1,
    cveId: null,
    status: "open",
    remediation:
      "Disable debug mode outside development and return a generic error page with a correlation identifier.",
    daysAgo: 10,
    resolvedDaysAgo: null,
    dueInDays: 30,
  },
  {
    asset: "prod-web-01",
    title: "Outdated SSH banner and algorithms",
    description:
      "The bastion-facing SSH service advertises older algorithms that are no longer recommended, although key authentication is enforced.",
    severity: "low",
    cvss: 2.8,
    cveId: null,
    status: "accepted_risk",
    remediation:
      "Plan an SSH configuration refresh in the next maintenance window; risk accepted temporarily because key-only auth and network ACLs are in place.",
    daysAgo: 20,
    resolvedDaysAgo: null,
    dueInDays: 45,
  },
  {
    asset: "customer-db-01",
    title: "Backup encryption verification completed",
    description:
      "Quarterly verification confirmed that encrypted database backups restore successfully and access is limited to the data team.",
    severity: "info",
    cvss: 0,
    cveId: null,
    status: "resolved",
    remediation: "No action required; keep the quarterly restore test on the calendar.",
    daysAgo: 30,
    resolvedDaysAgo: 14,
    dueInDays: null,
  },
  {
    asset: "edge-vpn-01",
    title: "PAN-OS GlobalProtect command injection exposure",
    description:
      "The edge gateway runs a PAN-OS release affected by CVE-2024-3400. An unauthenticated attacker could execute commands on the device.",
    severity: "high",
    cvss: 9.8,
    cveId: "CVE-2024-3400",
    status: "open",
    remediation:
      "Upgrade PAN-OS to a fixed release immediately. If maintenance is delayed, apply vendor mitigations and restrict management access.",
    daysAgo: 1,
    resolvedDaysAgo: null,
    dueInDays: 1,
  },
  {
    asset: "prod-web-01",
    title: "OpenSSL security update pending",
    description:
      "The web tier is one security patch behind the vendor's OpenSSL update. The current version has no known remotely exploitable issue in this configuration.",
    severity: "medium",
    cvss: 5.9,
    cveId: null,
    status: "in_progress",
    remediation:
      "Schedule the OpenSSL package update during the next maintenance window and confirm the load balancer health checks after restart.",
    daysAgo: 4,
    resolvedDaysAgo: null,
    dueInDays: 9,
  },
  {
    asset: "corp-laptop-042",
    title: "Unused local administrator account",
    description:
      "A local administrator account has not signed in for 180 days but remains enabled on the endpoint.",
    severity: "low",
    cvss: 2.1,
    cveId: null,
    status: "open",
    remediation:
      "Disable the stale account after confirming no support process depends on it, and add an exception review to the endpoint baseline.",
    daysAgo: 25,
    resolvedDaysAgo: null,
    dueInDays: 30,
  },
  {
    asset: "ci-runner-03",
    title: "Shared database credentials used by CI jobs",
    description:
      "Multiple deployment jobs share a single database account with broad write access. Credential rotation requires coordinated downtime.",
    severity: "high",
    cvss: 7,
    cveId: null,
    status: "open",
    remediation:
      "Create per-environment accounts with least privilege, move credentials to the secret manager, and rotate the shared password.",
    daysAgo: 11,
    resolvedDaysAgo: null,
    dueInDays: 7,
  },
];

interface SeedEventTemplate {
  source: string;
  eventType: string;
  severity: Severity;
  message: (asset: string) => string;
}

const EVENT_TEMPLATES: SeedEventTemplate[] = [
  {
    source: "EDR",
    eventType: "Malware quarantined",
    severity: "high",
    message: (asset) =>
      `Quarantined a suspicious executable on ${asset} after an outbound connection was blocked.`,
  },
  {
    source: "Identity",
    eventType: "Failed login burst",
    severity: "medium",
    message: (asset) =>
      `Blocked 23 failed sign-ins from an unfamiliar address for an account with access to ${asset}.`,
  },
  {
    source: "Firewall",
    eventType: "Blocked scan",
    severity: "low",
    message: (asset) =>
      `Blocked a port scan targeting ${asset} from a hosting provider address range.`,
  },
  {
    source: "WAF",
    eventType: "Injection attempt blocked",
    severity: "high",
    message: (asset) =>
      `Blocked a SQL injection payload aimed at ${asset}; repeat attempts came from three source addresses.`,
  },
  {
    source: "Identity",
    eventType: "MFA enabled",
    severity: "info",
    message: (asset) =>
      `MFA enrollment completed for a privileged account with access to ${asset}.`,
  },
  {
    source: "Scanner",
    eventType: "Scan completed",
    severity: "info",
    message: (asset) =>
      `Weekly authenticated scan of ${asset} completed; results are available for triage.`,
  },
  {
    source: "EDR",
    eventType: "Suspicious PowerShell",
    severity: "medium",
    message: (asset) =>
      `Terminated an encoded PowerShell process on ${asset} and queued the file for analysis.`,
  },
  {
    source: "Firewall",
    eventType: "C2 beacon blocked",
    severity: "high",
    message: (asset) =>
      `Blocked periodic outbound traffic from ${asset} to a known command-and-control indicator.`,
  },
  {
    source: "WAF",
    eventType: "Credential stuffing mitigated",
    severity: "low",
    message: (asset) =>
      `Rate limiting engaged during credential stuffing traffic against ${asset}.`,
  },
  {
    source: "Scanner",
    eventType: "Configuration drift",
    severity: "medium",
    message: (asset) => `Detected configuration drift from the approved baseline on ${asset}.`,
  },
];

const EVENT_ASSETS = [
  "prod-web-01",
  "prod-api-01",
  "edge-vpn-01",
  "corp-laptop-042",
  "staging-web-02",
  "marketing-cms",
  "ci-runner-03",
  "hr-fileshare",
];

function isoDaysAgo(days: number, now: number): string {
  return new Date(now - days * 86_400_000).toISOString();
}

function isoHoursAgo(hours: number, now: number): string {
  return new Date(now - hours * 3_600_000).toISOString();
}

export interface SeedOptions {
  reset?: boolean;
}

export interface SeedResult {
  seeded: boolean;
  reason?: string;
  adminEmail?: string;
  analystEmail?: string;
  demoPasswords?: boolean;
}

export async function seedDatabase(options: SeedOptions = {}): Promise<SeedResult> {
  await ensureDatabase();
  const db = getDb();
  const existing = await db.execute("SELECT COUNT(*) AS count FROM users");
  const userCount = Number(existing.rows[0]?.count ?? 0);

  if (userCount > 0 && !options.reset) {
    return {
      seeded: false,
      reason: "Database already contains users. Use `npm run db:reset` to rebuild sample data.",
    };
  }

  if (userCount > 0 && options.reset) {
    await db.batch(
      [
        "DELETE FROM audit_logs",
        "DELETE FROM sessions",
        "DELETE FROM findings",
        "DELETE FROM events",
        "DELETE FROM assets",
        "DELETE FROM users",
      ],
      "write",
    );
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@cybersentinel.dev")
    .trim()
    .toLowerCase();
  const analystEmail = (process.env.SEED_ANALYST_EMAIL || "analyst@cybersentinel.dev")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "DemoAdmin!2026";
  const analystPassword = process.env.SEED_ANALYST_PASSWORD || "DemoAnalyst!2026";

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_ANALYST_PASSWORD)
  ) {
    throw new Error(
      "Set SEED_ADMIN_PASSWORD and SEED_ANALYST_PASSWORD before seeding in production.",
    );
  }
  if (adminPassword.length < 12 || analystPassword.length < 12) {
    throw new Error("Seed passwords must be at least 12 characters.");
  }

  const adminId = randomUUID();
  const analystId = randomUUID();
  const adminHash = await hashPassword(adminPassword);
  const analystHash = await hashPassword(analystPassword);

  const assetIds = new Map<string, string>();
  for (const asset of ASSETS) {
    assetIds.set(asset.hostname, randomUUID());
  }

  const statements: Array<{ sql: string; args: Array<string | number | null> }> = [];

  statements.push(
    {
      sql: `INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at, last_login_at)
            VALUES (?, ?, ?, 'admin', ?, ?, ?, ?)`,
      args: [
        adminId,
        adminEmail,
        "Ava Chen",
        adminHash,
        isoDaysAgo(90, now),
        nowIso,
        isoHoursAgo(6, now),
      ],
    },
    {
      sql: `INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at, last_login_at)
            VALUES (?, ?, ?, 'analyst', ?, ?, ?, ?)`,
      args: [
        analystId,
        analystEmail,
        "Marcus Reed",
        analystHash,
        isoDaysAgo(60, now),
        nowIso,
        isoHoursAgo(20, now),
      ],
    },
  );

  for (const asset of ASSETS) {
    const id = assetIds.get(asset.hostname);
    statements.push({
      sql: `INSERT INTO assets (id, name, hostname, ip_address, type, criticality, exposure, owner, os, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id ?? randomUUID(),
        asset.name,
        asset.hostname,
        asset.ipAddress,
        asset.type,
        asset.criticality,
        asset.exposure,
        asset.owner,
        asset.os,
        JSON.stringify(asset.tags),
        isoDaysAgo(120, now),
        isoDaysAgo(2, now),
      ],
    });
  }

  for (const finding of FINDINGS) {
    const assetId = assetIds.get(finding.asset);
    if (!assetId) throw new Error(`Seed finding references unknown asset ${finding.asset}`);
    const createdAt = isoDaysAgo(finding.daysAgo, now);
    const resolvedAt =
      finding.resolvedDaysAgo !== null ? isoDaysAgo(finding.resolvedDaysAgo, now) : null;
    const dueDate =
      finding.dueInDays !== null
        ? new Date(now + finding.dueInDays * 86_400_000).toISOString().slice(0, 10)
        : null;

    statements.push({
      sql: `INSERT INTO findings
            (id, asset_id, title, description, severity, cvss, cve_id, status, source, remediation,
             due_date, created_at, updated_at, resolved_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seed', ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        assetId,
        finding.title,
        finding.description,
        finding.severity,
        finding.cvss,
        finding.cveId,
        finding.status,
        finding.remediation,
        dueDate,
        createdAt,
        resolvedAt ?? createdAt,
        resolvedAt,
        adminId,
      ],
    });
  }

  for (let index = 0; index < 36; index += 1) {
    const template = EVENT_TEMPLATES[index % EVENT_TEMPLATES.length] ?? EVENT_TEMPLATES[0]!;
    const hostname = EVENT_ASSETS[index % EVENT_ASSETS.length] ?? "prod-web-01";
    const assetId = assetIds.get(hostname) ?? null;
    const hoursAgo = 0.6 + index * 4.1;
    statements.push({
      sql: `INSERT INTO events (id, source, event_type, severity, message, asset_id, occurred_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        template.source,
        template.eventType,
        template.severity,
        template.message(hostname),
        assetId,
        isoHoursAgo(hoursAgo, now),
        nowIso,
      ],
    });
  }

  const auditEntries = [
    [
      "finding.status_changed",
      "finding",
      "Moved HTTP/2 Rapid Reset exposure to resolved after proxy upgrade.",
    ],
    ["finding.created", "finding", "Recorded PAN-OS exposure after advisory review."],
    ["asset.updated", "asset", "Updated exposure label for staging website."],
    [
      "copilot.question_answered",
      "copilot",
      "Answered remediation prioritization question in local mode.",
    ],
    ["events.simulated", "event", "Generated sample telemetry for dashboard demonstration."],
    ["auth.login", "session", "Administrator signed in."],
  ] as const;

  for (const [action, entityType, detail] of auditEntries) {
    statements.push({
      sql: `INSERT INTO audit_logs (id, user_id, actor_email, action, entity_type, entity_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        adminId,
        adminEmail,
        action,
        entityType,
        null,
        JSON.stringify({ note: detail }),
        isoHoursAgo(12, now),
      ],
    });
  }

  await db.batch(statements, "write");

  return {
    seeded: true,
    adminEmail,
    analystEmail,
    demoPasswords: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  };
}
