import type { PostureSnapshot } from "@/lib/services/analytics";
import type { Exposure, Severity } from "@/types";

export interface AnalystFinding {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  cveId: string | null;
  assetName: string;
  assetHostname: string;
  exposure: Exposure;
  remediation: string;
}

export interface AnalystAsset {
  name: string;
  hostname: string;
  exposure: Exposure;
  criticality: number;
  riskScore: number;
  openFindings: number;
  criticalFindings: number;
}

export interface AnalystEvent {
  source: string;
  eventType: string;
  severity: Severity;
  message: string;
  occurredAt: string;
  assetName: string | null;
}

export interface AnalystContext {
  securityScore: number;
  grade: string;
  scoreDelta: number;
  weightedRisk: number;
  severityCounts: Record<Severity, number>;
  openFindings: number;
  criticalHigh: number;
  totalAssets: number;
  internetExposed: number;
  exposedAtRisk: number;
  mttrDays: number | null;
  events24h: number;
  topAssets: AnalystAsset[];
  exposedAssets: AnalystAsset[];
  topFindings: AnalystFinding[];
  criticalFindings: AnalystFinding[];
  recentEvents: AnalystEvent[];
}

export function buildAnalystContext(snapshot: PostureSnapshot): AnalystContext {
  const toFinding = (finding: PostureSnapshot["activeFindings"][number]): AnalystFinding => ({
    id: finding.id,
    title: finding.title,
    severity: finding.severity,
    status: finding.status,
    cveId: finding.cveId,
    assetName: finding.assetName,
    assetHostname: finding.assetHostname,
    exposure: finding.assetExposure,
    remediation: finding.remediation,
  });

  const toAsset = (asset: PostureSnapshot["assets"][number]): AnalystAsset => ({
    name: asset.name,
    hostname: asset.hostname,
    exposure: asset.exposure,
    criticality: asset.criticality,
    riskScore: asset.riskScore,
    openFindings: asset.openFindings,
    criticalFindings: asset.criticalFindings,
  });

  const rankedFindings = snapshot.activeFindings.map(toFinding);

  return {
    securityScore: snapshot.score.securityScore,
    grade: snapshot.score.grade,
    scoreDelta: snapshot.scoreDelta,
    weightedRisk: snapshot.score.weightedRisk,
    severityCounts: snapshot.severityCounts,
    openFindings: snapshot.stats.openFindings,
    criticalHigh: snapshot.stats.criticalHigh,
    totalAssets: snapshot.stats.totalAssets,
    internetExposed: snapshot.stats.internetExposed,
    exposedAtRisk: snapshot.stats.exposedAtRisk,
    mttrDays: snapshot.mttrDays,
    events24h: snapshot.stats.events24h,
    topAssets: snapshot.topAssets.map(toAsset),
    exposedAssets: snapshot.assets
      .filter((asset) => asset.exposure === "internet")
      .slice(0, 6)
      .map(toAsset),
    topFindings: rankedFindings.slice(0, 8),
    criticalFindings: rankedFindings
      .filter((finding) => finding.severity === "critical")
      .slice(0, 6),
    recentEvents: snapshot.recentEvents.map((event) => ({
      source: event.source,
      eventType: event.eventType,
      severity: event.severity,
      message: event.message,
      occurredAt: event.occurredAt,
      assetName: event.assetName,
    })),
  };
}
