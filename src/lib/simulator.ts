import { randomInt } from "node:crypto";
import type { Asset } from "@/types";
import type { EventInput } from "@/lib/repositories/events";

interface EventTemplate {
  source: string;
  eventType: string;
  severity: EventInput["severity"];
  message: (assetName: string) => string;
}

const TEMPLATES: EventTemplate[] = [
  {
    source: "EDR",
    eventType: "Malware quarantined",
    severity: "high",
    message: (asset) =>
      `Quarantined a suspicious executable on ${asset} after a blocked outbound connection.`,
  },
  {
    source: "Identity",
    eventType: "Failed login burst",
    severity: "medium",
    message: (asset) =>
      `Detected 18 failed sign-ins for a service account associated with ${asset}.`,
  },
  {
    source: "Firewall",
    eventType: "Blocked scan",
    severity: "low",
    message: (asset) => `Blocked a port scan against ${asset} from an external address.`,
  },
  {
    source: "WAF",
    eventType: "Injection attempt",
    severity: "high",
    message: (asset) => `Blocked a SQL injection payload targeting ${asset}.`,
  },
  {
    source: "Identity",
    eventType: "MFA enabled",
    severity: "info",
    message: (asset) => `MFA enrollment completed for an administrator with access to ${asset}.`,
  },
  {
    source: "Scanner",
    eventType: "Scan completed",
    severity: "info",
    message: (asset) =>
      `Weekly vulnerability scan of ${asset} finished with new findings queued for triage.`,
  },
  {
    source: "EDR",
    eventType: "Suspicious PowerShell",
    severity: "medium",
    message: (asset) =>
      `Observed encoded PowerShell execution on ${asset}; process was terminated.`,
  },
  {
    source: "Firewall",
    eventType: "Beaconing blocked",
    severity: "high",
    message: (asset) =>
      `Blocked periodic outbound traffic from ${asset} to a known command-and-control indicator.`,
  },
  {
    source: "WAF",
    eventType: "Rate limit triggered",
    severity: "low",
    message: (asset) => `Rate limiter engaged for credential stuffing traffic against ${asset}.`,
  },
  {
    source: "Scanner",
    eventType: "TLS configuration drift",
    severity: "medium",
    message: (asset) => `Detected a weakened TLS configuration on ${asset}.`,
  },
];

/**
 * Generates clearly-labeled simulator telemetry. This is not a real sensor feed
 * and must never be presented as evidence of a live intrusion.
 */
export function generateSampleEvents(assets: Asset[], count = 6, now = Date.now()): EventInput[] {
  const safeAssets = assets.length > 0 ? assets : [];
  return Array.from({ length: count }, () => {
    const template = TEMPLATES[randomInt(0, TEMPLATES.length)] ?? TEMPLATES[0]!;
    const asset = safeAssets.length > 0 ? safeAssets[randomInt(0, safeAssets.length)] : null;
    const assetName = asset?.name ?? "an unassigned asset";
    return {
      source: template.source,
      eventType: template.eventType,
      severity: template.severity,
      message: template.message(assetName),
      assetId: asset?.id ?? null,
      occurredAt: new Date(now - randomInt(2, 180) * 60_000).toISOString(),
    };
  }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
